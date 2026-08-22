import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import SkillVerificationForm from '../Verification/SkillVerificationForm';
import AdminReviewQueue from '../Verification/AdminReviewQueue';
import GigApprovalQueue from '../Admin/GigApprovalQueue';
import type { Gig, SkillTask, Transaction, UserSkill } from '../../types';

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { profile, role } = useAppSelector((state) => state.auth);
  const matches = useAppSelector((state) => state.matches.items);
  const [tasks, setTasks] = useState<SkillTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      transactionApi.listTransactions().then(setTransactions);
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
          <h1 className="profile-name">{t('dashboard.welcome', { name: profile.name })}</h1>
          <span className="badge">{profile.role}</span>
        </div>
      </div>

      {needsLocation && (
        <div className="section">
          <p className="form-error">
            {t('dashboard.locationPromptBefore')} <Link to="/settings">{t('sidebar.settings')}</Link>{' '}
            {t('dashboard.locationPromptAfter')}
          </p>
        </div>
      )}

      <div className="stat-grid">
        {(role === 'worker' || role === 'client') && (
          <>
            <StatCard
              label={t('dashboard.trustScore')}
              value={<TrustScoreRing trustScore={profile.trustScore} size={72} />}
            />
            <StatCard
              label={role === 'client' ? t('dashboard.totalPaid') : t('dashboard.totalEarned')}
              value={`${confirmedTotal.toLocaleString()} RWF`}
            />
            <StatCard label={t('dashboard.activeMatches')} value={activeMatches} />
          </>
        )}
        {role === 'admin' && (
          <>
            <StatCard label={t('dashboard.pendingReviews')} value={pendingReviews.length} />
            <StatCard label={t('dashboard.reviewsCompleted')} value={decidedReviews.length} />
            <StatCard label={t('dashboard.pendingGigApprovals')} value={pendingGigs.length} />
          </>
        )}
      </div>

      {role === 'client' && (
        <div className="section">
          <h2>{t('dashboard.getStarted')}</h2>
          <p>
            {t('dashboard.clientGetStarted')}{' '}
            <Link to="/marketplace">{t('dashboard.goToMarketplace')}</Link>
          </p>
        </div>
      )}

      {role === 'worker' && (
        <div className="section">
          <h2>{t('dashboard.getStarted')}</h2>
          <p>
            <button type="button" className="btn-text" onClick={() => setShowSkillModal(true)}>
              {t('dashboard.submitSkillTask')}
            </button>{' '}
            {t('dashboard.workerGetStartedAfter')}{' '}
            <Link to="/marketplace">{t('dashboard.openGigsLink')}</Link>.
          </p>
        </div>
      )}

      {role === 'admin' && !tasksLoading && pendingReviews.length > 0 && (
        <div className="section">
          <p>
            {t('dashboard.pendingTasksNotice', { count: pendingReviews.length })}{' '}
            <button type="button" className="btn-text" onClick={() => setShowReviewModal(true)}>
              {t('dashboard.reviewNow')}
            </button>
          </p>
        </div>
      )}

      <div className="section">
        <h2>{t('dashboard.yourMatches')}</h2>
        {matches.length === 0 && <p className="muted">{t('dashboard.noMatchesYet')}</p>}
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
          <h2>{t('dashboard.skills')}</h2>
          {verifiedSkills.length === 0 ? (
            <p className="muted">{t('dashboard.noVerifiedSkills')}</p>
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
            {t('dashboard.addNewSkill')}
          </button>
        </div>
      )}

      {role === 'admin' && (
        <div className="section">
          <h2>{t('dashboard.skillReviews')}</h2>
          {tasksLoading && <p className="muted">{t('marketplace.gigFeed.loading')}</p>}
          {!tasksLoading &&
            (pendingReviews.length === 0 ? (
              <p className="muted">{t('dashboard.nothingToReview')}</p>
            ) : (
              <p className="muted">{t('dashboard.tasksAwaitingReview', { count: pendingReviews.length })}</p>
            ))}
          <button type="button" className="btn-text" onClick={() => setShowReviewModal(true)}>
            {t('dashboard.reviewSubmissions')}
          </button>
        </div>
      )}

      {role === 'admin' && (
        <div className="section">
          <h2>{t('dashboard.gigApprovals')}</h2>
          {gigsLoading && <p className="muted">{t('marketplace.gigFeed.loading')}</p>}
          {!gigsLoading &&
            (pendingGigs.length === 0 ? (
              <p className="muted">{t('dashboard.nothingToReview')}</p>
            ) : (
              <p className="muted">{t('dashboard.gigsAwaitingReview', { count: pendingGigs.length })}</p>
            ))}
          <button type="button" className="btn-text" onClick={() => setShowGigModal(true)}>
            {t('dashboard.reviewSubmissions')}
          </button>
        </div>
      )}

      {showSkillModal && (
        <Modal title={t('dashboard.addSkillModalTitle')} onClose={() => setShowSkillModal(false)}>
          <SkillVerificationForm tasks={tasks} onSubmitted={refreshTasks} />
        </Modal>
      )}

      {showReviewModal && (
        <Modal title={t('dashboard.skillReviewModalTitle')} onClose={() => setShowReviewModal(false)}>
          <AdminReviewQueue tasks={tasks} onReviewed={refreshTasks} />
        </Modal>
      )}

      {showGigModal && (
        <Modal title={t('dashboard.gigApprovalModalTitle')} onClose={() => setShowGigModal(false)}>
          <GigApprovalQueue gigs={gigs} onReviewed={refreshGigs} />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
