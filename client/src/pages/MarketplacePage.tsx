import { useAppSelector } from '../store/hooks';
import GigForm from '../components/Marketplace/GigForm';
import GigFeed from '../components/Marketplace/GigFeed';
import MatchList from '../components/Marketplace/MatchList';

const MarketplacePage = () => {
  const role = useAppSelector((state) => state.auth.role);

  return (
    <div>
      <div className="two-col">
        <div>
          {role === 'client' && <GigForm />}
          <GigFeed />
        </div>
        <div>
          <MatchList />
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
