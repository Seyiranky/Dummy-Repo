import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { transactionApi } from '../../api/transactionApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import type { Transaction } from '../../types';

const WalletSummary = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const isClient = role === 'client';

  useEffect(() => {
    transactionApi
      .listTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const confirmedTotal = transactions
    .filter((t) => t.status === 'confirmed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="section">
      <div className="card-row">
        <h2>Wallet</h2>
        <Link to="/wallet">View full wallet →</Link>
      </div>

      <div className="trust-score-stat align-start">
        <span className="muted">{isClient ? 'Total paid (confirmed)' : 'Total earned (confirmed)'}</span>
        <span className="trust-score">{confirmedTotal.toLocaleString()} RWF</span>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {!loading && transactions.length === 0 && (
        <p className="muted">No transactions yet — complete a match to see it here.</p>
      )}
      {transactions.slice(0, 3).map((t) => {
        const counterparty = isClient ? t.match?.worker : t.match?.gig?.client;
        return (
          <div key={t.id} className="card card-row">
            <div>
              <span className="card-title">{t.match?.gig?.title ?? 'Gig'}</span>
              {counterparty && <IdentityLink id={counterparty.id} name={counterparty.name} size={24} />}
            </div>
            <div className="text-right">
              <div className="card-title">{Number(t.amount).toLocaleString()} RWF</div>
              <span className={statusBadgeClass(t.status)}>{t.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WalletSummary;
