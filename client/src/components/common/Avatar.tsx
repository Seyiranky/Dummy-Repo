const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488', '#e11d48'];

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const colorFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
};

interface AvatarProps {
  name: string;
  size?: number;
}

const Avatar = ({ name, size = 36 }: AvatarProps) => {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.4),
        backgroundColor: colorFor(name || '?'),
      }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
};

export default Avatar;
