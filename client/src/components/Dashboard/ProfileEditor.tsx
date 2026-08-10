import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { userApi } from '../../api/userApi';

const ProfileEditor = () => {
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [locationLat, setLocationLat] = useState(profile?.locationLat?.toString() ?? '');
  const [locationLng, setLocationLng] = useState(profile?.locationLng?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await userApi.updateProfile({
        bio: bio || undefined,
        locationLat: locationLat ? Number(locationLat) : undefined,
        locationLng: locationLng ? Number(locationLng) : undefined,
      });
      await dispatch(fetchCurrentUser());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const hasLocation = profile?.locationLat != null && profile?.locationLng != null;

  return (
    <div className="section">
      <h2>Your profile</h2>
      {role === 'worker' && !hasLocation && (
        <p className="form-error">
          Set your location so clients can find you in nearby gig matches.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
        </label>
        {role === 'worker' && (
          <>
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
          </>
        )}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
        {saved && <span className="muted"> Saved.</span>}
      </form>
    </div>
  );
};

export default ProfileEditor;
