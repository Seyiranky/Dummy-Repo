import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Space, Typography } from 'antd';
import { useAppSelector } from '../../store/hooks';
import PageContainer from '../Layout/PageContainer';
import ProfileEditor from './ProfileEditor';
import ExportDataButton from './ExportDataButton';

const Settings = () => {
  const { t } = useTranslation();
  const { role } = useAppSelector((state) => state.auth);

  return (
    <PageContainer title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Space direction="vertical" size={16} style={{ width: '100%', maxWidth: 640 }}>
        <Card title={t('settings.profile')}>
          <Typography.Paragraph type="secondary">
            {role === 'worker' ? t('settings.profileDescWorker') : t('settings.profileDescOther')}
          </Typography.Paragraph>
          <ProfileEditor />
        </Card>

        <Card title={t('settings.security')}>
          <Typography.Paragraph type="secondary">
            {t('settings.securityDesc')}
          </Typography.Paragraph>
          <Link to="/forgot-password">{t('settings.resetPasswordLink')}</Link>
        </Card>

        <Card title={t('settings.yourData')}>
          <ExportDataButton />
        </Card>
      </Space>
    </PageContainer>
  );
};

export default Settings;
