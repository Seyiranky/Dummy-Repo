import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/authApi';

const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.mismatchError'));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      navigate('/login');
    } catch {
      setError(t('auth.resetPassword.invalidTokenError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-form">
        <h1>{t('auth.resetPassword.missingTokenTitle')}</h1>
        <p className="form-error">{t('auth.resetPassword.missingTokenError')}</p>
        <p className="auth-form-footer">
          <Link to="/forgot-password">{t('auth.resetPassword.requestNewLink')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1>{t('auth.resetPassword.title')}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          {t('auth.resetPassword.newPasswordLabel')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          {t('auth.resetPassword.confirmPasswordLabel')}
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
        </button>
      </form>
      <p className="auth-form-footer">
        <Link to="/login">{t('auth.resetPassword.backToLogin')}</Link>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
