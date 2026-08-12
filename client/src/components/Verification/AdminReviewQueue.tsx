import { useState } from 'react';
import { skillTaskApi } from '../../api/skillTaskApi';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { SkillTask } from '../../types';

interface AdminReviewQueueProps {
  tasks: SkillTask[];
  onReviewed: () => void;
}

const AdminReviewQueue = ({ tasks, onReviewed }: AdminReviewQueueProps) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const decide = async (taskId: string, decision: 'approved' | 'rejected') => {
    setBusyId(taskId);
    try {
      await skillTaskApi.reviewTask(taskId, decision);
      onReviewed();
    } finally {
      setBusyId(null);
    }
  };

  const pending = tasks.filter((t) => t.status === 'pending');
  const decided = tasks.filter((t) => t.status !== 'pending');

  return (
    <div>
      <h2>Tasks awaiting your review</h2>
      {pending.length === 0 && <p className="muted">Nothing to review right now.</p>}
      {pending.map((task) => (
        <div key={task.id} className="card">
          <div className="card-row">
            <div className="skill-line">
              <SkillThumbnail category={task.skill?.category} />
              <div>
                <span className="card-title">{task.skill?.name}</span>
                {task.worker && <IdentityLink id={task.worker.id} name={task.worker.name} size={24} />}
              </div>
            </div>
          </div>
          <p>
            Evidence:{' '}
            <a href={task.evidenceUrl} target="_blank" rel="noreferrer">
              {task.evidenceUrl}
            </a>
          </p>
          {task.notes && <p className="muted">{task.notes}</p>}
          <div className="card-row">
            <button
              type="button"
              className="btn-success"
              onClick={() => decide(task.id, 'approved')}
              disabled={busyId === task.id}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => decide(task.id, 'rejected')}
              disabled={busyId === task.id}
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2>Past reviews</h2>
      {decided.length === 0 && <p className="muted">No reviews completed yet.</p>}
      {decided.map((task) => (
        <div key={task.id} className="card card-row">
          <div className="skill-line">
            <SkillThumbnail category={task.skill?.category} />
            <div>
              <span className="card-title">{task.skill?.name}</span>
              {task.worker && <IdentityLink id={task.worker.id} name={task.worker.name} size={24} />}
            </div>
          </div>
          <span className={statusBadgeClass(task.status)}>{task.status}</span>
        </div>
      ))}
    </div>
  );
};

export default AdminReviewQueue;
