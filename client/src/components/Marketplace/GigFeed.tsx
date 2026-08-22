import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { statusBadgeClass } from '../../utils/statusBadge';
import { locationName } from '../../utils/locationName';
import { distanceKm } from '../../utils/distance';
import GigThumbnail from '../common/GigThumbnail';

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
        <div className="gig-feed-controls">
          <label className="gig-feed-near-me" title={!hasWorkerLocation ? t('marketplace.gigFeed.setLocationHint') : undefined}>
            <input
              type="checkbox"
              checked={nearMe}
              onChange={(e) => setNearMe(e.target.checked)}
              disabled={!hasWorkerLocation}
            />
            {t('marketplace.gigFeed.nearMe')}
          </label>
          {!hasWorkerLocation && <span className="muted">{t('marketplace.gigFeed.setLocationHint')}</span>}
        </div>
      )}
      {status === 'loading' && <p className="muted">{t('marketplace.gigFeed.loading')}</p>}
      {visibleGigs.length === 0 && status !== 'loading' && <p className="muted">{t('marketplace.gigFeed.empty')}</p>}
      <div className="card-grid">
        {visibleGigs.map((gig) => (
          <div key={gig.id} className="card gig-card">
            <div className="skill-line">
              <GigThumbnail gig={gig} size={48} />
              <div>
                <span className="card-title">{gig.title}</span>
                <div className="muted">
                  {gig.skill?.name}
                  {locationName(gig.locationLat, gig.locationLng) &&
                    ` · ${locationName(gig.locationLat, gig.locationLng)}`}
                  {sortByDistance &&
                    ` · ${t('marketplace.gigFeed.distanceAway', {
                      distance: distanceKm(workerLat!, workerLng!, gig.locationLat, gig.locationLng).toFixed(1),
                    })}`}
                </div>
              </div>
            </div>
            <p className="gig-card-description">{gig.description}</p>
            <div className="gig-card-footer">
              <div className="card-row">
                <span className="muted">{t('marketplace.gigFeed.budget', { amount: gig.budget })}</span>
                <span className={statusBadgeClass(gig.status)}>{gig.status.replace('_', ' ')}</span>
              </div>
              <Link to={`/gigs/${gig.id}`}>{t('marketplace.gigFeed.viewDetails')}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GigFeed;
