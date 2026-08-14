import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface DemoControlsProps {
  onTriggerEvent: (type: string) => void;
  disabled?: boolean;
}

const events = [
  { type: 'incident', label: 'Incident Reported', desc: 'New incident appears ahead on route', icon: '⚠️', color: '#dc2626' },
  { type: 'risk_increase', label: 'Area Risk Increased', desc: 'SafeScore drops — reduced activity', icon: '📉', color: '#ea580c' },
  { type: 'deviation', label: 'Route Deviation', desc: 'Traveler leaves recommended path', icon: '↗️', color: '#d97706' },
  { type: 'low_activity', label: 'Low Activity Area', desc: 'Entering isolated stretch', icon: '🚶', color: '#9333ea' },
];

export default function DemoControls({ onTriggerEvent, disabled }: DemoControlsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="demo-controls">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-sm"
        style={{
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-full)',
          gap: 6,
        }}
      >
        <Zap size={14} />
        Demo
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {open && (
        <div
          className="card animate-slide-in-bottom"
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 8,
            width: 260,
            padding: 12,
            zIndex: 200,
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo Event Triggers
          </p>
          <div className="flex flex-col gap-2">
            {events.map(evt => (
              <button
                key={evt.type}
                onClick={() => { onTriggerEvent(evt.type); setOpen(false); }}
                disabled={disabled}
                className="text-left"
                style={{
                  background: 'transparent',
                  border: `1px solid ${evt.color}22`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${evt.color}10`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem' }}>{evt.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: evt.color }}>{evt.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{evt.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
