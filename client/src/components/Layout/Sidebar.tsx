import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { notificationApi } from '../../api/notificationApi';
import Avatar from '../common/Avatar';
import LanguageToggle from '../common/LanguageToggle';
import {
  AdminIcon,
  DashboardIcon,
  LogoutIcon,
  MarketplaceIcon,
  NotificationsIcon,
  SettingsIcon,
  WalletIcon,
} from '../common/icons';
import logo from '../../assets/logo.png';

const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

const Sidebar = () => {
  const { t } = useTranslation();
  const { role, profile } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationApi.listNotifications().then((notifications) => {
      setUnreadCount(notifications.filter((n) => !n.readAt).length);
    });
  }, [role, location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <span className="sidebar-logo-wrap">
          <img src={logo} alt="Isoko Talents" className="sidebar-logo" />
        </span>
      </Link>

      <nav className="sidebar-links">
        <NavLink to="/dashboard" className={navLinkClassName} title={t('sidebar.dashboard')}>
          <span className="sidebar-link-label">
            <DashboardIcon />
            <span className="sidebar-link-text">{t('sidebar.dashboard')}</span>
          </span>
        </NavLink>
        <NavLink to="/marketplace" className={navLinkClassName} title={t('sidebar.marketplace')}>
          <span className="sidebar-link-label">
            <MarketplaceIcon />
            <span className="sidebar-link-text">{t('sidebar.marketplace')}</span>
          </span>
        </NavLink>
        {(role === 'worker' || role === 'client') && (
          <NavLink to="/wallet" className={navLinkClassName} title={t('sidebar.wallet')}>
            <span className="sidebar-link-label">
              <WalletIcon />
              <span className="sidebar-link-text">{t('sidebar.wallet')}</span>
            </span>
          </NavLink>
        )}
        <NavLink to="/notifications" className={navLinkClassName} title={t('sidebar.notifications')}>
          <span className="sidebar-link-label">
            <span className="sidebar-icon-wrap">
              <NotificationsIcon />
              {unreadCount > 0 && <span className="sidebar-dot" aria-hidden="true" />}
            </span>
            <span className="sidebar-link-text">{t('sidebar.notifications')}</span>
          </span>
          {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
        </NavLink>
        {role === 'admin' && (
          <NavLink to="/admin" className={navLinkClassName} title={t('sidebar.admin')}>
            <span className="sidebar-link-label">
              <AdminIcon />
              <span className="sidebar-link-text">{t('sidebar.admin')}</span>
            </span>
          </NavLink>
        )}
        <NavLink to="/settings" className={navLinkClassName} title={t('sidebar.settings')}>
          <span className="sidebar-link-label">
            <SettingsIcon />
            <span className="sidebar-link-text">{t('sidebar.settings')}</span>
          </span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <Link to="/dashboard" className="identity link-reset" title={profile?.name}>
          <Avatar name={profile?.name ?? '?'} size={28} />
          <span className="sidebar-user">
            {profile?.name ?? '...'} ({role})
          </span>
        </Link>
        <div className="sidebar-footer-actions">
          <LanguageToggle />
          <button type="button" className="sidebar-logout" onClick={handleLogout} title={t('sidebar.logout')}>
            <LogoutIcon />
            <span className="sidebar-link-text">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
