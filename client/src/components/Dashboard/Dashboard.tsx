import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { skillTaskApi } from '../../api/skillTaskApi';
import ProfileEditor from './ProfileEditor';
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

  return (
    <div>
      <div className="section">
        <h1>Welcome, {profile.name}</h1>
        <p className="card-row">
          <span className="badge">{profile.role}</span>
          <span>Trust score: {profile.trustScore.toFixed(1)} / 5</span>
        </p>
      </div>

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

      <ProfileEditor />

      <div className="section">
        <h2>Your matches</h2>
        {matches.length === 0 && <p className="muted">No matches yet.</p>}
        {matches.map((match) => (
          <div key={match.id} className="card card-row">
            <div>
              <strong>{match.gig?.title ?? 'Gig'}</strong>
              <div className="muted">
                {role === 'client' ? match.worker?.name : match.gig?.client?.name}
              </div>
            </div>
            <span className="badge">{match.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
