import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CommandMap from '../../components/CommandMap';
import {
  DEMO_METRICS,
  DEMO_SAFESCORE_TRENDS,
  DEMO_INCIDENTS,
  DEMO_MAP_MARKERS,
} from '../../mock/demoCommandCenterData';
import { getUser, apiFetch, clearAuth } from '../../utils';

export function InstitutionNav() {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex flex-col h-full w-[280px] bg-[#1a1c1c]/40 backdrop-blur-3xl border-r border-white/10 shadow-lg py-6 z-50 shrink-0">
      <div className="px-10 mb-6">
        <h1 className="text-[20px] leading-[28px] font-bold text-[#c3c6d6]">SafeSphere</h1>
        <p className="text-[12px] leading-[16px] tracking-wider font-semibold text-[#c7c6cc] mt-1">Institutional Command</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-4">
        {/* Active Tab */}
        <button
          onClick={() => navigate('/institution/overview')}
          className="flex items-center gap-4 bg-[#3131c0] text-[#b0b2ff] rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[12px] tracking-wider font-semibold">Command Center</span>
        </button>

        <button
          onClick={() => navigate('/institution/analytics')}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[12px] tracking-wider font-semibold">Risk Analytics</span>
        </button>

        <button
          onClick={() => navigate('/institution/heatmap')}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="text-[12px] tracking-wider font-semibold">Fleet Status</span>
        </button>

        <button
          onClick={() => navigate('/institution/incidents')}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">verified_user</span>
          <span className="text-[12px] tracking-wider font-semibold">Safety Audits</span>
        </button>

        <button
          onClick={() => navigate('/institution/alerts')}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[12px] tracking-wider font-semibold">Settings</span>
        </button>
      </div>

      <div className="px-4 mt-auto">
        <button
          onClick={() => navigate('/institution/alerts')}
          className="w-full bg-gradient-to-r from-[#3131c0] to-[#16003b] hover:from-[#c0c1ff] hover:to-[#d2bbff] hover:text-[#1000a9] text-[#b0b2ff] text-[12px] tracking-wider font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-sm">warning</span>
          Emergency Response
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => alert('SafeSphere Institutional Command Desk')}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-[12px] tracking-wider font-semibold">Help</span>
        </button>

        <button
          onClick={() => { clearAuth(); navigate('/login'); }}
          className="flex items-center gap-4 text-[#c7c6cc] hover:bg-white/5 rounded-lg px-4 py-3 mx-2 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[12px] tracking-wider font-semibold">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

export default function InstitutionOverviewPage() {
  const navigate = useNavigate();
  const user = getUser();
  const isDemo = !user || user.id?.startsWith('demo') || user.email?.includes('demo') || user.role === 'consumer' || user.role === 'institution';

  const [realData, setRealData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(12);

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
    <div className="flex h-screen overflow-hidden text-[16px] leading-[24px] font-['Inter',sans-serif] bg-[#121414] text-[#e2e2e2]">
      
      {/* ── Side Navigation Bar ── */}
      <InstitutionNav />

      {/* ── Main Content Canvas ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TopAppBar Mobile Fallback */}
        <header className="md:hidden flex justify-between items-center px-4 py-4 bg-[#121414]/10 backdrop-blur-xl border-b border-white/10 shadow-sm z-40 fixed top-0 w-full">
          <h1 className="text-[20px] font-bold text-[#c3c6d6]">SafeSphere</h1>
          <div className="flex gap-4 items-center">
            <button className="text-[#c7c6cc] hover:text-[#c3c6d6] transition-colors duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#282a2b] flex items-center justify-center font-bold text-xs text-[#c3c6d6]">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-20 md:pt-6 pb-20 md:pb-6">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-[#e2e2e2]">
                  Command Center
                </h2>
                {isDemo && (
                  <span className="bg-[#3131c0]/20 text-[#c0c1ff] border border-[#3131c0]/40 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-[#c7c6cc] mt-1 text-sm">Real-time safety intelligence &amp; operational overview.</p>
            </div>

            <div className="hidden md:flex gap-4 items-center">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c6cc]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search operations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#282a2b] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-[#3131c0] focus:ring-1 focus:ring-[#3131c0] outline-none transition-all text-[#e2e2e2] w-64 placeholder-[#c7c6cc]"
                />
              </div>

              <button className="w-10 h-10 rounded-full bg-[#282a2b] flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 cursor-pointer">
                <span className="material-symbols-outlined text-[#e2e2e2]">notifications</span>
              </button>
            </div>
          </div>

          {/* KPI Row (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* KPI 1: Total Journeys */}
            <div
              className="rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#3131c0]/50 transition-colors"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-[#c7c6cc]">Total Journeys</span>
                <span className="material-symbols-outlined text-[#c0c1ff] text-sm opacity-70">route</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-[#e2e2e2]">
                  {metrics.totalJourneys.toLocaleString()}
                </span>
                <div className="flex items-center text-[#c0c1ff] text-sm">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span className="ml-1">{metrics.totalJourneysTrend}</span>
                </div>
              </div>
              {/* Sparkline */}
              <div className="absolute bottom-0 left-0 w-full h-8 opacity-20 bg-gradient-to-t from-[#c0c1ff]/40 to-transparent">
                <svg className="w-full h-full stroke-[#c0c1ff] fill-none stroke-2" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M0,20 Q10,15 20,18 T40,10 T60,12 T80,5 T100,2"></path>
                </svg>
              </div>
            </div>

            {/* KPI 2: SafeScore Gauge */}
            <div
              className="rounded-xl p-4 flex items-center justify-between h-32 hover:border-[#3131c0]/50 transition-colors"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex flex-col justify-between h-full">
                <span className="text-[12px] tracking-wider font-semibold text-[#c7c6cc]">Avg SafeScore</span>
                <div>
                  <span className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-[#e2e2e2]">{metrics.avgSafeScore}</span>
                  <span className="text-[#c7c6cc] text-sm">/100</span>
                </div>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-[#282a2b]" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                  <circle
                    className="stroke-[#c0c1ff]"
                    cx="18" cy="18" fill="none" r="16"
                    strokeDasharray="100" strokeDashoffset="6"
                    strokeLinecap="round" strokeWidth="4"
                  ></circle>
                </svg>
                <span className="absolute material-symbols-outlined text-[#c0c1ff] text-sm">shield</span>
              </div>
            </div>

            {/* KPI 3: Active Alerts */}
            <div
              className="rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden hover:border-[#ffb4ab]/30 transition-colors"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-[#c7c6cc]">Active Alerts</span>
                <div className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-[#ffb4ab]">
                  {metrics.activeAlerts}
                </span>
                <span className="text-[#c7c6cc] text-sm border border-white/10 px-2 py-0.5 rounded-full bg-[#282a2b]">
                  {metrics.activeAlertsPriority}
                </span>
              </div>
            </div>

            {/* KPI 4: High-Risk Zones */}
            <div
              className="rounded-xl p-4 flex flex-col justify-between h-32 hover:border-[#3131c0]/50 transition-colors"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-[#c7c6cc]">High-Risk Zones</span>
                <span className="material-symbols-outlined text-[#c7c6cc] text-sm">warning_amber</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold text-[#e2e2e2]">
                  {metrics.highRiskZones}
                </span>
                <span className="text-[#c7c6cc] text-sm">{metrics.highRiskZonesTrend}</span>
              </div>
            </div>
          </div>

          {/* Bento Grid: Live Heatmap Map & SafeScore Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            
            {/* Main Map Panel (8 Cols) with Interactive Leaflet CartoDB Map */}
            <div
              className="lg:col-span-8 rounded-xl p-1 flex flex-col min-h-[420px] relative overflow-hidden group"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              {/* Heatmap overlay badge */}
              <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg flex items-center gap-2 bg-[#1a1c1c]/70 backdrop-blur-xl border border-white/10 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-[#c0c1ff] animate-pulse"></div>
                <span className="text-[12px] tracking-wider font-semibold text-[#e2e2e2]">Live Heatmap</span>
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
                  className="w-8 h-8 rounded bg-[#333535] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(8, z - 1))}
                  className="w-8 h-8 rounded bg-[#333535] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
              </div>

              {/* Leaflet Map */}
              <div className="w-full h-full rounded-lg overflow-hidden relative bg-[#121414]">
                <CommandMap
                  markers={mapMarkers}
                  center={[41.8781, -87.6298]}
                  zoom={zoomLevel}
                  showHeatmap={true}
                />
              </div>
            </div>

            {/* SafeScore Trends Bar Chart Panel (4 Cols) */}
            <div
              className="lg:col-span-4 rounded-xl p-4 flex flex-col"
              style={{
                backgroundColor: 'rgba(26, 28, 28, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#e2e2e2] mb-1">SafeScore Trends</h3>
              <p className="text-sm text-[#c7c6cc] mb-4">7-Day regional aggregate</p>
              
              <div
                className="flex-1 rounded-lg relative flex items-end p-2 border border-white/5"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              >
                <div className="w-full h-[80%] relative flex items-end justify-between px-2">
                  {trends.map((t: any, idx: number) => {
                    const isLast = idx === trends.length - 1;
                    return (
                      <div
                        key={idx}
                        className="w-[12%] rounded-t-sm relative group cursor-pointer transition-all duration-300"
                        style={{
                          height: `${(t.score / 100) * 100}%`,
                          background: isLast
                            ? 'linear-gradient(to top, rgba(192, 193, 255, 0.6), rgba(192, 193, 255, 0.2))'
                            : 'linear-gradient(to top, rgba(192, 193, 255, 0.4), rgba(192, 193, 255, 0.1))',
                          borderTop: isLast ? '2px solid #c0c1ff' : 'none',
                        }}
                      >
                        <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1 rounded font-bold transition-opacity ${isLast ? 'bg-[#3131c0] text-[#b0b2ff] opacity-100' : 'bg-[#282a2b] text-[#e2e2e2] opacity-0 group-hover:opacity-100'}`}>
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
          <div
            className="rounded-xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'rgba(26, 28, 28, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1c1c]/50">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#e2e2e2]">Recent Incidents</h3>
              <button
                onClick={() => navigate('/institution/incidents')}
                className="text-sm text-[#c0c1ff] hover:text-[#d2bbff] transition-colors font-medium cursor-pointer border-none bg-transparent"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#c7c6cc] text-[12px] tracking-wider font-semibold border-b border-white/5">
                    <th className="p-4">ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Type</th>
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
                      <td className="p-4 text-[#c7c6cc] font-medium">{inc.id}</td>
                      <td className="p-4 font-semibold text-[#e2e2e2]">{inc.location}</td>
                      <td className="p-4 text-[#c7c6cc]">{inc.type}</td>
                      <td className="p-4">
                        {inc.severity === 'HIGH' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/20 text-[11px] font-semibold tracking-wide">
                            HIGH
                          </span>
                        )}
                        {inc.severity === 'MEDIUM' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 text-[11px] font-semibold tracking-wide">
                            MEDIUM
                          </span>
                        )}
                        {inc.severity === 'LOW' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#333535] text-[#e2e2e2] border border-white/10 text-[11px] font-semibold tracking-wide">
                            LOW
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-[#c7c6cc]">{inc.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* BottomNavBar Mobile Fallback */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-[#121414]/20 backdrop-blur-2xl border-t border-white/10 rounded-t-xl shadow-[0px_-10px_30px_rgba(0,0,0,0.15)]">
        <Link to="/home" className="flex flex-col items-center justify-center text-[#c7c6cc] p-2 hover:bg-white/10 transition-all text-decoration-none">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[12px] tracking-wider mt-1">Explore</span>
        </Link>
        <Link to="/institution/overview" className="flex flex-col items-center justify-center bg-[#3131c0]/30 text-[#b0b2ff] rounded-xl p-2 scale-95 duration-200 ease-in-out text-decoration-none">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          <span className="text-[12px] tracking-wider mt-1">Command</span>
        </Link>
        <Link to="/routes" className="flex flex-col items-center justify-center text-[#c7c6cc] p-2 hover:bg-white/10 transition-all text-decoration-none">
          <span className="material-symbols-outlined">directions</span>
          <span className="text-[12px] tracking-wider mt-1">SafeRoutes</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-[#c7c6cc] p-2 hover:bg-white/10 transition-all text-decoration-none">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[12px] tracking-wider mt-1">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
