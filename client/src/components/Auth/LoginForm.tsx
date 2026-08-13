import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-form">
      <h1>Welcome back</h1>
      <p className="auth-form-subtitle">Log in to manage your gigs, matches, and payments.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p className="auth-form-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>
      <GoogleLoginButton />

      <p className="auth-form-footer">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginForm;
