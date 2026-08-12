import type { ReactNode } from 'react';
import tailoringPhoto from '../../assets/skills/tailoring.jpg';
import logo from '../../assets/logo.png';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="auth-page">
      <div className="auth-page-brand">
        <div className="auth-page-brand-photo" style={{ backgroundImage: `url(${tailoringPhoto})` }} />
        <div className="auth-page-brand-content">
          <img src={logo} alt="Isoko Talents" className="auth-page-logo" />
          <p className="auth-page-tagline">Turn your skills into income.</p>
          <p className="auth-page-subtext">
            Isoko Talents connects verified workers with clients across Kigali — post a gig, get
            matched, get paid.
          </p>
        </div>
      </div>
      <div className="auth-page-form">{children}</div>
    </div>
  );
};

export default AuthLayout;
