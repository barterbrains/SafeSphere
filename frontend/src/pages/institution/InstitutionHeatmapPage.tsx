import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils';
import { InstitutionNav } from './InstitutionOverviewPage';

const INCIDENTS_MOCK = [
  { lat: 28.689, lng: 77.154, severity: 'high', label: 'Hostel Road' },
  { lat: 28.692, lng: 77.155, severity: 'medium', label: 'Pitampura Area' },
  { lat: 28.686, lng: 77.151, severity: 'critical', label: 'Night Market' },
  { lat: 28.684, lng: 77.150, severity: 'medium', label: 'Main Road' },
  { lat: 28.691, lng: 77.161, severity: 'high', label: 'Eve Teasing Spot' },
  { lat: 28.695, lng: 77.145, severity: 'low', label: 'Bus Stop' },
  { lat: 28.683, lng: 77.159, severity: 'medium', label: 'Library Road' },
  { lat: 28.688, lng: 77.152, severity: 'low', label: 'Auto Stand' },
  { lat: 28.690, lng: 77.149, severity: 'medium', label: 'Adjacent Park' },
  { lat: 28.692, lng: 77.155, severity: 'high', label: 'Bag Snatching Zone' },
];

export default function InstitutionHeatmapPage() {
  const W = 640, H = 400;
  const minLat = 28.680, maxLat = 28.698, minLng = 77.140, maxLng = 77.168;

  const toSvg = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H,
  });

  const severityColors: Record<string, string> = {
    critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a'
  };
  const severityRadius: Record<string, number> = {
    critical: 35, high: 28, medium: 22, low: 16
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <InstitutionNav />
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>Safety Heatmap</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>Incident density · GTBIT Campus & Surroundings</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {['critical','high','medium','low'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: severityColors[s], opacity: 0.7 }} />
                <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(160deg, #1a2744 0%, #0d1b2a 100%)' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
              {/* Grid */}
              <g opacity="0.15" stroke="#4f6a8a" strokeWidth="0.5">
                {[80,160,240,320,400,480,560].map(x => <line key={x} x1={x} y1={0} x2={x} y2={H} />)}
                {[80,160,240,320].map(y => <line key={y} x1={0} y1={y} x2={W} y2={y} />)}
              </g>

              {/* Roads (approximate) */}
              <line x1={0} y1={200} x2={W} y2={200} stroke="#2d4a6a" strokeWidth={6} opacity={0.6} />
              <line x1={320} y1={0} x2={320} y2={H} stroke="#2d4a6a" strokeWidth={4} opacity={0.5} />
              <line x1={0} y1={120} x2={W} y2={140} stroke="#2d4a6a" strokeWidth={3} opacity={0.4} />

              {/* Campus boundary */}
              <rect x={260} y={80} width={160} height={200} rx={8} fill="none" stroke="#4f46e5" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.7} />
              <text x={340} y={70} textAnchor="middle" fill="#4f46e5" fontSize={11} opacity={0.8}>GTBIT Campus</text>

              {/* Heat circles */}
              {INCIDENTS_MOCK.map((inc, i) => {
                const p = toSvg(inc.lat, inc.lng);
                const color = severityColors[inc.severity];
                const r = severityRadius[inc.severity];
                return (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={r * 1.8} fill={color} opacity={0.12} />
                    <circle cx={p.x} cy={p.y} r={r} fill={color} opacity={0.35} />
                    <circle cx={p.x} cy={p.y} r={r * 0.4} fill={color} opacity={0.9} />
                  </g>
                );
              })}

              {/* Labels for major spots */}
              {INCIDENTS_MOCK.filter(i => i.severity === 'high' || i.severity === 'critical').map((inc, i) => {
                const p = toSvg(inc.lat, inc.lng);
                return (
                  <text key={i} x={p.x} y={p.y - severityRadius[inc.severity] - 5} textAnchor="middle" fill="#e2e8f0" fontSize={9} opacity={0.8}>{inc.label}</text>
                );
              })}
            </svg>
          </div>

          <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 16, textAlign: 'center' }}>Incident density map · Anonymized & aggregated · SafeSphere Analytics</p>
        </div>

        {/* Risk zones table */}
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155', marginTop: 24 }}>
          <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 16 }}>High-Risk Zones Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { zone: 'Hostel Road', risk: 'High', score: 38, incidents: 3 },
              { zone: 'Night Market Area', risk: 'Critical', score: 30, incidents: 2 },
              { zone: 'Eve Teasing Zone (E)', risk: 'High', score: 42, incidents: 2 },
            ].map(z => (
              <div key={z.zone} style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>{z.zone}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: z.risk === 'Critical' ? '#dc2626' : '#ea580c', fontSize: '0.75rem', fontWeight: 700 }}>{z.risk} Risk</span>
                  <span style={{ color: z.risk === 'Critical' ? '#dc2626' : '#ea580c', fontSize: '1.1rem', fontWeight: 800 }}>{z.score}</span>
                </div>
                <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: 6 }}>{z.incidents} logged</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
