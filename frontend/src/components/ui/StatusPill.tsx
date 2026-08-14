type PillVariant = 'safe' | 'moderate' | 'elevated' | 'danger' | 'info' | 'active' | 'muted';

const PILL_STYLES: Record<PillVariant, { color: string; bg: string }> = {
  safe:     { color: '#34D399', bg: 'rgba(16,185,129,0.15)' },
  active:   { color: '#34D399', bg: 'rgba(16,185,129,0.15)' },
  moderate: { color: '#FCD34D', bg: 'rgba(245,158,11,0.15)' },
  elevated: { color: '#FB923C', bg: 'rgba(249,115,22,0.15)' },
  danger:   { color: '#FCA5A5', bg: 'rgba(239,68,68,0.15)'  },
  info:     { color: '#93C5FD', bg: 'rgba(59,130,246,0.15)' },
  muted:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
};

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
  dot?: boolean;
  style?: React.CSSProperties;
}

export default function StatusPill({ label, variant = 'muted', dot, style }: StatusPillProps) {
  const s = PILL_STYLES[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em',
      background: s.bg, color: s.color,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: s.color, flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}
