import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAppSelector } from '../../store/hooks';
import { statusBadgeClass } from '../../utils/statusBadge';
import IdentityLink from '../common/IdentityLink';
import Toggle from '../common/Toggle';
import { DeleteIcon, ReactivateIcon, SuspendIcon } from '../common/icons';
import AdminNav from './AdminNav';
import type { User } from '../../types';

type RoleFilter = 'all' | 'worker' | 'client';

const AdminUsers = () => {
  const { profile } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    adminApi
      .listUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const moderate = async (user: User, action: 'suspend' | 'activate') => {
    setBusyId(user.id);
    setError(null);
    try {
      const updated = await adminApi.moderateUser(user.id, action);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      setError(`Could not ${action} ${user.name}.`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (user: User) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This permanently removes their account and everything tied to it — gigs, ` +
        `applications, matches, payments, and reviews. This cannot be undone.`,
    );
    if (!confirmed) return;

    setBusyId(user.id);
    setError(null);
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      setError(`Could not delete ${user.name}.`);
    } finally {
      setBusyId(null);
    }
  };

  const visibleUsers = users.filter((u) => filter === 'all' || u.role === filter);

  return (
    <div>
      <div className="section">
        <h1>Users</h1>
        <p className="muted">Suspend an account to block sign-in immediately, or delete it permanently.</p>
      </div>

      <AdminNav />

      <div className="section">
        <Toggle<RoleFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'worker', label: 'Workers' },
            { value: 'client', label: 'Clients' },
          ]}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Loading users...</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Trust score</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => {
                const isSelf = u.id === profile?.id;
                const canModerate = u.role !== 'admin' && !isSelf;
                return (
                  <tr key={u.id}>
                    <td>
                      <IdentityLink id={u.id} name={u.name} size={24} />
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge">{u.role}</span>
                    </td>
                    <td>
                      <span className={statusBadgeClass(u.status)}>{u.status}</span>
                    </td>
                    <td>{u.trustScore.toFixed(1)}</td>
                    <td>{new Date(u.createdAt ?? '').toLocaleDateString()}</td>
                    <td>
                      {canModerate ? (
                        <div className="actions-row">
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              className="icon-btn btn-danger"
                              disabled={busyId === u.id}
                              onClick={() => moderate(u, 'suspend')}
                              aria-label={`Suspend ${u.name}`}
                              title={`Suspend ${u.name}`}
                            >
                              <SuspendIcon />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="icon-btn btn-success"
                              disabled={busyId === u.id}
                              onClick={() => moderate(u, 'activate')}
                              aria-label={`Reactivate ${u.name}`}
                              title={`Reactivate ${u.name}`}
                            >
                              <ReactivateIcon />
                            </button>
                          )}
                          <button
                            type="button"
                            className="icon-btn btn-danger"
                            disabled={busyId === u.id}
                            onClick={() => remove(u)}
                            aria-label={`Delete ${u.name}`}
                            title={`Delete ${u.name}`}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      ) : (
                        <span className="muted">{isSelf ? 'This is you' : '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
