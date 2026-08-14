import { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  origin?: { lat: number; lng: number; address: string };
  destination?: { lat: number; lng: number; address: string };
  safeZones?: Array<{ id: string; name: string; type: string; location: { lat: number; lng: number } }>;
  routeType?: 'fastest' | 'safest' | 'balanced';
  currentPosition?: { lat: number; lng: number };
  height?: string;
  showAlternate?: boolean;
}

// Simulated SVG map (no API key required)
export default function MapView({
  origin,
  destination,
  safeZones = [],
  routeType = 'balanced',
  currentPosition,
  height = '300px',
  showAlternate = false,
}: MapViewProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const routeColors = {
    fastest: '#f59e0b',
    safest: '#16a34a',
    balanced: '#4f46e5',
  };

  const routeColor = routeColors[routeType];

  // Normalized grid — we draw on a 400×300 SVG
  const W = 400, H = 280;

  // Map lat/lng to SVG coords (Delhi/NCR bounding box approx)
  const minLat = 28.45, maxLat = 28.72, minLng = 77.05, maxLng = 77.38;
  const toSvg = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H,
  });

  const oPos = origin ? toSvg(origin.lat, origin.lng) : { x: 50, y: 200 };
  const dPos = destination ? toSvg(destination.lat, destination.lng) : { x: 350, y: 80 };
  const cPos = currentPosition ? toSvg(currentPosition.lat, currentPosition.lng) : oPos;

  // Generate a curved path between origin and destination
  const midX = (oPos.x + dPos.x) / 2;
  const midY = (oPos.y + dPos.y) / 2;

  // Alternate route (slightly different curve)
  const altCtrlX = midX + 40;
  const altCtrlY = midY - 30;

  // Main route control points
  const ctrlX = midX - 30;
  const ctrlY = midY + 30;

  const routePath = `M ${oPos.x} ${oPos.y} Q ${ctrlX} ${ctrlY} ${dPos.x} ${dPos.y}`;
  const altPath = `M ${oPos.x} ${oPos.y} Q ${altCtrlX} ${altCtrlY} ${dPos.x} ${dPos.y}`;

  const pathLength = 400;

  const zoneIcons: Record<string, string> = {
    police: '🚔',
    hospital: '🏥',
    metro: '🚇',
    mall: '🏬',
    campus: '🎓',
    public: '🏛️',
  };

  return (
    <div
      style={{
        height,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #e8edf5 0%, #d8e4f0 100%)',
        position: 'relative',
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        {/* Street grid background */}
        <g opacity="0.3" stroke="#b8c4d0" strokeWidth="0.5">
          {[60, 120, 180, 240, 300].map(x => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} />
          ))}
          {[56, 112, 168, 224].map(y => (
            <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
        </g>

        {/* Parks / areas */}
        <rect x={80} y={40} width={60} height={40} rx={4} fill="#c8e6c9" opacity={0.5} />
        <rect x={260} y={160} width={50} height={35} rx={4} fill="#c8e6c9" opacity={0.5} />

        {/* Alternate route (ghost) */}
        {showAlternate && (
          <path
            d={altPath}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={3}
            strokeDasharray="8 4"
            opacity={0.6}
          />
        )}

        {/* Main route path */}
        <path
          d={routePath}
          fill="none"
          stroke={routeColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={animated ? 0 : pathLength}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />

        {/* Safe zones */}
        {safeZones.slice(0, 6).map(zone => {
          const p = toSvg(zone.location.lat, zone.location.lng);
          return (
            <g key={zone.id}>
              <circle cx={p.x} cy={p.y} r={8} fill="rgba(79,70,229,0.15)" stroke="#4f46e5" strokeWidth={1.5} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={9} style={{ userSelect: 'none' }}>
                {zoneIcons[zone.type] || '📍'}
              </text>
            </g>
          );
        })}

        {/* Origin marker */}
        <g>
          <circle cx={oPos.x} cy={oPos.y} r={10} fill="white" stroke="#4f46e5" strokeWidth={2} />
          <circle cx={oPos.x} cy={oPos.y} r={5} fill="#4f46e5" />
        </g>

        {/* Destination marker */}
        <g>
          <path
            d={`M ${dPos.x} ${dPos.y - 18} C ${dPos.x - 10} ${dPos.y - 18} ${dPos.x - 10} ${dPos.y} ${dPos.x} ${dPos.y + 2} C ${dPos.x + 10} ${dPos.y} ${dPos.x + 10} ${dPos.y - 18} ${dPos.x} ${dPos.y - 18} Z`}
            fill={routeColor}
            opacity={0.9}
          />
          <circle cx={dPos.x} cy={dPos.y - 12} r={4} fill="white" />
        </g>

        {/* Current position (animated) */}
        {currentPosition && (
          <g>
            <circle cx={cPos.x} cy={cPos.y} r={14} fill={routeColor} opacity={0.2}>
              <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={cPos.x} cy={cPos.y} r={6} fill={routeColor} stroke="white" strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* Map attribution */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          right: 8,
          fontSize: '0.62rem',
          color: '#9ca3af',
        }}
      >
        SafeSphere Maps™ — Simulated Demo
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: '0.7rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 3, background: routeColor, borderRadius: 2 }} />
          <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
            {routeType} route
          </span>
        </div>
        {showAlternate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 3, background: '#d1d5db', borderRadius: 2, borderStyle: 'dashed' }} />
            <span style={{ color: 'var(--text-muted)' }}>Alternate</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.65rem' }}>🔵</span>
          <span style={{ color: 'var(--text-muted)' }}>Safe Zones</span>
        </div>
      </div>
    </div>
  );
}
