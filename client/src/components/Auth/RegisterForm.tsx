import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import Select from '../common/Select';
import { ROLE_OPTIONS } from '../../constants/roles';
import type { Role } from '../../types';

const RegisterForm = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('worker');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register({ name, email, password, role }));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-form">
      <h1>{t('auth.register.title')}</h1>
      <p className="auth-form-subtitle">{t('auth.register.subtitle')}</p>
      <form onSubmit={handleSubmit}>
        <label>
          {t('auth.register.nameLabel')}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {t('auth.register.emailLabel')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t('auth.register.passwordLabel')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          {t('auth.register.roleLabel')}
          <Select value={role} onChange={(v) => setRole(v as Role)} options={ROLE_OPTIONS} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? t('auth.register.submitting') : t('auth.register.submit')}
        </button>
      </form>
      <p className="auth-form-footer">
        {t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.loginLink')}</Link>
      </p>
    </div>
  );
};

export default RegisterForm;
