import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommandMap from '../../components/CommandMap';
import {
  DEMO_METRICS,
  DEMO_SAFESCORE_TRENDS,
  DEMO_INCIDENTS,
  DEMO_MAP_MARKERS,
} from '../../mock/demoCommandCenterData';
import { apiFetch } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { InstitutionNav } from './InstitutionNav';

export default function InstitutionOverviewPage() {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();

  const [realData, setRealData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(12);

  // Warning banner for users who skipped adding contacts
  const [showContactWarning, setShowContactWarning] = useState(false);

  useEffect(() => {
    if (!isDemo && user?.id) {
      // Check if user has zero contacts and has not permanently dismissed this session
      const dismissed = localStorage.getItem('safesphere_dismiss_contact_warning') === 'true';
      if (!dismissed) {
        supabase
          .from('trusted_contacts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .then(({ count }) => {
            if (count === 0) {
              setShowContactWarning(true);
            }
          });
      }
    }
  }, [isDemo, user?.id]);

  useEffect(() => {
    if (!isDemo) {
      apiFetch('/institution/dashboard')
        .then(setRealData)
        .catch(console.error);
    }
  }, [isDemo]);

  const metrics = isDemo ? DEMO_METRICS : {
    totalJourneys: realData?.overview?.totalJourneys || 0,
    totalJourneysTrend: '+0.0%',
    avgSafeScore: realData?.overview?.avgSafeScore || 0,
    activeAlerts: realData?.overview?.activeAlerts || 0,
    activeAlertsPriority: 'Normal',
    highRiskZones: realData?.overview?.openIncidents || 0,
    highRiskZonesTrend: '0 today',
  };

  const trends = isDemo ? DEMO_SAFESCORE_TRENDS : (realData?.trends || DEMO_SAFESCORE_TRENDS);
  const incidents = isDemo ? DEMO_INCIDENTS : (realData?.recentIncidents || []);
  const mapMarkers = isDemo ? DEMO_MAP_MARKERS : (realData?.mapMarkers || []);

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      
      {/* ── Side Navigation Bar ── */}
      <InstitutionNav />

      {/* ── Main Content Canvas ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TopAppBar Mobile Fallback */}
        <header className="md:hidden flex justify-between items-center px-4 py-4 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/10 shadow-sm z-40 fixed top-0 w-full">
          <h1 className="text-[18px] font-bold text-white">SafeSphere Command</h1>
          <div className="flex gap-4 items-center">
            <button className="text-slate-400 hover:text-white transition-colors duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              C
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-6 pb-20 md:pb-6">
          
          {/* Top Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[28px] md:text-[32px] leading-tight font-extrabold text-white tracking-tight">
                  Command Center
                </h2>
                {isDemo && (
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-1 text-sm">Real-time safety intelligence &amp; operational dispatch.</p>
            </div>

            <div className="hidden md:flex gap-4 items-center">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search operations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111522] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white w-64 placeholder-slate-500"
                />
              </div>

              <button className="w-10 h-10 rounded-full bg-[#111522] flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 cursor-pointer">
                <span className="material-symbols-outlined text-white text-lg">notifications</span>
              </button>
            </div>
          </div>

          {/* Persistent Contact Warning Banner */}
          {showContactWarning && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                  <span className="material-symbols-outlined text-lg">warning</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">No Trusted Guardians Configured</h4>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Your emergency SOS broadcasts cannot reach personal contacts until you add at least one guardian.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate('/institution/profile')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-lg transition-all cursor-pointer border-none shadow"
                >
                  Add Guardian
                </button>
                <button
                  onClick={() => {
                    setShowContactWarning(false);
                    localStorage.setItem('safesphere_dismiss_contact_warning', 'true');
                  }}
                  className="p-1.5 text-amber-300/70 hover:text-amber-200 bg-transparent border-none cursor-pointer"
                  title="Dismiss warning"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          )}

          {/* KPI Row (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* KPI 1: Total Journeys */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">Total Journeys</span>
                <span className="material-symbols-outlined text-indigo-400 text-sm opacity-80">route</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-white">
                  {metrics.totalJourneys.toLocaleString()}
                </span>
                <div className="flex items-center text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-1">{metrics.totalJourneysTrend}</span>
                </div>
              </div>
              {/* Sparkline */}
              <div className="absolute bottom-0 left-0 w-full h-8 opacity-20 bg-gradient-to-t from-indigo-500/40 to-transparent">
                <svg className="w-full h-full stroke-indigo-400 fill-none stroke-2" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M0,20 Q10,15 20,18 T40,10 T60,12 T80,5 T100,2"></path>
                </svg>
              </div>
            </div>

            {/* KPI 2: SafeScore Gauge */}
            <div className="rounded-2xl p-5 flex items-center justify-between h-32 bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg hover:border-indigo-500/50 transition-colors">
              <div className="flex flex-col justify-between h-full">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">Avg SafeScore</span>
                <div>
                  <span className="text-[30px] font-extrabold text-white">{metrics.avgSafeScore}</span>
                  <span className="text-slate-400 text-sm">/100</span>
                </div>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                  <circle
                    className="stroke-indigo-500"
                    cx="18" cy="18" fill="none" r="16"
                    strokeDasharray="100" strokeDashoffset="6"
                    strokeLinecap="round" strokeWidth="4"
                  ></circle>
                </svg>
                <span className="absolute material-symbols-outlined text-indigo-400 text-sm">shield</span>
              </div>
            </div>

            {/* KPI 3: Active Alerts */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg hover:border-red-500/30 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">Active Alerts</span>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-red-400">
                  {metrics.activeAlerts}
                </span>
                <span className="text-slate-300 text-xs font-semibold border border-white/10 px-2.5 py-0.5 rounded-full bg-black/40">
                  {metrics.activeAlertsPriority}
                </span>
              </div>
            </div>

            {/* KPI 4: High-Risk Zones */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">High-Risk Zones</span>
                <span className="material-symbols-outlined text-amber-400 text-sm">warning_amber</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-white">
                  {metrics.highRiskZones}
                </span>
                <span className="text-slate-400 text-xs">{metrics.highRiskZonesTrend}</span>
              </div>
            </div>
          </div>

          {/* Bento Grid: Live Heatmap Map & SafeScore Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            
            {/* Main Map Panel (8 Cols) with Interactive Leaflet CartoDB Map */}
            <div className="lg:col-span-8 rounded-2xl p-1.5 flex flex-col min-h-[420px] relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-xl">
              {/* Heatmap overlay badge */}
              <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-xl flex items-center gap-2 bg-[#0a0a12]/80 backdrop-blur-xl border border-white/10 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                <span className="text-xs font-bold text-white tracking-wider uppercase">Live Heatmap</span>
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
                  className="w-8 h-8 rounded-lg bg-[#1a1c2e] border border-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors text-white cursor-pointer shadow"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(8, z - 1))}
                  className="w-8 h-8 rounded-lg bg-[#1a1c2e] border border-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors text-white cursor-pointer shadow"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
              </div>

              {/* Leaflet Map */}
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#0a0a12]">
                <CommandMap
                  markers={mapMarkers}
                  center={[28.6139, 77.2090]}
                  zoom={zoomLevel}
                  showHeatmap={true}
                />
              </div>
            </div>

            {/* SafeScore Trends Bar Chart Panel (4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl p-6 flex flex-col bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-xl">
              <h3 className="text-[18px] font-bold text-white mb-0.5">SafeScore Trends</h3>
              <p className="text-xs text-slate-400 mb-6">7-Day regional safety aggregate</p>
              
              <div
                className="flex-1 rounded-xl relative flex items-end p-3 border border-white/5 bg-black/20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              >
                <div className="w-full h-[85%] relative flex items-end justify-between px-2">
                  {trends.map((t: any, idx: number) => {
                    const isLast = idx === trends.length - 1;
                    return (
                      <div
                        key={idx}
                        className="w-[11%] rounded-t-md relative group cursor-pointer transition-all duration-300"
                        style={{
                          height: `${(t.score / 100) * 100}%`,
                          background: isLast
                            ? 'linear-gradient(to top, #4f46e5, #818cf8)'
                            : 'linear-gradient(to top, rgba(79, 70, 229, 0.4), rgba(79, 70, 229, 0.15))',
                          borderTop: isLast ? '2px solid #818cf8' : 'none',
                        }}
                      >
                        <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold transition-opacity ${isLast ? 'bg-indigo-600 text-white opacity-100 shadow' : 'bg-slate-800 text-slate-200 opacity-0 group-hover:opacity-100'}`}>
                          {t.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Incidents Table (12 Cols) */}
          <div className="rounded-2xl overflow-hidden flex flex-col bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-[18px] font-bold text-white">Recent Logged Incidents</h3>
              <button
                onClick={() => navigate('/institution/incidents')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold cursor-pointer border-none bg-transparent"
              >
                View Audit Trail ↗
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5 bg-black/10">
                    <th className="p-4">ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {incidents.map((inc: any) => (
                    <tr
                      key={inc.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-mono text-indigo-400 font-semibold">{inc.id}</td>
                      <td className="p-4 font-semibold text-white">{inc.location}</td>
                      <td className="p-4 text-slate-300">{inc.type}</td>
                      <td className="p-4">
                        {inc.severity === 'HIGH' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                            HIGH
                          </span>
                        )}
                        {inc.severity === 'MEDIUM' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                            MEDIUM
                          </span>
                        )}
                        {inc.severity === 'LOW' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-700/30 text-slate-300 border border-white/10 text-xs font-bold">
                            LOW
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-slate-400 text-xs">{inc.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
