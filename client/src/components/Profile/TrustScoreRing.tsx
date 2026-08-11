interface TrustScoreRingProps {
  trustScore: number;
  size?: number;
}

const STROKE = 10;

const TrustScoreRing = ({ trustScore, size = 120 }: TrustScoreRingProps) => {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(trustScore, 0), 5) / 5;
  const offset = circumference * (1 - ratio);
  const fontSize = size * 0.2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="trust-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={STROKE} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="trust-ring-label"
        style={{ fontSize }}
      >
        {trustScore.toFixed(1)}
      </text>
    </svg>
  );
};

export default TrustScoreRing;
