import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { statusBadgeClass } from '../../utils/statusBadge';
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

  return (
    <div>
      <div className="section">
        <h1>Admin dashboard</h1>
        <p className="muted">Read-only view of platform activity. Moderation actions are not yet implemented.</p>
        <div className="card-row">
          {Object.entries(roleCounts).map(([role, count]) => (
            <span key={role} className="badge badge-info">
              {count} {role}
              {count === 1 ? '' : 's'}
            </span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Users ({users.length})</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trust score</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link to={`/profile/${u.id}`} className="link-reset">
                      {u.name}
                    </Link>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge">{u.role}</span>
                  </td>
                  <td>{u.trustScore.toFixed(1)}</td>
                  <td>{new Date(u.createdAt ?? '').toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Gigs ({gigs.length})</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gigs.map((g) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>
                    {g.client ? (
                      <Link to={`/profile/${g.client.id}`} className="link-reset">
                        {g.client.name}
                      </Link>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td>{g.skill?.name}</td>
                  <td>{Number(g.budget).toLocaleString()} RWF</td>
                  <td>
                    <span className={statusBadgeClass(g.status)}>{g.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
