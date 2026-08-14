import type { ReactNode } from 'react';

type Variant = 'teal' | 'amber' | 'red' | 'blue' | 'muted';

const VARIANT_MAP: Record<Variant, { color: string; bg: string; border: string }> = {
  teal:  { color: '#34D399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  amber: { color: '#FCD34D', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  red:   { color: '#FCA5A5', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
  blue:  { color: '#93C5FD', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  muted: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.18)' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon?: ReactNode;
  variant?: Variant;
  style?: React.CSSProperties;
}

export default function StatCard({ label, value, caption, icon, variant = 'teal', style }: StatCardProps) {
  const v = VARIANT_MAP[variant];
  return (
    <div style={{
      background: '#111827',
      border: `1px solid ${v.border}`,
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#475569',
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: v.color,
          }}>
            {icon}
          </div>
        )}
      </div>
      <span style={{
        fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em',
        lineHeight: 1, color: v.color,
      }}>
        {value}
      </span>
      {caption && (
        <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
          {caption}
        </span>
      )}
    </div>
  );
}
