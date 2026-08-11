import { useEffect, useState, type FormEvent } from 'react';
import { skillApi } from '../../api/skillApi';
import { gigApi } from '../../api/gigApi';
import { useAppDispatch } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import Select from '../common/Select';
import { KIGALI_LOCATIONS } from '../../constants/locations';
import type { Skill } from '../../types';

interface GigFormProps {
  onPosted?: () => void;
}

const GigForm = ({ onPosted }: GigFormProps) => {
  const dispatch = useAppDispatch();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillId, setSkillId] = useState('');
  const [locationName, setLocationName] = useState(KIGALI_LOCATIONS[0].name);
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
      const location = KIGALI_LOCATIONS.find((l) => l.name === locationName) ?? KIGALI_LOCATIONS[0];
      await gigApi.createGig({
        title,
        description,
        budget: Number(budget),
        skillId,
        locationLat: location.lat,
        locationLng: location.lng,
      });
      setTitle('');
      setDescription('');
      setBudget('');
      dispatch(fetchGigs());
      onPosted?.();
    } catch {
      setError('Failed to post gig. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
      </label>
      <label>
        Budget (RWF)
        <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} required />
      </label>
      <label>
        Skill category
        <Select
          value={skillId}
          onChange={setSkillId}
          options={skills.map((skill) => ({ value: skill.id, label: skill.name }))}
        />
      </label>
      <label>
        Location
        <Select
          value={locationName}
          onChange={setLocationName}
          options={KIGALI_LOCATIONS.map((location) => ({ value: location.name, label: location.name }))}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting || !skillId}>
        {submitting ? 'Posting...' : 'Post gig'}
      </button>
    </form>
  );
};

export default GigForm;
