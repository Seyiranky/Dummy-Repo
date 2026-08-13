import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const ForgotPasswordForm = () => {
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
        setError('No account was found for that email.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>Reset your password</h1>
      <p className="auth-form-subtitle">Enter your account email and we'll get you a reset link.</p>

      {!resetLink ? (
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <div>
          <p className="muted">
            This demo has no email sending set up, so here's your reset link directly instead of an
            inbox:
          </p>
          <p>
            <Link to={resetLink}>Continue to reset your password →</Link>
          </p>
        </div>
      )}

      <p className="auth-form-footer">
        Remembered it? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
