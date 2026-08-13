import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import AdminNav from './AdminNav';
import type { Gig } from '../../types';

const AdminCompletedGigs = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listGigs()
      .then(setGigs)
      .finally(() => setLoading(false));
  }, []);

  const completed = gigs.filter((g) => g.status === 'completed');

  return (
    <div>
      <div className="section">
        <h1>Completed gigs</h1>
        <p className="muted">Finished gigs and who completed them.</p>
      </div>

      <AdminNav />

      {loading && <p className="muted">Loading...</p>}
      {!loading && completed.length === 0 && <p className="muted">No gigs have been completed yet.</p>}
      {!loading && completed.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gig</th>
                <th>Client</th>
                <th>Completed by</th>
                <th>Budget</th>
                <th>Payment</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((g) => {
                const match = g.matches?.find((m) => m.status === 'completed');
                return (
                  <tr key={g.id}>
                    <td>{g.title}</td>
                    <td>
                      {g.client ? <IdentityLink id={g.client.id} name={g.client.name} size={24} /> : 'Unknown'}
                    </td>
                    <td>
                      {match?.worker ? (
                        <IdentityLink id={match.worker.id} name={match.worker.name} size={24} />
                      ) : (
                        'Unknown'
                      )}
                    </td>
                    <td>{Number(g.budget).toLocaleString()} RWF</td>
                    <td>
                      {match?.transaction ? (
                        <span className={statusBadgeClass(match.transaction.status)}>
                          {match.transaction.status}
                        </span>
                      ) : (
                        <span className="muted">No transaction</span>
                      )}
                    </td>
                    <td>{match ? new Date(match.updatedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCompletedGigs;
