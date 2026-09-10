import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Flex, Segmented, Space, Tooltip, Typography } from 'antd';
import {
  BellOutlined,
  BulbOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';
import { notificationApi } from '../../api/notificationApi';
import { useThemeMode } from '../../theme/ThemeProvider';
import { NAV_ENTRIES, activeNavKey } from './navConfig';

const pageTitle = (pathname: string, t: (k: string) => string): string => {
  const key = activeNavKey(pathname);
  const entry = NAV_ENTRIES.find((e) => e.key === key);
  if (entry) return t(entry.labelKey);
  if (pathname.startsWith('/gigs/')) return t('sidebar.gigDetails');
  if (pathname.startsWith('/profile/')) return t('sidebar.profile');
  return '';
};

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader = ({ collapsed, onToggle }: AppHeaderProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAppSelector((state) => state.auth);
  const { isDark, setMode } = useThemeMode();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi
      .listNotifications()
      .then((n) => setUnread(n.filter((x) => !x.readAt).length))
      .catch(() => setUnread(0));
  }, [location.pathname, role]);

  const lang = i18n.resolvedLanguage === 'rw' ? 'rw' : 'en';

  return (
    <Flex align="center" justify="space-between" style={{ height: '100%', width: '100%' }}>
      <Space size={10}>
        <Button
          type="text"
          aria-label="Toggle navigation"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
        />
        <Typography.Text strong style={{ fontSize: 16 }}>
          {pageTitle(location.pathname, t)}
        </Typography.Text>
      </Space>

      <Space size={8} align="center">
        <Segmented
          size="small"
          value={lang}
          onChange={(v) => i18n.changeLanguage(v as string)}
          options={[
            { label: 'EN', value: 'en' },
            { label: 'RW', value: 'rw' },
          ]}
        />
        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <Button
            type="text"
            aria-label="Toggle theme"
            icon={<BulbOutlined />}
            onClick={() => setMode(isDark ? 'light' : 'dark')}
          />
        </Tooltip>
        <Badge count={unread} size="small" offset={[-2, 4]}>
          <Button
            type="text"
            aria-label={t('sidebar.notifications')}
            icon={<BellOutlined />}
            onClick={() => navigate('/notifications')}
          />
        </Badge>
      </Space>
    </Flex>
  );
};

export default AppHeader;
