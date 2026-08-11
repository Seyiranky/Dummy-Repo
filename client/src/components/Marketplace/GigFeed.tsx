import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { fetchMatches } from '../../store/slices/matchSlice';
import { gigApi } from '../../api/gigApi';
import { matchApi } from '../../api/matchApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import type { Candidate, Gig } from '../../types';

const CandidateList = ({ gig, onMatched }: { gig: Gig; onMatched: () => void }) => {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState<string | null>(null);

  const loadCandidates = () => {
    setLoading(true);
    gigApi
      .getCandidates(gig.id)
      .then(setCandidates)
      .finally(() => setLoading(false));
  };

  const handleMatch = async (workerId: string) => {
    setMatching(workerId);
    try {
      await matchApi.createMatch({ gigId: gig.id, workerId });
      onMatched();
    } finally {
      setMatching(null);
    }
  };

  if (candidates === null) {
    return (
      <button type="button" onClick={loadCandidates} disabled={loading}>
        {loading ? 'Finding candidates...' : 'View ranked candidates'}
      </button>
    );
  }

  if (candidates.length === 0) {
    return <p className="muted">No verified workers nearby for this skill yet.</p>;
  }

  return (
    <div>
      {candidates.map((candidate) => (
        <div key={candidate.workerId} className="card card-row candidate-row">
          <div className="identity">
            <IdentityLink id={candidate.workerId} name={candidate.name} size={28} />
            <span className="muted">
              trust {candidate.trustScore.toFixed(1)}, {candidate.distanceKm} km away
            </span>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleMatch(candidate.workerId)}
            disabled={matching !== null}
          >
            {matching === candidate.workerId ? 'Matching...' : 'Match'}
          </button>
        </div>
      ))}
    </div>
  );
};

const GigFeed = () => {
  const dispatch = useAppDispatch();
  const { role, profile } = useAppSelector((state) => state.auth);
  const gigs = useAppSelector((state) => state.gigs.items);
  const status = useAppSelector((state) => state.gigs.status);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchGigs());
    dispatch(fetchMatches());
  };

  const visibleGigs =
    role === 'client' && profile ? gigs.filter((gig) => gig.clientId === profile.id) : gigs.filter((gig) => gig.status === 'open');

  return (
    <div className="section">
      <h2>{role === 'client' ? 'Your gigs' : 'Open gigs'}</h2>
      {status === 'loading' && <p className="muted">Loading...</p>}
      {visibleGigs.length === 0 && status !== 'loading' && <p className="muted">Nothing here yet.</p>}
      {visibleGigs.map((gig) => (
        <div key={gig.id} className="card">
          <div className="card-row">
            <div className="skill-line">
              <SkillThumbnail category={gig.skill?.category} size={48} />
              <div>
                <span className="card-title">{gig.title}</span>
                <div className="muted">{gig.skill?.name}</div>
              </div>
            </div>
            <span className={statusBadgeClass(gig.status)}>{gig.status}</span>
          </div>
          <p>{gig.description}</p>
          <p className="muted">Budget: {gig.budget} RWF</p>
          {role === 'client' && gig.status === 'open' && <CandidateList gig={gig} onMatched={refresh} />}
        </div>
      ))}
    </div>
  );
};

export default GigFeed;
