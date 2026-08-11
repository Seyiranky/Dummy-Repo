import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import GigForm from '../components/Marketplace/GigForm';
import GigFeed from '../components/Marketplace/GigFeed';
import MatchList from '../components/Marketplace/MatchList';
import Toggle from '../components/common/Toggle';
import Modal from '../components/common/Modal';

type MarketplaceTab = 'gigs' | 'matches';

const MarketplacePage = () => {
  const role = useAppSelector((state) => state.auth.role);
  const [tab, setTab] = useState<MarketplaceTab>('gigs');
  const [postingGig, setPostingGig] = useState(false);

  return (
    <div>
      <div className="marketplace-header">
        <Toggle
          value={tab}
          onChange={setTab}
          options={[
            { value: 'gigs', label: role === 'client' ? 'Your Gigs' : 'Open Gigs' },
            { value: 'matches', label: 'Your Matches' },
          ]}
        />
        {role === 'client' && (
          <button
            type="button"
            className="btn-primary marketplace-header-action"
            onClick={() => setPostingGig(true)}
          >
            Post a gig
          </button>
        )}
      </div>

      {tab === 'gigs' ? <GigFeed /> : <MatchList />}

      {postingGig && (
        <Modal title="Post a gig" onClose={() => setPostingGig(false)}>
          <GigForm onPosted={() => setPostingGig(false)} />
        </Modal>
      )}
    </div>
  );
};

export default MarketplacePage;
