import { useState } from 'react';
import { InstitutionNav } from './InstitutionNav';
import CommandMap from '../../components/CommandMap';
import { DEMO_MAP_MARKERS } from '../../mock/demoCommandCenterData';

export default function InstitutionHeatmapPage() {
  const [zoomLevel, setZoomLevel] = useState(12);

  const fleetStats = [
    { label: 'Active Patrol Units', value: '24', icon: 'directions_car', color: '#818cf8' },
    { label: 'Guardians on Route', value: '148', icon: 'shield_person', color: '#10b981' },
    { label: 'Safe Havens Active', value: '52', icon: 'storefront', color: '#6366f1' },
    { label: 'High Alert Areas', value: '4', icon: 'warning', color: '#ef4444' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6 relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fleet Status &amp; Live Heatmap</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time GPS telemetry of patrol vehicles, guardians, and transit corridors.</p>
        </div>

        {/* Fleet KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
          {fleetStats.map(s => (
            <div key={s.label} className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                <span className="text-2xl font-black text-white mt-1 block">{s.value}</span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
                style={{ background: `${s.color}20` }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Big Interactive Map Panel */}
        <div className="flex-1 min-h-[460px] bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 relative overflow-hidden shadow-2xl flex flex-col z-10">
          {/* Map Overlay Indicator */}
          <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-lg flex items-center gap-2 bg-[#0d0d1a]/85 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">Live Fleet Coordinates</span>
          </div>

          <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#0a0a12]">
            <CommandMap
              markers={DEMO_MAP_MARKERS}
              center={[28.6139, 77.2090]}
              zoom={zoomLevel}
              showHeatmap={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
