import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import type { Gig } from '../../types';

interface GigApprovalQueueProps {
  gigs: Gig[];
  onReviewed: () => void;
}

const GigApprovalQueue = ({ gigs, onReviewed }: GigApprovalQueueProps) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const decide = async (gigId: string, decision: 'approved' | 'rejected') => {
    setBusyId(gigId);
    try {
      await adminApi.reviewGig(gigId, decision);
      onReviewed();
    } finally {
      setBusyId(null);
    }
  };

  const pending = gigs.filter((g) => g.status === 'pending_review');

  return (
    <div>
      {pending.length === 0 && <p className="muted">Nothing to review right now.</p>}
      {pending.map((gig) => (
        <div key={gig.id} className="card">
          <div className="card-row">
            <div className="skill-line">
              <SkillThumbnail category={gig.skill?.category} />
              <div>
                <span className="card-title">{gig.title}</span>
                {gig.client && <IdentityLink id={gig.client.id} name={gig.client.name} size={24} />}
              </div>
            </div>
          </div>
          <p>{gig.description}</p>
          <p className="muted">Budget: {gig.budget} RWF</p>
          <div className="card-row">
            <button
              type="button"
              className="btn-success"
              onClick={() => decide(gig.id, 'approved')}
              disabled={busyId === gig.id}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => decide(gig.id, 'rejected')}
              disabled={busyId === gig.id}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GigApprovalQueue;
