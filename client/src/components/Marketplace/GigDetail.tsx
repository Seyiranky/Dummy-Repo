import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { gigApi } from '../../api/gigApi';
import { gigApplicationApi } from '../../api/gigApplicationApi';
import { adminApi } from '../../api/adminApi';
import IdentityLink from '../common/IdentityLink';
import GigThumbnail from '../common/GigThumbnail';
import { statusBadgeClass } from '../../utils/statusBadge';
import { locationName } from '../../utils/locationName';
import type { Gig, GigApplication } from '../../types';

const GigDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { role, profile } = useAppSelector((state) => state.auth);
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const refresh = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([gigApi.getGig(id), gigApplicationApi.listApplications({ gigId: id })])
      .then(([gigData, applicationsData]) => {
        setGig(gigData);
        setApplications(applicationsData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="muted">{t('marketplace.gigDetail.loading')}</p>;
  if (!gig) return <p className="form-error">{t('marketplace.gigDetail.notFound')}</p>;

  const isOwner = role === 'client' && profile?.id === gig.clientId;
  const myApplication = role === 'worker' ? applications.find((a) => a.workerId === profile?.id) : undefined;
  const sortedApplicants = [...applications].sort(
    (a, b) => (b.worker?.trustScore ?? 0) - (a.worker?.trustScore ?? 0),
  );

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await gigApplicationApi.applyToGig(id);
      refresh();
    } finally {
      setApplying(false);
    }
  };

  const handleGigDecision = async (decision: 'approved' | 'rejected') => {
    if (!id) return;
    setBusyId(id);
    try {
      await adminApi.reviewGig(id, decision);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleApplicationDecision = async (applicationId: string, decision: 'approved' | 'rejected') => {
    setBusyId(applicationId);
    try {
      await gigApplicationApi.reviewApplication(applicationId, decision);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="section">
        <div className="skill-line">
          <GigThumbnail gig={gig} size={56} />
          <div>
            <span className="card-title">{gig.title}</span>
            <div className="muted">
              {gig.skill?.name}
              {locationName(gig.locationLat, gig.locationLng) && ` · ${locationName(gig.locationLat, gig.locationLng)}`}
            </div>
          </div>
        </div>
        <p>{gig.description}</p>
        <div className="card-row">
          <span className="muted">{t('marketplace.gigDetail.budget', { amount: gig.budget })}</span>
          <span className={statusBadgeClass(gig.status)}>{gig.status.replace('_', ' ')}</span>
        </div>
        {gig.client && (
          <div>
            <span className="muted">{t('marketplace.gigDetail.postedBy')} </span>
            <IdentityLink id={gig.client.id} name={gig.client.name} size={24} />
          </div>
        )}
      </div>

      {isOwner && gig.status === 'pending_review' && (
        <div className="section">
          <p className="muted">{t('marketplace.gigDetail.pendingReviewNotice')}</p>
        </div>
      )}
      {isOwner && gig.status === 'rejected' && (
        <div className="section">
          <p className="form-error">{t('marketplace.gigDetail.rejectedNotice')}</p>
        </div>
      )}

      {role === 'admin' && gig.status === 'pending_review' && (
        <div className="section">
          <h2>{t('marketplace.gigDetail.approveThisGig')}</h2>
          <p className="muted">{t('marketplace.gigDetail.approveInstructions')}</p>
          <div className="card-row">
            <button
              type="button"
              className="btn-success"
              onClick={() => handleGigDecision('approved')}
              disabled={busyId === id}
            >
              {t('marketplace.gigDetail.approve')}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => handleGigDecision('rejected')}
              disabled={busyId === id}
            >
              {t('marketplace.gigDetail.reject')}
            </button>
          </div>
        </div>
      )}

      {role === 'worker' && (
        <div className="section">
          <h2>{t('marketplace.gigDetail.yourApplication')}</h2>
          {!myApplication && gig.status !== 'open' && (
            <p className="muted">
              {gig.status === 'pending_review'
                ? t('marketplace.gigDetail.awaitingApprovalNotice')
                : t('marketplace.gigDetail.noLongerAcceptingNotice')}
            </p>
          )}
          {!myApplication && gig.status === 'open' && (
            <button type="button" className="btn-primary" onClick={handleApply} disabled={applying}>
              {applying ? t('marketplace.gigDetail.applying') : t('marketplace.gigDetail.applyButton')}
            </button>
          )}
          {myApplication && (
            <p>
              {t('marketplace.gigDetail.statusLabel')}{' '}
              <span className={statusBadgeClass(myApplication.status)}>{myApplication.status}</span>
            </p>
          )}
        </div>
      )}

      {(role === 'admin' || isOwner) && (
        <div className="section">
          <h2>{t('marketplace.gigDetail.applicants', { count: applications.length })}</h2>
          {applications.length === 0 && <p className="muted">{t('marketplace.gigDetail.noApplicationsYet')}</p>}
          {sortedApplicants.map((application) => (
            <div key={application.id} className="card card-row candidate-row">
              <div className="identity">
                {application.worker && (
                  <IdentityLink id={application.worker.id} name={application.worker.name} size={28} />
                )}
                <span className="muted">
                  {t('marketplace.gigDetail.trustLabel', { score: application.worker?.trustScore.toFixed(1) })}
                </span>
                <span className={statusBadgeClass(application.status)}>{application.status}</span>
              </div>
              {role === 'admin' && application.status === 'pending' && (
                <div className="card-row">
                  <button
                    type="button"
                    className="btn-success"
                    onClick={() => handleApplicationDecision(application.id, 'approved')}
                    disabled={busyId === application.id}
                  >
                    {t('marketplace.gigDetail.approve')}
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleApplicationDecision(application.id, 'rejected')}
                    disabled={busyId === application.id}
                  >
                    {t('marketplace.gigDetail.reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GigDetail;
