import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Col, Empty, Flex, Row, Skeleton, Switch, Tooltip, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { distanceKm } from '../../utils/distance';
import GigCard from './GigCard';

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
          {[0, 1, 2, 3].map((i) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={i}>
              <Card cover={<div style={{ aspectRatio: '4 / 3', background: '#f4f4f5' }} />}>
                <Skeleton active paragraph={{ rows: 2 }} />
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
            <Col xs={24} sm={12} lg={8} xl={6} key={gig.id}>
              <GigCard
                gig={gig}
                footNote={
                  sortByDistance
                    ? t('marketplace.gigFeed.distanceAway', {
                        distance: distanceKm(
                          workerLat!,
                          workerLng!,
                          gig.locationLat,
                          gig.locationLng,
                        ).toFixed(1),
                      })
                    : undefined
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default GigFeed;
