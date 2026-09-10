import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Result,
  Row,
  Skeleton,
  Space,
  Steps,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../../store/hooks';
import { gigApi } from '../../api/gigApi';
import { gigApplicationApi } from '../../api/gigApplicationApi';
import { adminApi } from '../../api/adminApi';
import PageContainer from '../Layout/PageContainer';
import IdentityLink from '../common/IdentityLink';
import GigThumbnail from '../common/GigThumbnail';
import StatusTag from '../common/StatusTag';
import ChatThread from '../common/ChatThread';
import { locationName } from '../../utils/locationName';
import type { Gig, GigApplication } from '../../types';

const GigDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { role, profile } = useAppSelector((state) => state.auth);
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const refresh = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([gigApi.getGig(id), gigApplicationApi.listApplications({ gigId: id })])
      .then(([gigData, applicationsData]) => {
        setGig(gigData);
        setApplications(applicationsData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!gig)
    return <Result status="404" title={t('marketplace.gigDetail.notFound')} />;

  const isOwner = role === 'client' && profile?.id === gig.clientId;
  const myApplication =
    role === 'worker' ? applications.find((a) => a.workerId === profile?.id) : undefined;
  const sortedApplicants = [...applications].sort(
    (a, b) => (b.worker?.trustScore ?? 0) - (a.worker?.trustScore ?? 0),
  );

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await gigApplicationApi.applyToGig(id);
      refresh();
    } finally {
      setApplying(false);
    }
  };

  const handleGigDecision = async (decision: 'approved' | 'rejected') => {
    if (!id) return;
    setBusyId(id);
    try {
      await adminApi.reviewGig(id, decision);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleApplicationDecision = async (
    applicationId: string,
    decision: 'approved' | 'rejected',
  ) => {
    setBusyId(applicationId);
    try {
      await gigApplicationApi.reviewApplication(applicationId, decision);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const applicantColumns: ColumnsType<GigApplication> = [
    {
      title: 'Worker',
      key: 'worker',
      render: (_, a) =>
        a.worker ? <IdentityLink id={a.worker.id} name={a.worker.name} size={26} /> : '—',
    },
    {
      title: 'Trust',
      key: 'trust',
      width: 90,
      render: (_, a) => a.worker?.trustScore.toFixed(1) ?? '—',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, a) => <StatusTag status={a.status} />,
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, a) =>
        role === 'admin' && a.status === 'pending' ? (
          <Space>
            <Button
              size="small"
              type="primary"
              loading={busyId === a.id}
              onClick={() => handleApplicationDecision(a.id, 'approved')}
            >
              {t('marketplace.gigDetail.approve')}
            </Button>
            <Button
              size="small"
              danger
              loading={busyId === a.id}
              onClick={() => handleApplicationDecision(a.id, 'rejected')}
            >
              {t('marketplace.gigDetail.reject')}
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <PageContainer
      title={
        <Flex align="center" gap={12}>
          <GigThumbnail gig={gig} size={40} />
          <span>{gig.title}</span>
        </Flex>
      }
      extra={<StatusTag status={gig.status} />}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={role === 'worker' && gig.client ? 15 : 24}>
          <Card>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label={t('marketplace.gigDetail.postedBy')}>
                {gig.client ? (
                  <IdentityLink id={gig.client.id} name={gig.client.name} size={22} />
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Category">{gig.skill?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Location">
                {locationName(gig.locationLat, gig.locationLng) ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Budget">
                {Number(gig.budget).toLocaleString()} RWF
              </Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
              {gig.description}
            </Typography.Paragraph>
          </Card>

          {isOwner && gig.status === 'pending_review' && (
            <Card style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">
                {t('marketplace.gigDetail.pendingReviewNotice')}
              </Typography.Text>
            </Card>
          )}
          {isOwner && gig.status === 'rejected' && (
            <Card style={{ marginTop: 16 }}>
              <Typography.Text type="danger">
                {t('marketplace.gigDetail.rejectedNotice')}
              </Typography.Text>
            </Card>
          )}

          {role === 'admin' && gig.status === 'pending_review' && (
            <Card style={{ marginTop: 16 }} title={t('marketplace.gigDetail.approveThisGig')}>
              <Typography.Paragraph type="secondary">
                {t('marketplace.gigDetail.approveInstructions')}
              </Typography.Paragraph>
              <Space>
                <Button
                  type="primary"
                  loading={busyId === id}
                  onClick={() => handleGigDecision('approved')}
                >
                  {t('marketplace.gigDetail.approve')}
                </Button>
                <Button danger loading={busyId === id} onClick={() => handleGigDecision('rejected')}>
                  {t('marketplace.gigDetail.reject')}
                </Button>
              </Space>
            </Card>
          )}

          {role === 'worker' && (
            <Card style={{ marginTop: 16 }} title={t('marketplace.gigDetail.yourApplication')}>
              {myApplication ? (
                <Steps
                  size="small"
                  current={
                    myApplication.status === 'approved'
                      ? 2
                      : myApplication.status === 'rejected'
                        ? 1
                        : 1
                  }
                  status={myApplication.status === 'rejected' ? 'error' : 'process'}
                  items={[
                    { title: 'Applied' },
                    { title: 'Under review' },
                    { title: 'Approved' },
                  ]}
                />
              ) : gig.status === 'open' ? (
                <Button type="primary" loading={applying} onClick={handleApply}>
                  {t('marketplace.gigDetail.applyButton')}
                </Button>
              ) : (
                <Typography.Text type="secondary">
                  {gig.status === 'pending_review'
                    ? t('marketplace.gigDetail.awaitingApprovalNotice')
                    : t('marketplace.gigDetail.noLongerAcceptingNotice')}
                </Typography.Text>
              )}
            </Card>
          )}

          {(role === 'admin' || isOwner) && (
            <Card
              style={{ marginTop: 16 }}
              title={t('marketplace.gigDetail.applicants', { count: applications.length })}
            >
              {applications.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('marketplace.gigDetail.noApplicationsYet')}
                />
              ) : (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={applicantColumns}
                  dataSource={sortedApplicants}
                />
              )}
            </Card>
          )}
        </Col>

        {role === 'worker' && gig.client && (
          <Col xs={24} lg={9}>
            <Card
              title={t('marketplace.gigDetail.messageClient')}
              style={{ position: 'sticky', top: 88 }}
            >
              <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
                {t('marketplace.gigDetail.messageClientHint', { name: gig.client.name })}
              </Typography.Paragraph>
              <ChatThread
                recipientId={gig.client.id}
                recipientName={gig.client.name}
                placeholder={t('marketplace.gigDetail.messagePlaceholder', {
                  name: gig.client.name,
                })}
                emptyText={t('marketplace.gigDetail.messageEmpty')}
              />
            </Card>
          </Col>
        )}
      </Row>
    </PageContainer>
  );
};

export default GigDetail;
