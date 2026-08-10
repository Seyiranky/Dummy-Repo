import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import VerificationPage from './pages/VerificationPage';
import MentorshipPage from './pages/MentorshipPage';
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
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['worker', 'mentor']} />}>
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
