import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import ProfileEditor from './ProfileEditor';
import ExportDataButton from './ExportDataButton';

const Settings = () => {
  const { role } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h1>Settings</h1>
      <p className="page-subtitle">Manage your public profile, location visibility, and account data.</p>

      <div className="section">
        <h2>Profile</h2>
        <p className="muted">
          {role === 'worker'
            ? 'Your bio and location appear on your public profile, which clients can see.'
            : 'Your bio appears on your public profile, which other users can see.'}
        </p>
        <ProfileEditor />
      </div>

      <div className="section">
        <h2>Security</h2>
        <p className="muted">
          Change your password using the same link-based reset flow you'd use if you forgot it.
        </p>
        <Link to="/forgot-password">Reset your password</Link>
      </div>

      <div className="section">
        <h2>Your data</h2>
        <ExportDataButton />
      </div>
    </div>
  );
};

export default Settings;
