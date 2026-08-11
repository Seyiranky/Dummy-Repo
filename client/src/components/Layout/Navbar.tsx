import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const { token, role, profile } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Isoko Talents
      </Link>
      {token && (
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/marketplace">Marketplace</Link>
          {(role === 'worker' || role === 'mentor') && <Link to="/verification">Verification</Link>}
          {(role === 'worker' || role === 'mentor') && <Link to="/mentorship">Mentorship</Link>}
          {(role === 'worker' || role === 'client') && <Link to="/wallet">Wallet</Link>}
          <Link to="/settings">Settings</Link>
          {role === 'admin' && <Link to="/admin">Admin</Link>}
          <Link to="/settings" className="identity link-reset">
            <Avatar name={profile?.name ?? '?'} size={28} />
            <span className="navbar-user">
              {profile?.name ?? '...'} ({role})
            </span>
          </Link>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
