import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { googleLogin } from '../../store/slices/authSlice';
import Modal from '../common/Modal';
import Select from '../common/Select';
import { ROLE_OPTIONS } from '../../constants/roles';
import type { Role } from '../../types';

const GoogleLoginButton = () => {
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [role, setRole] = useState<Role>('worker');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const finishLogin = async (credential: string, chosenRole?: Role) => {
    const result = await dispatch(googleLogin({ credential, role: chosenRole }));
    if (googleLogin.fulfilled.match(result)) {
      if ('needsRole' in result.payload) {
        setPendingCredential(credential);
        setPendingName(result.payload.name);
      } else {
        setPendingCredential(null);
        navigate('/dashboard');
      }
    }
  };

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    finishLogin(credentialResponse.credential);
  };

  const handleCompleteSignup = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingCredential) return;
    finishLogin(pendingCredential, role);
  };

  return (
    <>
      <div className="google-login-button">
        <GoogleLogin onSuccess={handleSuccess} onError={() => undefined} width="290" />
      </div>
      {error && !pendingCredential && <p className="form-error">{error}</p>}

      {pendingCredential && (
        <Modal title="Finish setting up your account" onClose={() => setPendingCredential(null)}>
          <p className="muted">Welcome, {pendingName}! Tell us how you'll be using Isoko Talents.</p>
          <form onSubmit={handleCompleteSignup}>
            <label>
              I am a...
              <Select value={role} onChange={(v) => setRole(v as Role)} options={ROLE_OPTIONS} />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Finishing...' : 'Continue'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default GoogleLoginButton;
