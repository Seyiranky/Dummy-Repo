import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Col, Empty, Flex, Row, Skeleton, Switch, Tooltip, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { locationName } from '../../utils/locationName';
import { distanceKm } from '../../utils/distance';
import GigThumbnail from '../common/GigThumbnail';
import StatusTag from '../common/StatusTag';

const GigFeed = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { role, profile } = useAppSelector((state) => state.auth);
  const gigs = useAppSelector((state) => state.gigs.items);
  const status = useAppSelector((state) => state.gigs.status);
  const [nearMe, setNearMe] = useState(false);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const workerLat = role === 'worker' ? profile?.locationLat : null;
  const workerLng = role === 'worker' ? profile?.locationLng : null;
  const hasWorkerLocation = workerLat != null && workerLng != null;
  const sortByDistance = nearMe && hasWorkerLocation;

  let visibleGigs =
    role === 'client' && profile
      ? gigs.filter((gig) => gig.clientId === profile.id)
      : gigs.filter((gig) => gig.status === 'open');

  if (sortByDistance) {
    visibleGigs = [...visibleGigs].sort(
      (a, b) =>
        distanceKm(workerLat!, workerLng!, a.locationLat, a.locationLng) -
        distanceKm(workerLat!, workerLng!, b.locationLat, b.locationLng),
    );
  }

  return (
    <div>
      {role === 'worker' && (
        <Flex align="center" gap={10} style={{ marginBottom: 16 }}>
          <Tooltip title={!hasWorkerLocation ? t('marketplace.gigFeed.setLocationHint') : undefined}>
            <Switch
              size="small"
              checked={nearMe}
              disabled={!hasWorkerLocation}
              onChange={setNearMe}
            />
          </Tooltip>
          <Typography.Text type={hasWorkerLocation ? undefined : 'secondary'}>
            {t('marketplace.gigFeed.nearMe')}
          </Typography.Text>
        </Flex>
      )}

      {status === 'loading' ? (
        <Row gutter={[16, 16]}>
          {[0, 1, 2].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      ) : visibleGigs.length === 0 ? (
        <Card>
          <Empty description={t('marketplace.gigFeed.empty')} />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {visibleGigs.map((gig) => (
            <Col xs={24} sm={12} lg={8} key={gig.id}>
              <Card hoverable style={{ height: '100%' }} styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, height: '100%' } }}>
                <Flex gap={12} align="flex-start">
                  <GigThumbnail gig={gig} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text strong ellipsis style={{ display: 'block' }}>
                      {gig.title}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {gig.skill?.name}
                      {locationName(gig.locationLat, gig.locationLng) &&
                        ` · ${locationName(gig.locationLat, gig.locationLng)}`}
                      {sortByDistance &&
                        ` · ${t('marketplace.gigFeed.distanceAway', {
                          distance: distanceKm(
                            workerLat!,
                            workerLng!,
                            gig.locationLat,
                            gig.locationLng,
                          ).toFixed(1),
                        })}`}
                    </Typography.Text>
                  </div>
                </Flex>
                <Typography.Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ margin: 0, fontSize: 13 }}
                >
                  {gig.description}
                </Typography.Paragraph>
                <Flex justify="space-between" align="center" style={{ marginTop: 'auto' }}>
                  <Typography.Text strong>
                    {Number(gig.budget).toLocaleString()} RWF
                  </Typography.Text>
                  <StatusTag status={gig.status} />
                </Flex>
                <Link to={`/gigs/${gig.id}`}>{t('marketplace.gigFeed.viewDetails')} →</Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default GigFeed;
