import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import GigThumbnail from '../common/GigThumbnail';
import GigApprovalQueue from './GigApprovalQueue';
import AdminNav from './AdminNav';
import type { Gig } from '../../types';

const AdminPendingGigs = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminApi
      .listGigs()
      .then(setGigs)
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const pendingReview = gigs.filter((g) => g.status === 'pending_review');
  const inProgress = gigs.filter((g) => g.status === 'open' || g.status === 'matched');

  return (
    <div>
      <div className="section">
        <h1>Pending gigs</h1>
        <p className="muted">Gigs awaiting approval, plus gigs already live but not yet completed.</p>
      </div>

      <AdminNav />

      <div className="section">
        <h2>Awaiting approval ({pendingReview.length})</h2>
        {loading ? <p className="muted">Loading...</p> : <GigApprovalQueue gigs={gigs} onReviewed={refresh} />}
      </div>

      <div className="section">
        <h2>In progress ({inProgress.length})</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && inProgress.length === 0 && <p className="muted">Nothing in progress right now.</p>}
        {!loading && inProgress.length > 0 && (
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
                {inProgress.map((g) => (
                  <tr key={g.id}>
                    <td>{g.title}</td>
                    <td>{g.client ? <IdentityLink id={g.client.id} name={g.client.name} size={24} /> : 'Unknown'}</td>
                    <td>
                      <div className="skill-line">
                        <GigThumbnail gig={g} size={24} />
                        {g.skill?.name}
                      </div>
                    </td>
                    <td>{Number(g.budget).toLocaleString()} RWF</td>
                    <td>
                      <span className={statusBadgeClass(g.status)}>{g.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingGigs;
