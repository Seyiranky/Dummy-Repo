import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { transactionApi } from '../../api/transactionApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import type { Transaction } from '../../types';

const Wallet = () => {
  const { role } = useAppSelector((state) => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi
      .listTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const isClient = role === 'client';
  const confirmedTotal = transactions
    .filter((t) => t.status === 'confirmed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div>
      <div className="section">
        <h1>Wallet</h1>
        <p className="muted">
          Simulated mobile-money history — no real funds move through this platform.
        </p>
        <p>
          <span className="muted">{isClient ? 'Total paid (confirmed)' : 'Total earned (confirmed)'}</span>
          <br />
          <span className="trust-score">{confirmedTotal.toLocaleString()} RWF</span>
        </p>
      </div>

      <div className="section">
        <h2>Transaction history</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && transactions.length === 0 && (
          <p className="muted">No transactions yet — complete a match to see it here.</p>
        )}
        {transactions.map((t) => {
          const counterparty = isClient ? t.match?.worker : t.match?.gig?.client;
          return (
            <div key={t.id} className="card">
              <div className="card-row">
                <div>
                  <span className="card-title">{t.match?.gig?.title ?? 'Gig'}</span>
                  <div className="muted">
                    {isClient ? 'Paid to ' : 'Received from '}
                    {counterparty ? (
                      <Link to={`/profile/${counterparty.id}`} className="link-reset">
                        {counterparty.name}
                      </Link>
                    ) : (
                      'unknown'
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="card-title">{Number(t.amount).toLocaleString()} RWF</div>
                  <span className={statusBadgeClass(t.status)}>{t.status}</span>
                </div>
              </div>
              <p className="muted">
                {t.provider} · {t.reference} · {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wallet;
