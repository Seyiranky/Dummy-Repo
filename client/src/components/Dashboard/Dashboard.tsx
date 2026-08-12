import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { skillTaskApi } from '../../api/skillTaskApi';
import { transactionApi } from '../../api/transactionApi';
import { userApi } from '../../api/userApi';
import { adminApi } from '../../api/adminApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import Avatar from '../common/Avatar';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import Modal from '../common/Modal';
import TrustScoreRing from '../Profile/TrustScoreRing';
import StatCard from './StatCard';
import WalletSummary from '../Wallet/WalletSummary';
import ProfileEditor from '../Settings/ProfileEditor';
import ExportDataButton from '../Settings/ExportDataButton';
import SkillVerificationForm from '../Verification/SkillVerificationForm';
import AdminReviewQueue from '../Verification/AdminReviewQueue';
import GigApprovalQueue from '../Admin/GigApprovalQueue';
import type { Gig, SkillTask, Transaction, UserSkill } from '../../types';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const matches = useAppSelector((state) => state.matches.items);
  const [tasks, setTasks] = useState<SkillTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [verifiedSkills, setVerifiedSkills] = useState<UserSkill[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [gigsLoading, setGigsLoading] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showGigModal, setShowGigModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const refreshTasks = () => {
    setTasksLoading(true);
    skillTaskApi
      .listTasks(role === 'admin' ? { assignedToMe: true } : undefined)
      .then(setTasks)
      .finally(() => setTasksLoading(false));
  };

  useEffect(() => {
    if (role === 'worker' || role === 'admin') {
      refreshTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role === 'worker' || role === 'client') {
      setTransactionsLoading(true);
      transactionApi
        .listTransactions()
        .then(setTransactions)
        .finally(() => setTransactionsLoading(false));
    }
  }, [role]);

  useEffect(() => {
    if (role === 'worker' && profile) {
      userApi.getUserSkills(profile.id).then(setVerifiedSkills);
    }
  }, [role, profile]);

  const refreshGigs = () => {
    setGigsLoading(true);
    adminApi
      .listGigs()
      .then(setGigs)
      .finally(() => setGigsLoading(false));
  };

  useEffect(() => {
    if (role === 'admin') refreshGigs();
  }, [role]);

  if (!profile) {
    return <p>Loading your profile...</p>;
  }

  const pendingReviews = tasks.filter((t) => t.status === 'pending');
  const decidedReviews = tasks.filter((t) => t.status !== 'pending');
  const pendingGigs = gigs.filter((g) => g.status === 'pending_review');
  const needsLocation = role === 'worker' && (profile.locationLat == null || profile.locationLng == null);
  const activeMatches = matches.filter((m) => m.status === 'pending' || m.status === 'accepted').length;
  const confirmedTotal = transactions
    .filter((t) => t.status === 'confirmed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div>
      <div className="dashboard-header">
        <Avatar name={profile.name} size={64} />
        <div>
          <h1 className="profile-name">Welcome, {profile.name}</h1>
          <span className="badge">{profile.role}</span>
        </div>
      </div>

      {needsLocation && (
        <div className="section">
          <p className="form-error">
            Set your location under Account settings below so clients can find you in nearby gig
            matches.
          </p>
        </div>
      )}

      <div className="stat-grid">
        {(role === 'worker' || role === 'client') && (
          <>
            <StatCard label="Trust score" value={<TrustScoreRing trustScore={profile.trustScore} size={72} />} />
            <StatCard
              label={role === 'client' ? 'Total paid (confirmed)' : 'Total earned (confirmed)'}
              value={`${confirmedTotal.toLocaleString()} RWF`}
            />
            <StatCard label="Active matches" value={activeMatches} />
          </>
        )}
        {role === 'admin' && (
          <>
            <StatCard label="Pending reviews" value={pendingReviews.length} />
            <StatCard label="Reviews completed" value={decidedReviews.length} />
            <StatCard label="Pending gig approvals" value={pendingGigs.length} />
          </>
        )}
      </div>

      {role === 'client' && (
        <div className="section">
          <h2>Get started</h2>
          <p>
            Post a gig and let the matching engine find nearby, verified workers.{' '}
            <Link to="/marketplace">Go to Marketplace</Link>
          </p>
        </div>
      )}

      {role === 'worker' && (
        <div className="section">
          <h2>Get started</h2>
          <p>
            <button type="button" className="btn-text" onClick={() => setShowSkillModal(true)}>
              Submit a skill verification task
            </button>{' '}
            to build a verified trust score, then browse <Link to="/marketplace">open gigs</Link>.
          </p>
        </div>
      )}

      {role === 'admin' && !tasksLoading && pendingReviews.length > 0 && (
        <div className="section">
          <p>
            You have {pendingReviews.length} task(s) awaiting review.{' '}
            <button type="button" className="btn-text" onClick={() => setShowReviewModal(true)}>
              Review now
            </button>
          </p>
        </div>
      )}

      <div className="dashboard-grid">
        <div>
          <div className="section">
            <h2>Your matches</h2>
            {matches.length === 0 && <p className="muted">No matches yet.</p>}
            {matches.map((match) => {
              const counterparty = role === 'client' ? match.worker : match.gig?.client;
              return (
                <div key={match.id} className="card card-row">
                  <div>
                    <span className="card-title">{match.gig?.title ?? 'Gig'}</span>
                    {counterparty && <IdentityLink id={counterparty.id} name={counterparty.name} size={24} />}
                  </div>
                  <span className={statusBadgeClass(match.status)}>{match.status}</span>
                </div>
              );
            })}
          </div>

          {role === 'worker' && (
            <div className="section">
              <h2>Skills</h2>
              {verifiedSkills.length === 0 ? (
                <p className="muted">No verified skills yet.</p>
              ) : (
                <div className="skill-tag-list">
                  {verifiedSkills.map((us) => (
                    <span key={us.id} className="skill-tag">
                      <SkillThumbnail category={us.skill?.category} size={20} />
                      {us.skill?.name}
                    </span>
                  ))}
                </div>
              )}
              <button type="button" className="btn-text" onClick={() => setShowSkillModal(true)}>
                + Add new skill
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div className="section">
              <h2>Skill reviews</h2>
              {tasksLoading && <p className="muted">Loading...</p>}
              {!tasksLoading &&
                (pendingReviews.length === 0 ? (
                  <p className="muted">Nothing to review right now.</p>
                ) : (
                  <p className="muted">{pendingReviews.length} task(s) awaiting your review.</p>
                ))}
              <button type="button" className="btn-text" onClick={() => setShowReviewModal(true)}>
                Review submissions
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div className="section">
              <h2>Gig approvals</h2>
              {gigsLoading && <p className="muted">Loading...</p>}
              {!gigsLoading &&
                (pendingGigs.length === 0 ? (
                  <p className="muted">Nothing to review right now.</p>
                ) : (
                  <p className="muted">{pendingGigs.length} gig(s) awaiting your review.</p>
                ))}
              <button type="button" className="btn-text" onClick={() => setShowGigModal(true)}>
                Review submissions
              </button>
            </div>
          )}
        </div>

        <div>
          {(role === 'worker' || role === 'client') && (
            <div className="section">
              <h2>Wallet</h2>
              <WalletSummary transactions={transactions} loading={transactionsLoading} />
            </div>
          )}

          <div className="section">
            <h2>Account settings</h2>
            <ProfileEditor />
            <ExportDataButton />
          </div>
        </div>
      </div>

      {showSkillModal && (
        <Modal title="Add a new skill" onClose={() => setShowSkillModal(false)}>
          <SkillVerificationForm tasks={tasks} onSubmitted={refreshTasks} />
        </Modal>
      )}

      {showReviewModal && (
        <Modal title="Skill verification reviews" onClose={() => setShowReviewModal(false)}>
          <AdminReviewQueue tasks={tasks} onReviewed={refreshTasks} />
        </Modal>
      )}

      {showGigModal && (
        <Modal title="Gig approvals" onClose={() => setShowGigModal(false)}>
          <GigApprovalQueue gigs={gigs} onReviewed={refreshGigs} />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
