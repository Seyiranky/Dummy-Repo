import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminNav from './AdminNav';
import type { Gig, User } from '../../types';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.listUsers(), adminApi.listGigs()])
      .then(([userData, gigData]) => {
        setUsers(userData);
        setGigs(gigData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="muted">Loading admin dashboard...</p>;
  }

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const pendingGigCount = gigs.filter((g) => g.status === 'pending_review').length;
  const inProgressGigCount = gigs.filter((g) => g.status === 'open' || g.status === 'matched').length;
  const completedGigCount = gigs.filter((g) => g.status === 'completed').length;

  return (
    <div>
      <div className="section">
        <h1>Admin dashboard</h1>
        <p className="muted">Platform activity at a glance.</p>
        <div className="card-row">
          {Object.entries(roleCounts).map(([role, count]) => (
            <span key={role} className="badge badge-info">
              {count} {role}
              {count === 1 ? '' : 's'}
            </span>
          ))}
          {suspendedCount > 0 && (
            <span className="badge badge-error">
              {suspendedCount} suspended
            </span>
          )}
        </div>
      </div>

      <AdminNav />

      <div className="stat-grid">
        <Link to="/admin/users" className="stat-card link-reset">
          <div className="stat-value">{users.length}</div>
          <span className="stat-label">Users</span>
        </Link>
        <Link to="/admin/gigs/pending" className="stat-card link-reset">
          <div className="stat-value">{pendingGigCount}</div>
          <span className="stat-label">Pending gig approvals</span>
        </Link>
        <Link to="/admin/gigs/pending" className="stat-card link-reset">
          <div className="stat-value">{inProgressGigCount}</div>
          <span className="stat-label">Gigs in progress</span>
        </Link>
        <Link to="/admin/gigs/completed" className="stat-card link-reset">
          <div className="stat-value">{completedGigCount}</div>
          <span className="stat-label">Completed gigs</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
