import { useEffect, useState, type FormEvent } from 'react';
import { skillApi } from '../../api/skillApi';
import { skillTaskApi } from '../../api/skillTaskApi';
import Select from '../common/Select';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { Skill, SkillTask } from '../../types';

interface SkillVerificationFormProps {
  tasks: SkillTask[];
  onSubmitted: () => void;
}

const SkillVerificationForm = ({ tasks, onSubmitted }: SkillVerificationFormProps) => {
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
      setError('Could not submit your task. An admin may not be available right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
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

export default SkillVerificationForm;
