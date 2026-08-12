import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { googleLogin } from '../../store/slices/authSlice';
import Modal from '../common/Modal';
import Select from '../common/Select';
import { ROLE_OPTIONS } from '../../constants/roles';
import type { Role } from '../../types';

const GoogleLoginButton = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('worker');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const handleContinue = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(googleLogin({ name, email, role }));
    if (googleLogin.fulfilled.match(result)) {
      setOpen(false);
      navigate('/dashboard');
    }
  };

  return (
    <>
      <button type="button" className="btn-google" onClick={() => setOpen(true)}>
        Continue with Google
      </button>

      {open && (
        <Modal title="Choose an account" onClose={() => setOpen(false)}>
          <p className="muted">
            Simulated Google sign-in for this demo — no real Google account is contacted.
          </p>
          <form onSubmit={handleContinue}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              I am a...
              <Select value={role} onChange={(v) => setRole(v as Role)} options={ROLE_OPTIONS} />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default GoogleLoginButton;
