import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { matchApi } from '../../api/matchApi';
import { transactionApi } from '../../api/transactionApi';
import { reviewApi } from '../../api/reviewApi';
import Select from '../common/Select';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { Match, MatchStatus } from '../../types';

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: String(n) }));

const ReviewForm = ({ match, onSubmitted }: { match: Match; onSubmitted: () => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await reviewApi.createReview({ matchId: match.id, rating, comment: comment || undefined });
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-row">
      <label>
        Rating
        <Select value={String(rating)} onChange={(v) => setRating(Number(v))} options={RATING_OPTIONS} />
      </label>
      <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Leave review'}
      </button>
    </div>
  );
};

const MatchList = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.auth);
  const matches = useAppSelector((state) => state.matches.items);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const refresh = () => dispatch(fetchMatches());

  const transition = async (matchId: string, status: MatchStatus) => {
    setBusyId(matchId);
    try {
      await matchApi.updateMatchStatus(matchId, status);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const confirmPayment = async (transactionId: string) => {
    setBusyId(transactionId);
    try {
      await transactionApi.confirmTransaction(transactionId);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (!profile) return null;
  const isWorker = profile.role === 'worker';

  return (
    <div className="section">
      <h2>Your matches</h2>
      {matches.length === 0 && <p className="muted">No matches yet — post or get matched to a gig first.</p>}
      {matches.map((match) => {
        const alreadyReviewed = match.reviews?.some((r) => r.authorId === profile.id);
        const counterparty = isWorker ? match.gig?.client : match.worker;
        return (
          <div key={match.id} className="card">
            <div className="card-row">
              <div>
                <span className="card-title">{match.gig?.title ?? 'Gig'}</span>
                <div className="muted">
                  {counterparty ? (
                    <Link to={`/profile/${counterparty.id}`} className="link-reset">
                      {counterparty.name}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </div>
              </div>
              <span className={statusBadgeClass(match.status)}>{match.status}</span>
            </div>

            {match.status === 'pending' && isWorker && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => transition(match.id, 'accepted')}
                disabled={busyId === match.id}
              >
                Accept
              </button>
            )}
            {match.status === 'pending' && !isWorker && <p className="muted">Waiting for worker to accept.</p>}

            {match.status === 'accepted' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => transition(match.id, 'completed')}
                disabled={busyId === match.id}
              >
                Mark completed
              </button>
            )}

            {match.status === 'completed' && match.transaction && (
              <div>
                <p className="muted">
                  Payment ({match.transaction.provider}):{' '}
                  <span className={statusBadgeClass(match.transaction.status)}>{match.transaction.status}</span>
                </p>
                {match.transaction.status === 'initiated' && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => confirmPayment(match.transaction!.id)}
                    disabled={busyId === match.transaction.id}
                  >
                    Confirm payment
                  </button>
                )}
                {match.transaction.status === 'confirmed' &&
                  (alreadyReviewed ? (
                    <p className="muted">You've reviewed this match.</p>
                  ) : (
                    <ReviewForm match={match} onSubmitted={refresh} />
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MatchList;
