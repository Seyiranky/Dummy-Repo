import { useAppSelector } from '../../store/hooks';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import type { Transaction } from '../../types';

const PREVIEW_COUNT = 5;

interface WalletSummaryProps {
  transactions: Transaction[];
  loading: boolean;
}

const WalletSummary = ({ transactions, loading }: WalletSummaryProps) => {
  const { role } = useAppSelector((state) => state.auth);
  const isClient = role === 'client';

  if (loading) {
    return <p className="muted">Loading...</p>;
  }

  if (transactions.length === 0) {
    return <p className="muted">No transactions yet — complete a match to see it here.</p>;
  }

  return (
    <div className="wallet-list">
      {transactions.slice(0, PREVIEW_COUNT).map((t) => {
        const counterparty = isClient ? t.match?.worker : t.match?.gig?.client;
        return (
          <div key={t.id} className="card card-row">
            <div>
              <span className="card-title">{t.match?.gig?.title ?? 'Gig'}</span>
              {counterparty && <IdentityLink id={counterparty.id} name={counterparty.name} size={22} />}
            </div>
            <div className="text-right">
              <div className="card-title">{Number(t.amount).toLocaleString()} RWF</div>
              <span className={statusBadgeClass(t.status)}>{t.status}</span>
            </div>
          </div>
        );
      })}
      {transactions.length > PREVIEW_COUNT && (
        <p className="muted">+{transactions.length - PREVIEW_COUNT} more</p>
      )}
    </div>
  );
};

export default WalletSummary;
