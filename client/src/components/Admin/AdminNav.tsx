import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) => `toggle-option${isActive ? ' active' : ''}`;

const AdminNav = () => (
  <nav className="toggle admin-nav" role="tablist">
    <NavLink to="/admin" end className={linkClass}>
      Overview
    </NavLink>
    <NavLink to="/admin/users" className={linkClass}>
      Users
    </NavLink>
    <NavLink to="/admin/gigs/pending" className={linkClass}>
      Pending gigs
    </NavLink>
    <NavLink to="/admin/gigs/completed" className={linkClass}>
      Completed gigs
    </NavLink>
  </nav>
);

export default AdminNav;
