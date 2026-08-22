import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { transactionApi } from '../../api/transactionApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import StatCard from '../Dashboard/StatCard';
import type { Transaction } from '../../types';

const Wallet = () => {
  const { t } = useTranslation();
  const { role } = useAppSelector((state) => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const isClient = role === 'client';

  useEffect(() => {
    setLoading(true);
    transactionApi
      .listTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const confirmedTotal = transactions
    .filter((t) => t.status === 'confirmed')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingTotal = transactions
    .filter((t) => t.status === 'initiated')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const steps = isClient
    ? [
        { title: t('wallet.clientStep1Title'), body: t('wallet.clientStep1Body') },
        { title: t('wallet.clientStep2Title'), body: t('wallet.clientStep2Body') },
        { title: t('wallet.clientStep3Title'), body: t('wallet.clientStep3Body') },
      ]
    : [
        { title: t('wallet.workerStep1Title'), body: t('wallet.workerStep1Body') },
        { title: t('wallet.workerStep2Title'), body: t('wallet.workerStep2Body') },
        { title: t('wallet.workerStep3Title'), body: t('wallet.workerStep3Body') },
      ];

  return (
    <div>
      <h1>{t('wallet.title')}</h1>
      <p className="page-subtitle">{isClient ? t('wallet.subtitleClient') : t('wallet.subtitleWorker')}</p>

      <div className="stat-grid">
        <StatCard
          label={isClient ? t('wallet.totalPaid') : t('wallet.totalEarned')}
          value={`${confirmedTotal.toLocaleString()} RWF`}
        />
        <StatCard label={t('wallet.pending')} value={`${pendingTotal.toLocaleString()} RWF`} />
        <StatCard label={t('wallet.transactions')} value={transactions.length} />
      </div>

      <div className="section">
        <h2>{t('wallet.howPaymentsWork')}</h2>
        <div className="explainer-grid">
          {steps.map((step, index) => (
            <div className="explainer-card" key={step.title}>
              <span className="explainer-step">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
        <p className="muted">{t('wallet.simulatedNotice')}</p>
      </div>

      <div className="section">
        <h2>{t('wallet.transactionHistory')}</h2>
        {loading && <p className="muted">{t('wallet.loading')}</p>}
        {!loading && transactions.length === 0 && <p className="muted">{t('wallet.noTransactions')}</p>}
        {!loading && transactions.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('wallet.colGig')}</th>
                  <th>{isClient ? t('wallet.colWorker') : t('wallet.colClient')}</th>
                  <th>{t('wallet.colAmount')}</th>
                  <th>{t('wallet.colStatus')}</th>
                  <th>{t('wallet.colDate')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t2) => {
                  const counterparty = isClient ? t2.match?.worker : t2.match?.gig?.client;
                  return (
                    <tr key={t2.id}>
                      <td>{t2.match?.gig?.title ?? t('wallet.colGig')}</td>
                      <td>
                        {counterparty ? (
                          <IdentityLink id={counterparty.id} name={counterparty.name} size={22} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{Number(t2.amount).toLocaleString()} RWF</td>
                      <td>
                        <span className={statusBadgeClass(t2.status)}>{t2.status}</span>
                      </td>
                      <td>{new Date(t2.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
