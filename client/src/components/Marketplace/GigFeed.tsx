import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchGigs } from '../../store/slices/gigSlice';
import { fetchMatches } from '../../store/slices/matchSlice';
import { gigApi } from '../../api/gigApi';
import { matchApi } from '../../api/matchApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import Modal from '../common/Modal';
import type { Candidate, Gig } from '../../types';

const CandidatesModal = ({
  gig,
  onClose,
  onMatched,
}: {
  gig: Gig;
  onClose: () => void;
  onMatched: () => void;
}) => {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<string | null>(null);

  useEffect(() => {
    gigApi
      .getCandidates(gig.id)
      .then(setCandidates)
      .finally(() => setLoading(false));
  }, [gig.id]);

  const handleMatch = async (workerId: string) => {
    setMatching(workerId);
    try {
      await matchApi.createMatch({ gigId: gig.id, workerId });
      onMatched();
      onClose();
    } finally {
      setMatching(null);
    }
  };

  return (
    <Modal title={`Candidates for "${gig.title}"`} onClose={onClose}>
      {loading && <p className="muted">Finding candidates...</p>}
      {!loading && candidates?.length === 0 && (
        <p className="muted">No verified workers nearby for this skill yet.</p>
      )}
      {!loading &&
        candidates?.map((candidate) => (
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
    </Modal>
  );
};

const GigFeed = () => {
  const dispatch = useAppDispatch();
  const { role, profile } = useAppSelector((state) => state.auth);
  const gigs = useAppSelector((state) => state.gigs.items);
  const status = useAppSelector((state) => state.gigs.status);
  const [candidateGig, setCandidateGig] = useState<Gig | null>(null);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchGigs());
    dispatch(fetchMatches());
  };

  const visibleGigs =
    role === 'client' && profile
      ? gigs.filter((gig) => gig.clientId === profile.id)
      : gigs.filter((gig) => gig.status === 'open');

  return (
    <div>
      {status === 'loading' && <p className="muted">Loading...</p>}
      {visibleGigs.length === 0 && status !== 'loading' && <p className="muted">Nothing here yet.</p>}
      <div className="card-grid">
        {visibleGigs.map((gig) => (
          <div key={gig.id} className="card gig-card">
            <div className="skill-line">
              <SkillThumbnail category={gig.skill?.category} size={48} />
              <div>
                <span className="card-title">{gig.title}</span>
                <div className="muted">{gig.skill?.name}</div>
              </div>
            </div>
            <p className="gig-card-description">{gig.description}</p>
            <div className="gig-card-footer">
              <div className="card-row">
                <span className="muted">Budget: {gig.budget} RWF</span>
                <span className={statusBadgeClass(gig.status)}>{gig.status}</span>
              </div>
              {role === 'client' && gig.status === 'open' && (
                <button type="button" onClick={() => setCandidateGig(gig)}>
                  View ranked candidates
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {candidateGig && (
        <CandidatesModal gig={candidateGig} onClose={() => setCandidateGig(null)} onMatched={refresh} />
      )}
    </div>
  );
};

export default GigFeed;
