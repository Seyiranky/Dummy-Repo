import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { statusBadgeClass } from '../../utils/statusBadge';
import SkillThumbnail from '../common/SkillThumbnail';

const GigFeed = () => {
  const dispatch = useAppDispatch();
  const { role, profile } = useAppSelector((state) => state.auth);
  const gigs = useAppSelector((state) => state.gigs.items);
  const status = useAppSelector((state) => state.gigs.status);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const visibleGigs =
    role === 'client' && profile
      ? gigs.filter((gig) => gig.clientId === profile.id)
      : gigs.filter((gig) => gig.status === 'open');

  return (
    <div>
      {status === 'loading' && <p className="muted">Loading...</p>}
      {visibleGigs.length === 0 && status !== 'loading' && <p className="muted">Nothing here yet.</p>}
      <div className="card-grid">
        {visibleGigs.map((gig) => (
          <div key={gig.id} className="card gig-card">
            <div className="skill-line">
              <SkillThumbnail category={gig.skill?.category} size={48} />
              <div>
                <span className="card-title">{gig.title}</span>
                <div className="muted">{gig.skill?.name}</div>
              </div>
            </div>
            <p className="gig-card-description">{gig.description}</p>
            <div className="gig-card-footer">
              <div className="card-row">
                <span className="muted">Budget: {gig.budget} RWF</span>
                <span className={statusBadgeClass(gig.status)}>{gig.status.replace('_', ' ')}</span>
              </div>
              <Link to={`/gigs/${gig.id}`}>View details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GigFeed;
