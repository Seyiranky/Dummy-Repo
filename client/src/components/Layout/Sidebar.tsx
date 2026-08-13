import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { notificationApi } from '../../api/notificationApi';
import Avatar from '../common/Avatar';
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
        <NavLink to="/dashboard" className={navLinkClassName} title="Dashboard">
          <span className="sidebar-link-label">
            <DashboardIcon />
            <span className="sidebar-link-text">Dashboard</span>
          </span>
        </NavLink>
        <NavLink to="/marketplace" className={navLinkClassName} title="Marketplace">
          <span className="sidebar-link-label">
            <MarketplaceIcon />
            <span className="sidebar-link-text">Marketplace</span>
          </span>
        </NavLink>
        {(role === 'worker' || role === 'client') && (
          <NavLink to="/wallet" className={navLinkClassName} title="Wallet">
            <span className="sidebar-link-label">
              <WalletIcon />
              <span className="sidebar-link-text">Wallet</span>
            </span>
          </NavLink>
        )}
        <NavLink to="/notifications" className={navLinkClassName} title="Notifications">
          <span className="sidebar-link-label">
            <span className="sidebar-icon-wrap">
              <NotificationsIcon />
              {unreadCount > 0 && <span className="sidebar-dot" aria-hidden="true" />}
            </span>
            <span className="sidebar-link-text">Notifications</span>
          </span>
          {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
        </NavLink>
        {role === 'admin' && (
          <NavLink to="/admin" className={navLinkClassName} title="Admin">
            <span className="sidebar-link-label">
              <AdminIcon />
              <span className="sidebar-link-text">Admin</span>
            </span>
          </NavLink>
        )}
        <NavLink to="/settings" className={navLinkClassName} title="Settings">
          <span className="sidebar-link-label">
            <SettingsIcon />
            <span className="sidebar-link-text">Settings</span>
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
        <button type="button" className="sidebar-logout" onClick={handleLogout} title="Log out">
          <LogoutIcon />
          <span className="sidebar-link-text">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
