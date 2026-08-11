import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { userApi } from '../../api/userApi';
import Select from '../common/Select';
import { KIGALI_LOCATIONS } from '../../constants/locations';

const findLocationName = (lat?: number | null, lng?: number | null) => {
  const match = KIGALI_LOCATIONS.find((l) => l.lat === lat && l.lng === lng);
  return match?.name ?? KIGALI_LOCATIONS[0].name;
};

const ProfileEditor = () => {
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [locationName, setLocationName] = useState(
    findLocationName(profile?.locationLat, profile?.locationLng),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const location = KIGALI_LOCATIONS.find((l) => l.name === locationName) ?? KIGALI_LOCATIONS[0];
      await userApi.updateProfile({
        bio: bio || undefined,
        locationLat: location.lat,
        locationLng: location.lng,
      });
      await dispatch(fetchCurrentUser());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Bio
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
      </label>
      {role === 'worker' && (
        <label>
          Location
          <Select
            value={locationName}
            onChange={setLocationName}
            options={KIGALI_LOCATIONS.map((location) => ({ value: location.name, label: location.name }))}
          />
        </label>
      )}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save profile'}
      </button>
      {saved && <span className="muted"> Saved.</span>}
    </form>
  );
};

export default ProfileEditor;
