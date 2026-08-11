import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Avatar from '../common/Avatar';

const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

const Sidebar = () => {
  const { token, role, profile } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        Isoko Talents
      </Link>
      {token && (
        <>
          <nav className="sidebar-links">
            <NavLink to="/dashboard" className={navLinkClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClassName}>
              Marketplace
            </NavLink>
            {(role === 'worker' || role === 'mentor') && (
              <NavLink to="/mentorship" className={navLinkClassName}>
                Mentorship
              </NavLink>
            )}
            {role === 'admin' && (
              <NavLink to="/admin" className={navLinkClassName}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="sidebar-footer">
            <Link to="/dashboard" className="identity link-reset">
              <Avatar name={profile?.name ?? '?'} size={28} />
              <span className="sidebar-user">
                {profile?.name ?? '...'} ({role})
              </span>
            </Link>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
