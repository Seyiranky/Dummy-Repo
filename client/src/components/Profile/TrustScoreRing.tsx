const SIZE = 120;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TrustScoreRing = ({ trustScore }: { trustScore: number }) => {
  const ratio = Math.min(Math.max(trustScore, 0), 5) / 5;
  const offset = CIRCUMFERENCE * (1 - ratio);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="trust-ring">
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="trust-ring-label">
        {trustScore.toFixed(1)}
      </text>
    </svg>
  );
};

export default TrustScoreRing;
