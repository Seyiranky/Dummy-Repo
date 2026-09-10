import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Steps,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { skillTaskApi } from '../../api/skillTaskApi';
import { transactionApi } from '../../api/transactionApi';
import { userApi } from '../../api/userApi';
import { adminApi } from '../../api/adminApi';
import { LineChart, PieChart } from '../common/charts';
import PageContainer from '../Layout/PageContainer';
import IdentityLink from '../common/IdentityLink';
import StatusTag from '../common/StatusTag';
import SkillVerificationForm from '../Verification/SkillVerificationForm';
import AdminReviewQueue from '../Verification/AdminReviewQueue';
import GigApprovalQueue from '../Admin/GigApprovalQueue';
import type { Gig, SkillTask, Transaction, UserSkill } from '../../types';

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const matches = useAppSelector((state) => state.matches.items);
  const [tasks, setTasks] = useState<SkillTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<UserSkill[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [modal, setModal] = useState<'skill' | 'review' | 'gig' | null>(null);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const refreshTasks = () => {
    skillTaskApi.listTasks(role === 'admin' ? { assignedToMe: true } : undefined).then(setTasks);
  };
  const refreshGigs = () => {
    adminApi.listGigs().then(setGigs);
  };

  useEffect(() => {
    if (role === 'worker' || role === 'admin') refreshTasks();
    if (role === 'worker' || role === 'client') transactionApi.listTransactions().then(setTransactions);
    if (role === 'admin') refreshGigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role === 'worker' && profile) userApi.getUserSkills(profile.id).then(setVerifiedSkills);
  }, [role, profile]);

  const pendingReviews = tasks.filter((x) => x.status === 'pending');
  const decidedReviews = tasks.filter((x) => x.status !== 'pending');
  const pendingGigs = gigs.filter((g) => g.status === 'pending_review');
  const activeMatches = matches.filter(
    (m) => m.status === 'pending' || m.status === 'accepted',
  ).length;
  const confirmedTotal = transactions
    .filter((x) => x.status === 'confirmed')
    .reduce((sum, x) => sum + Number(x.amount), 0);
  const needsLocation =
    role === 'worker' && (profile?.locationLat == null || profile?.locationLng == null);

  const earningsSeries = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const tx of transactions.filter((x) => x.status === 'confirmed')) {
      const day = new Date(tx.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(tx.amount));
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, y]) => ({ x: day.slice(5), y }));
  }, [transactions]);

  const matchStatusSlices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) counts.set(m.status, (counts.get(m.status) ?? 0) + 1);
    return [...counts.entries()].map(([type, value]) => ({ type, value }));
  }, [matches]);

  if (!profile) return null;

  const isEarner = role === 'worker' || role === 'client';
  const showCharts = isEarner && (earningsSeries.length >= 2 || matchStatusSlices.length > 0);

  const kpi = (title: string, value: number | string, suffix?: string, accent?: string) => (
    <Col xs={12} lg={8}>
      <Card size="small" style={{ height: '100%' }}>
        <Statistic title={title} value={value} suffix={suffix} valueStyle={accent ? { color: accent } : undefined} />
      </Card>
    </Col>
  );

  return (
    <PageContainer
      title={t('dashboard.welcome', { name: profile.name })}
      subtitle={<span style={{ textTransform: 'capitalize' }}>{profile.role}</span>}
    >
      {needsLocation && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
          message={
            <>
              {t('dashboard.locationPromptBefore')} <Link to="/settings">{t('sidebar.settings')}</Link>{' '}
              {t('dashboard.locationPromptAfter')}
            </>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {isEarner ? (
          <>
            <Col xs={12} lg={8}>
              <Card size="small" style={{ height: '100%' }}>
                <Statistic title={t('dashboard.trustScore')} value={profile.trustScore.toFixed(1)} suffix="/ 5" />
                <Progress
                  percent={Math.round((profile.trustScore / 5) * 100)}
                  showInfo={false}
                  size="small"
                  strokeColor="#18181b"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            {kpi(role === 'client' ? t('dashboard.totalPaid') : t('dashboard.totalEarned'), confirmedTotal, 'RWF')}
            {kpi(t('dashboard.activeMatches'), activeMatches)}
          </>
        ) : (
          <>
            {kpi(t('dashboard.pendingReviews'), pendingReviews.length)}
            {kpi(t('dashboard.reviewsCompleted'), decidedReviews.length)}
            {kpi(
              t('dashboard.pendingGigApprovals'),
              pendingGigs.length,
              undefined,
              pendingGigs.length ? '#b45309' : undefined,
            )}
          </>
        )}
      </Row>

      {showCharts && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={role === 'client' ? t('dashboard.totalPaid') : t('dashboard.totalEarned')}
              styles={{ body: { minHeight: 140 } }}
            >
              {earningsSeries.length >= 2 ? (
                <LineChart data={earningsSeries} height={220} />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.noMatchesYet')} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title={t('dashboard.yourMatches')} styles={{ body: { minHeight: 140 } }}>
              {matchStatusSlices.length > 0 ? (
                <PieChart data={matchStatusSlices} height={220} />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.noMatchesYet')} />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {role === 'admin' ? (
          <>
            <Col xs={24} lg={12}>
              <Card
                title={t('dashboard.skillReviews')}
                extra={
                  <Button type="link" onClick={() => setModal('review')}>
                    {t('dashboard.reviewSubmissions')}
                  </Button>
                }
                style={{ height: '100%' }}
              >
                {pendingReviews.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.nothingToReview')} />
                ) : (
                  <List
                    size="small"
                    dataSource={pendingReviews.slice(0, 5)}
                    renderItem={(task) => (
                      <List.Item>
                        <List.Item.Meta
                          title={task.skill?.name}
                          description={
                            task.worker ? (
                              <IdentityLink id={task.worker.id} name={task.worker.name} size={18} />
                            ) : null
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={t('dashboard.gigApprovals')}
                extra={
                  <Button type="link" onClick={() => setModal('gig')}>
                    {t('dashboard.reviewSubmissions')}
                  </Button>
                }
                style={{ height: '100%' }}
              >
                {pendingGigs.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.nothingToReview')} />
                ) : (
                  <List
                    size="small"
                    dataSource={pendingGigs.slice(0, 5)}
                    renderItem={(gig) => (
                      <List.Item>
                        <List.Item.Meta
                          title={gig.title}
                          description={
                            gig.client ? (
                              <IdentityLink id={gig.client.id} name={gig.client.name} size={18} />
                            ) : null
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </>
        ) : (
          <>
            <Col xs={24} lg={role === 'worker' ? 15 : 24}>
              <Card
                title={t('dashboard.yourMatches')}
                style={{ height: '100%' }}
                styles={{ body: { paddingBlock: matches.length ? 0 : 24 } }}
              >
                {matches.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <>
                        {t('dashboard.noMatchesYet')}{' '}
                        <Link to="/marketplace">{t('dashboard.goToMarketplace')}</Link>
                      </>
                    }
                  />
                ) : (
                  <List
                    dataSource={matches.slice(0, 6)}
                    renderItem={(match) => {
                      const counterparty = role === 'client' ? match.worker : match.gig?.client;
                      return (
                        <List.Item actions={[<StatusTag key="s" status={match.status} />]}>
                          <List.Item.Meta
                            title={<Link to={`/gigs/${match.gigId}`}>{match.gig?.title ?? 'Gig'}</Link>}
                            description={
                              counterparty ? (
                                <IdentityLink id={counterparty.id} name={counterparty.name} size={20} />
                              ) : null
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            </Col>

            {role === 'worker' && (
              <Col xs={24} lg={9}>
                <Card
                  title={t('dashboard.skills')}
                  extra={
                    <Button type="link" icon={<PlusOutlined />} onClick={() => setModal('skill')}>
                      {t('dashboard.addNewSkill')}
                    </Button>
                  }
                  style={{ height: '100%' }}
                >
                  {verifiedSkills.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.noVerifiedSkills')} />
                  ) : (
                    <Space size={[8, 8]} wrap>
                      {verifiedSkills.map((us) => (
                        <Tag
                          key={us.id}
                          style={{ padding: '5px 12px', fontSize: 13, borderRadius: 4 }}
                        >
                          {us.skill?.name}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </Card>
              </Col>
            )}
          </>
        )}
      </Row>

      {isEarner && matches.length === 0 && (
        <Card title={t('dashboard.getStarted')} style={{ marginTop: 16 }}>
          <Steps
            direction="vertical"
            size="small"
            current={role === 'worker' ? (verifiedSkills.length ? 1 : 0) : 0}
            items={
              role === 'worker'
                ? [
                    { title: t('dashboard.submitSkillTask'), description: t('dashboard.workerGetStartedAfter') },
                    { title: t('dashboard.openGigsLink'), description: t('dashboard.goToMarketplace') },
                  ]
                : [{ title: t('dashboard.clientGetStarted'), description: t('dashboard.goToMarketplace') }]
            }
          />
        </Card>
      )}

      <Modal open={modal === 'skill'} title={t('dashboard.addSkillModalTitle')} footer={null} onCancel={() => setModal(null)} destroyOnHidden>
        <SkillVerificationForm tasks={tasks} onSubmitted={refreshTasks} />
      </Modal>
      <Modal open={modal === 'review'} title={t('dashboard.skillReviewModalTitle')} footer={null} width={640} onCancel={() => setModal(null)} destroyOnHidden>
        <AdminReviewQueue tasks={tasks} onReviewed={refreshTasks} />
      </Modal>
      <Modal open={modal === 'gig'} title={t('dashboard.gigApprovalModalTitle')} footer={null} width={640} onCancel={() => setModal(null)} destroyOnHidden>
        <GigApprovalQueue gigs={gigs} onReviewed={refreshGigs} />
      </Modal>
    </PageContainer>
  );
};

export default Dashboard;
