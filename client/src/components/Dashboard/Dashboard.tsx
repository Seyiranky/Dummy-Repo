import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { skillTaskApi } from '../../api/skillTaskApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { SkillTask } from '../../types';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const matches = useAppSelector((state) => state.matches.items);
  const [tasks, setTasks] = useState<SkillTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (role === 'worker' || role === 'mentor') {
      setTasksLoading(true);
      skillTaskApi
        .listTasks()
        .then(setTasks)
        .finally(() => setTasksLoading(false));
    }
  }, [role]);

  if (!profile) {
    return <p>Loading your profile...</p>;
  }

  const pendingReviews = tasks.filter((t) => t.status === 'pending');
  const needsLocation = role === 'worker' && (profile.locationLat == null || profile.locationLng == null);

  return (
    <div>
      <div className="section">
        <h1>Welcome, {profile.name}</h1>
        <div className="card-row">
          <span className="badge">{profile.role}</span>
          <div className="trust-score-stat">
            <span className="muted">Trust score</span>
            <span className="trust-score">{profile.trustScore.toFixed(1)} / 5</span>
          </div>
        </div>
      </div>

      {needsLocation && (
        <div className="section">
          <p className="form-error">
            Set your location in <Link to="/settings">Settings</Link> so clients can find you in nearby
            gig matches.
          </p>
        </div>
      )}

      {role === 'client' && (
        <div className="section">
          <h2>Get started</h2>
          <p>
            Post a gig and let the matching engine find nearby, verified workers.{' '}
            <Link to="/marketplace">Go to Marketplace</Link>
          </p>
        </div>
      )}

      {role === 'worker' && (
        <div className="section">
          <h2>Get started</h2>
          <p>
            <Link to="/verification">Submit a skill verification task</Link> to build a verified
            trust score, then browse <Link to="/marketplace">open gigs</Link>.
          </p>
        </div>
      )}

      {role === 'mentor' && (
        <div className="section">
          <h2>Pending reviews assigned to you</h2>
          {tasksLoading && <p className="muted">Loading...</p>}
          {!tasksLoading && pendingReviews.length === 0 && <p className="muted">No pending reviews.</p>}
          {pendingReviews.length > 0 && (
            <p>
              You have {pendingReviews.length} task(s) awaiting review.{' '}
              <Link to="/verification">Review now</Link>
            </p>
          )}
        </div>
      )}

      <div className="section">
        <h2>Your matches</h2>
        {matches.length === 0 && <p className="muted">No matches yet.</p>}
        {matches.map((match) => {
          const counterparty = role === 'client' ? match.worker : match.gig?.client;
          return (
            <div key={match.id} className="card card-row">
              <div>
                <span className="card-title">{match.gig?.title ?? 'Gig'}</span>
                <div className="muted">
                  {counterparty ? (
                    <Link to={`/profile/${counterparty.id}`} className="link-reset">
                      {counterparty.name}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </div>
              </div>
              <span className={statusBadgeClass(match.status)}>{match.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
