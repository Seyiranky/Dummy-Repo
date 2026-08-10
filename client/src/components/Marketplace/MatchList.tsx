import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMatches } from '../../store/slices/matchSlice';
import { matchApi } from '../../api/matchApi';
import { transactionApi } from '../../api/transactionApi';
import { reviewApi } from '../../api/reviewApi';
import type { Match, MatchStatus } from '../../types';

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
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="button" onClick={handleSubmit} disabled={submitting}>
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
        return (
          <div key={match.id} className="card">
            <div className="card-row">
              <div>
                <strong>{match.gig?.title ?? 'Gig'}</strong>
                <div className="muted">{isWorker ? match.gig?.client?.name : match.worker?.name}</div>
              </div>
              <span className="badge">{match.status}</span>
            </div>

            {match.status === 'pending' && isWorker && (
              <button type="button" onClick={() => transition(match.id, 'accepted')} disabled={busyId === match.id}>
                Accept
              </button>
            )}
            {match.status === 'pending' && !isWorker && <p className="muted">Waiting for worker to accept.</p>}

            {match.status === 'accepted' && (
              <button type="button" onClick={() => transition(match.id, 'completed')} disabled={busyId === match.id}>
                Mark completed
              </button>
            )}

            {match.status === 'completed' && match.transaction && (
              <div>
                <p className="muted">
                  Payment ({match.transaction.provider}): {match.transaction.status}
                </p>
                {match.transaction.status === 'initiated' && (
                  <button
                    type="button"
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
