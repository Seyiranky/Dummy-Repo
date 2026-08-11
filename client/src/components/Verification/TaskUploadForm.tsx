import { useEffect, useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import { skillApi } from '../../api/skillApi';
import { skillTaskApi } from '../../api/skillTaskApi';
import Select from '../common/Select';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { Skill, SkillTask } from '../../types';

const WorkerSubmission = ({ tasks, onSubmitted }: { tasks: SkillTask[]; onSubmitted: () => void }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillId, setSkillId] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    skillApi.listSkills().then((data) => {
      setSkills(data);
      if (data.length > 0) setSkillId(data[0].id);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await skillTaskApi.submitTask({ skillId, evidenceUrl, notes: notes || undefined });
      setEvidenceUrl('');
      setNotes('');
      onSubmitted();
    } catch {
      setError('Could not submit your task. A mentor may not be available right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <h2>Submit skill verification evidence</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Skill category
          <Select
            value={skillId}
            onChange={setSkillId}
            options={skills.map((skill) => ({ value: skill.id, label: skill.name }))}
          />
        </label>
        <label>
          Evidence (link to photo, video, or file)
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting || !skillId}>
          {submitting ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>

      <h2>Your submissions</h2>
      {tasks.length === 0 && <p className="muted">No submissions yet.</p>}
      {tasks.map((task) => (
        <div key={task.id} className="card card-row">
          <div className="skill-line">
            <SkillThumbnail category={task.skill?.category} />
            <div>
              <span className="card-title">{task.skill?.name}</span>
              {task.reviewer ? (
                <IdentityLink id={task.reviewer.id} name={task.reviewer.name} size={24} />
              ) : (
                <div className="muted">Reviewer unassigned</div>
              )}
            </div>
          </div>
          <span className={statusBadgeClass(task.status)}>{task.status}</span>
        </div>
      ))}
    </div>
  );
};

const MentorQueue = ({ tasks, onReviewed }: { tasks: SkillTask[]; onReviewed: () => void }) => {
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
    <div className="section">
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

const TaskUploadForm = () => {
  const role = useAppSelector((state) => state.auth.role);
  const [tasks, setTasks] = useState<SkillTask[]>([]);

  const refresh = () => {
    skillTaskApi.listTasks().then(setTasks);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (role === 'mentor') {
    return <MentorQueue tasks={tasks} onReviewed={refresh} />;
  }
  return <WorkerSubmission tasks={tasks} onSubmitted={refresh} />;
};

export default TaskUploadForm;
