import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { transactionApi } from '../../api/transactionApi';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import StatCard from '../Dashboard/StatCard';
import type { Transaction } from '../../types';

const WORKER_STEPS = [
  {
    title: 'Get matched to a gig',
    body: 'Apply to an open gig and get approved by an admin, so a match is created for you.',
  },
  {
    title: 'Complete the work',
    body: 'Finish the job. Once you’re done, the client marks the match as completed.',
  },
  {
    title: 'Get paid via MTN MoMo',
    body: 'The client confirms the simulated MTN MoMo payment and the funds show up here as confirmed.',
  },
];

const CLIENT_STEPS = [
  {
    title: 'Post a gig',
    body: 'Describe the job and set a budget. An admin reviews it before it goes live to workers.',
  },
  {
    title: 'Approve completed work',
    body: 'Once your matched worker finishes the job, mark the match as completed.',
  },
  {
    title: 'Pay via MTN MoMo',
    body: 'Confirm the simulated MTN MoMo payment to release the funds to the worker.',
  },
];

const Wallet = () => {
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
  const steps = isClient ? CLIENT_STEPS : WORKER_STEPS;

  return (
    <div>
      <h1>Wallet</h1>
      <p className="page-subtitle">
        {isClient
          ? 'Track what you’ve paid out to workers through Isoko Talents.'
          : 'Track what you’ve earned through Isoko Talents.'}
      </p>

      <div className="stat-grid">
        <StatCard
          label={isClient ? 'Total paid (confirmed)' : 'Total earned (confirmed)'}
          value={`${confirmedTotal.toLocaleString()} RWF`}
        />
        <StatCard label="Pending" value={`${pendingTotal.toLocaleString()} RWF`} />
        <StatCard label="Transactions" value={transactions.length} />
      </div>

      <div className="section">
        <h2>How payments work</h2>
        <div className="explainer-grid">
          {steps.map((step, index) => (
            <div className="explainer-card" key={step.title}>
              <span className="explainer-step">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
        <p className="muted">
          Isoko Talents uses a simulated MTN Mobile Money integration for this demo &mdash; no real money
          moves.
        </p>
      </div>

      <div className="section">
        <h2>Transaction history</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && transactions.length === 0 && (
          <p className="muted">No transactions yet &mdash; complete a match to see it here.</p>
        )}
        {!loading && transactions.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gig</th>
                  <th>{isClient ? 'Worker' : 'Client'}</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const counterparty = isClient ? t.match?.worker : t.match?.gig?.client;
                  return (
                    <tr key={t.id}>
                      <td>{t.match?.gig?.title ?? 'Gig'}</td>
                      <td>
                        {counterparty ? (
                          <IdentityLink id={counterparty.id} name={counterparty.name} size={22} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{Number(t.amount).toLocaleString()} RWF</td>
                      <td>
                        <span className={statusBadgeClass(t.status)}>{t.status}</span>
                      </td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
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
