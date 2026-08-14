import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

export default function SectionCard({ children, style, noPadding }: SectionCardProps) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1E2733',
      borderRadius: 12,
      padding: noPadding ? 0 : '18px 20px',
      overflow: noPadding ? 'hidden' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}
