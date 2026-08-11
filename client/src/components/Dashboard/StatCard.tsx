import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <span className="stat-label">{label}</span>
  </div>
);

export default StatCard;
