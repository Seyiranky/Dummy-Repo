const SUCCESS_STATUSES = new Set(['completed', 'approved', 'confirmed']);
const WARNING_STATUSES = new Set(['pending', 'initiated']);
const ERROR_STATUSES = new Set(['rejected', 'cancelled', 'failed']);
const INFO_STATUSES = new Set(['open', 'accepted', 'matched']);

export const statusBadgeClass = (status: string): string => {
  if (SUCCESS_STATUSES.has(status)) return 'badge badge-success';
  if (WARNING_STATUSES.has(status)) return 'badge badge-warning';
  if (ERROR_STATUSES.has(status)) return 'badge badge-error';
  if (INFO_STATUSES.has(status)) return 'badge badge-info';
  return 'badge';
};
