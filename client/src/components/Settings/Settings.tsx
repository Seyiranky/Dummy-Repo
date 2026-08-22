import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import ProfileEditor from './ProfileEditor';
import ExportDataButton from './ExportDataButton';

const Settings = () => {
  const { t } = useTranslation();
  const { role } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h1>{t('settings.title')}</h1>
      <p className="page-subtitle">{t('settings.subtitle')}</p>

      <div className="section">
        <h2>{t('settings.profile')}</h2>
        <p className="muted">
          {role === 'worker' ? t('settings.profileDescWorker') : t('settings.profileDescOther')}
        </p>
        <ProfileEditor />
      </div>

      <div className="section">
        <h2>{t('settings.security')}</h2>
        <p className="muted">{t('settings.securityDesc')}</p>
        <Link to="/forgot-password">{t('settings.resetPasswordLink')}</Link>
      </div>

      <div className="section">
        <h2>{t('settings.yourData')}</h2>
        <ExportDataButton />
      </div>
    </div>
  );
};

export default Settings;
