import { useEffect, useState, type FormEvent } from 'react';
import { skillApi } from '../../api/skillApi';
import { gigApi } from '../../api/gigApi';
import { useAppDispatch } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import type { Skill } from '../../types';

const GigForm = () => {
  const dispatch = useAppDispatch();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillId, setSkillId] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
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
      await gigApi.createGig({
        title,
        description,
        budget: Number(budget),
        skillId,
        locationLat: Number(locationLat),
        locationLng: Number(locationLng),
      });
      setTitle('');
      setDescription('');
      setBudget('');
      setLocationLat('');
      setLocationLng('');
      dispatch(fetchGigs());
    } catch {
      setError('Failed to post gig. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <h2>Post a gig</h2>
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
          <select value={skillId} onChange={(e) => setSkillId(e.target.value)} required>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Latitude
          <input
            type="number"
            step="any"
            value={locationLat}
            onChange={(e) => setLocationLat(e.target.value)}
            required
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="any"
            value={locationLng}
            onChange={(e) => setLocationLng(e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting || !skillId}>
          {submitting ? 'Posting...' : 'Post gig'}
        </button>
      </form>
    </div>
  );
};

export default GigForm;
