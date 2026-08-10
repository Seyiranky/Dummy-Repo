import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import VerificationPage from './pages/VerificationPage';
import MentorshipPage from './pages/MentorshipPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/verification" element={<VerificationPage />} />
      <Route path="/mentorship" element={<MentorshipPage />} />
    </Routes>
  );
}

export default App;
