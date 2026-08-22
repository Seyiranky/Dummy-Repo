import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = () => {
  const { t } = useTranslation();
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
      <h1>{t('auth.login.title')}</h1>
      <p className="auth-form-subtitle">{t('auth.login.subtitle')}</p>
      <form onSubmit={handleSubmit}>
        <label>
          {t('auth.login.emailLabel')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t('auth.login.passwordLabel')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p className="auth-form-forgot">
          <Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>

      <div className="auth-divider">
        <span>{t('auth.login.or')}</span>
      </div>
      <GoogleLoginButton />

      <p className="auth-form-footer">
        {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link>
      </p>
    </div>
  );
};

export default LoginForm;
