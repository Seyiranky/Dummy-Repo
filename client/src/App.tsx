import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import GigDetailPage from './pages/GigDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !profile) {
      dispatch(fetchCurrentUser());
    }
  }, [token, profile, dispatch]);

  return (
    <div className="app-shell">
      {token && <Sidebar />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Wallet, Settings, and Verification now live as sections on the Dashboard. */}
          <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          <Route path="/verification" element={<Navigate to="/dashboard" replace />} />
          {/* Mentorship is now folded into the broader Notifications section. */}
          <Route path="/mentorship" element={<Navigate to="/notifications" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/gigs/:id" element={<GigDetailPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['worker', 'client', 'admin']} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
