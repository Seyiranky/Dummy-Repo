import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillId, setSkillId] = useState('');
  const [locationName, setLocationName] = useState(KIGALI_LOCATIONS[0].name);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    skillApi.listSkills().then((data) => {
      setSkills(data);
      if (data.length > 0) setSkillId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const clearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const location = KIGALI_LOCATIONS.find((l) => l.name === locationName) ?? KIGALI_LOCATIONS[0];
      await gigApi.createGig(
        {
          title,
          description,
          budget: Number(budget),
          skillId,
          locationLat: location.lat,
          locationLng: location.lng,
        },
        imageFile ?? undefined,
      );
      setTitle('');
      setDescription('');
      setBudget('');
      clearImage();
      dispatch(fetchGigs());
      onPosted?.();
    } catch {
      setError(t('marketplace.gigForm.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        {t('marketplace.gigForm.titleLabel')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        {t('marketplace.gigForm.descriptionLabel')}
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
      </label>
      <label>
        {t('marketplace.gigForm.budgetLabel')}
        <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} required />
      </label>
      <label>
        {t('marketplace.gigForm.skillCategoryLabel')}
        <Select
          value={skillId}
          onChange={setSkillId}
          options={skills.map((skill) => ({ value: skill.id, label: skill.name }))}
        />
      </label>
      <label>
        {t('marketplace.gigForm.locationLabel')}
        <Select
          value={locationName}
          onChange={setLocationName}
          options={KIGALI_LOCATIONS.map((location) => ({ value: location.name, label: location.name }))}
        />
      </label>
      <label>
        {t('marketplace.gigForm.photoLabel')}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
      </label>
      {imagePreview && (
        <div className="gig-form-preview">
          <img src={imagePreview} alt="Selected gig photo preview" />
          <button type="button" className="btn-text" onClick={clearImage}>
            {t('marketplace.gigForm.removePhoto')}
          </button>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting || !skillId}>
        {submitting ? t('marketplace.gigForm.submitting') : t('marketplace.gigForm.submit')}
      </button>
    </form>
  );
};

export default GigForm;
