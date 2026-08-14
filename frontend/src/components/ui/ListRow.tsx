import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ListRowProps {
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  /** Show default ChevronRight if no trailing provided */
  showArrow?: boolean;
}

export default function ListRow({
  icon, iconBg = '#1A2332', iconColor = '#94A3B8',
  title, subtitle, trailing, onClick, style, showArrow,
}: ListRowProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', width: '100%', textAlign: 'left',
        background: 'none', border: 'none', fontFamily: 'inherit', cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={onClick ? e => { (e.currentTarget as HTMLElement).style.background = '#1A2332'; } : undefined}
      onMouseLeave={onClick ? e => { (e.currentTarget as HTMLElement).style.background = 'none'; } : undefined}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {trailing ?? (showArrow && <ChevronRight size={16} color="#334155" />)}
    </Tag>
  );
}
