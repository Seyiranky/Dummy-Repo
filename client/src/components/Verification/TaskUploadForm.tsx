import { useEffect, useState, type FormEvent } from 'react';
import { useAppSelector } from '../../store/hooks';
import { skillApi } from '../../api/skillApi';
import { skillTaskApi } from '../../api/skillTaskApi';
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
          <select value={skillId} onChange={(e) => setSkillId(e.target.value)} required>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
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
        <button type="submit" disabled={submitting || !skillId}>
          {submitting ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>

      <h2>Your submissions</h2>
      {tasks.length === 0 && <p className="muted">No submissions yet.</p>}
      {tasks.map((task) => (
        <div key={task.id} className="card card-row">
          <div>
            <strong>{task.skill?.name}</strong>
            <div className="muted">Reviewer: {task.reviewer?.name ?? 'unassigned'}</div>
          </div>
          <span className="badge">{task.status}</span>
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
            <div>
              <strong>{task.skill?.name}</strong>
              <div className="muted">Worker: {task.worker?.name}</div>
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
            <button type="button" onClick={() => decide(task.id, 'approved')} disabled={busyId === task.id}>
              Approve
            </button>
            <button type="button" onClick={() => decide(task.id, 'rejected')} disabled={busyId === task.id}>
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2>Past reviews</h2>
      {decided.length === 0 && <p className="muted">No reviews completed yet.</p>}
      {decided.map((task) => (
        <div key={task.id} className="card card-row">
          <div>
            <strong>{task.skill?.name}</strong>
            <div className="muted">Worker: {task.worker?.name}</div>
          </div>
          <span className="badge">{task.status}</span>
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
