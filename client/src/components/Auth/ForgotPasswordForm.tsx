import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/authApi';

const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await authApi.forgotPassword({ email });
      if (result.resetToken) {
        setResetLink(`/reset-password?token=${result.resetToken}`);
      } else {
        setError(t('auth.forgotPassword.noAccountError'));
      }
    } catch {
      setError(t('auth.forgotPassword.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>{t('auth.forgotPassword.title')}</h1>
      <p className="auth-form-subtitle">{t('auth.forgotPassword.subtitle')}</p>

      {!resetLink ? (
        <form onSubmit={handleSubmit}>
          <label>
            {t('auth.forgotPassword.emailLabel')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
          </button>
        </form>
      ) : (
        <div>
          <p className="muted">{t('auth.forgotPassword.noEmailNotice')}</p>
          <p>
            <Link to={resetLink}>{t('auth.forgotPassword.continueLink')}</Link>
          </p>
        </div>
      )}

      <p className="auth-form-footer">
        {t('auth.forgotPassword.remembered')} <Link to="/login">{t('auth.forgotPassword.loginLink')}</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
