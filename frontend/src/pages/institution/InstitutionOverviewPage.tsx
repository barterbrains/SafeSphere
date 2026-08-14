import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommandMap from '../../components/CommandMap';
import {
  DEMO_METRICS,
  DEMO_SAFESCORE_TRENDS,
  DEMO_INCIDENTS,
  DEMO_MAP_MARKERS,
} from '../../mock/demoCommandCenterData';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { InstitutionNav } from './InstitutionNav';

export default function InstitutionOverviewPage() {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel] = useState(12);

  // Warning banner for users who skipped adding contacts
  const [showContactWarning, setShowContactWarning] = useState(false);

  // Real account metrics state
  const [realMetrics, setRealMetrics] = useState({
    totalJourneys: 0,
    avgSafeScore: 0,
    activeAlerts: 0,
    openIncidents: 0,
  });

  const [realIncidents, setRealIncidents] = useState<any[]>([]);

  useEffect(() => {
    if (!isDemo && user?.id) {
      const currentUserId = user.id;

      // 1. Check if user has zero contacts
      const dismissed = localStorage.getItem('safesphere_dismiss_contact_warning') === 'true';
      if (!dismissed) {
        supabase
          .from('trusted_contacts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .then(({ count }) => {
            if (count === 0) {
              setShowContactWarning(true);
            }
          });
      }

      // 2. Fetch real user journey and alert statistics
      async function loadRealStats() {
        try {
          const { data: journeys } = await supabase
            .from('journeys')
            .select('current_safe_score')
            .eq('user_id', currentUserId);

          const { data: alerts } = await supabase
            .from('sos_incidents')
            .select('*')
            .eq('user_id', currentUserId);

          const jCount = journeys?.length || 0;
          const avgScore = jCount > 0
            ? Math.round(journeys!.reduce((acc, curr) => acc + (Number(curr.current_safe_score) || 0), 0) / jCount)
            : 0;

          const activeAlertsCount = alerts?.filter(a => a.status === 'active').length || 0;

          setRealMetrics({
            totalJourneys: jCount,
            avgSafeScore: avgScore,
            activeAlerts: activeAlertsCount,
            openIncidents: alerts?.length || 0,
          });

          if (alerts) {
            setRealIncidents(alerts.map(a => ({
              id: `#INC-${a.id.slice(0, 4).toUpperCase()}`,
              location: a.location_name || 'Delhi NCR Region',
              type: a.type || 'Emergency SOS',
              severity: a.status === 'active' ? 'HIGH' : 'LOW',
              time: new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            })));
          }
        } catch (e) {
          console.error('Error loading overview stats:', e);
        }
      }

      loadRealStats();
    }
  }, [isDemo, user?.id]);

  const metrics = isDemo ? DEMO_METRICS : {
    totalJourneys: realMetrics.totalJourneys,
    totalJourneysTrend: realMetrics.totalJourneys > 0 ? '+1 today' : 'No journeys',
    avgSafeScore: realMetrics.avgSafeScore > 0 ? realMetrics.avgSafeScore : 0,
    activeAlerts: realMetrics.activeAlerts,
    activeAlertsPriority: realMetrics.activeAlerts > 0 ? 'High' : 'Normal',
    highRiskZones: realMetrics.openIncidents,
    highRiskZonesTrend: '0 today',
  };

  const trends = isDemo ? DEMO_SAFESCORE_TRENDS : [
    { day: 'Mon', score: realMetrics.avgSafeScore || 0 },
    { day: 'Tue', score: realMetrics.avgSafeScore || 0 },
    { day: 'Wed', score: realMetrics.avgSafeScore || 0 },
    { day: 'Thu', score: realMetrics.avgSafeScore || 0 },
    { day: 'Fri', score: realMetrics.avgSafeScore || 0 },
    { day: 'Sat', score: realMetrics.avgSafeScore || 0 },
    { day: 'Sun', score: realMetrics.avgSafeScore || 0 },
  ];

  const incidents = isDemo ? DEMO_INCIDENTS : realIncidents;
  const mapMarkers = isDemo ? DEMO_MAP_MARKERS : DEMO_MAP_MARKERS; // Safe POIs remain accessible on Delhi map

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      
      {/* Side Navigation Bar */}
      <InstitutionNav />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TopAppBar Mobile Fallback */}
        <header className="md:hidden flex justify-between items-center px-4 py-4 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/10 shadow-sm z-40 fixed top-0 w-full">
          <div
            onClick={() => navigate('/institution/overview')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#3730a3] flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.5)]">
              <span className="material-symbols-outlined text-white text-sm">shield</span>
            </div>
            <h1 className="text-[17px] font-bold text-white tracking-tight">SafeSphere</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-slate-400 hover:text-white transition-colors duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              onClick={() => navigate('/institution/profile')}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white cursor-pointer hover:bg-indigo-500 transition-colors"
            >
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
                {isDemo ? (
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Demo Mode
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Live Session
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
                  {metrics.totalJourneys}
                </span>
                <span className="text-emerald-400 text-[11px] font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                  {metrics.totalJourneysTrend}
                </span>
              </div>
            </div>

            {/* KPI 2: SafeScore Average */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">SafeScore Index</span>
                <span className="material-symbols-outlined text-indigo-400 text-sm opacity-80">health_and_safety</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-indigo-400">
                  {metrics.avgSafeScore > 0 ? metrics.avgSafeScore : '—'}
                </span>
                <span className="text-slate-400 text-[11px] font-bold mb-1">
                  {metrics.avgSafeScore > 0 ? '/100 rating' : 'Awaiting trips'}
                </span>
              </div>
            </div>

            {/* KPI 3: Active Alerts */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">Active SOS Alerts</span>
                <span className="material-symbols-outlined text-red-400 text-sm opacity-80">notifications_active</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-white">
                  {metrics.activeAlerts}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${metrics.activeAlerts > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {metrics.activeAlertsPriority}
                </span>
              </div>
            </div>

            {/* KPI 4: High-Risk Zones */}
            <div className="rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[12px] tracking-wider font-semibold text-slate-400 uppercase">Logged Hazards</span>
                <span className="material-symbols-outlined text-amber-400 text-sm opacity-80">warning</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[30px] font-extrabold text-white">
                  {metrics.highRiskZones}
                </span>
                <span className="text-slate-400 text-[11px] font-bold mb-1">
                  {metrics.highRiskZonesTrend}
                </span>
              </div>
            </div>

          </div>

          {/* Bento Grid: Interactive Map + SafeScore Charts + Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Map Canvas (8 Columns) */}
            <div className="lg:col-span-8 rounded-2xl overflow-hidden relative shadow-2xl min-h-[460px] h-[520px] flex flex-col bg-[#111522]/80 backdrop-blur-2xl border border-white/10">
              
              {/* Map Floating Header */}
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 bg-[#0a0a12]/90 backdrop-blur-xl border border-white/10 pointer-events-auto shadow-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">Delhi NCR Safety Grid</span>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-[#0a0a12]">
                <CommandMap
                  markers={mapMarkers}
                  center={[28.6139, 77.2090]}
                  zoom={zoomLevel}
                  showHeatmap={true}
                />
              </div>
            </div>

            {/* Right Feed Panel (4 Columns): SafeScore Trend + Live Incident Logs */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Card 1: SafeScore Trend Bar Chart */}
              <div className="rounded-2xl p-5 bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {isDemo ? 'Regional SafeScore Index' : 'Your Journey SafeScores'}
                  </h3>
                  <span className="text-xs text-indigo-400 font-bold">
                    {isDemo ? '7-Day Trend' : 'Recent Walks'}
                  </span>
                </div>
                
                <div className="h-32 flex items-end justify-between gap-2 px-2 pt-4">
                  {trends.map((item, index) => {
                    const heightPercent = isDemo ? (item.score / 100) * 100 : (item.score > 0 ? (item.score / 100) * 100 : 8);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div
                          className="w-full rounded-t-md transition-all duration-300 relative"
                          style={{
                            height: `${heightPercent}%`,
                            background: item.score >= 85 ? '#818cf8' : item.score >= 70 ? '#6366f1' : item.score > 0 ? '#4f46e5' : '#1e2238',
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.score > 0 ? `${item.score}` : 'No data'}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Recent Incident Audit Stream */}
              <div className="rounded-2xl p-5 flex-1 bg-[#111522]/80 backdrop-blur-2xl border border-white/10 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {isDemo ? 'Simulated Live Feed' : 'Your Event Audit Stream'}
                  </h3>
                  <span className="material-symbols-outlined text-xs text-slate-500 animate-spin">sync</span>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[220px]">
                  {incidents.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-2xl text-slate-600">check_circle</span>
                      <p className="text-xs text-slate-500">No active incidents or alerts logged.</p>
                    </div>
                  ) : (
                    incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3 hover:border-indigo-500/30 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${inc.severity === 'HIGH' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-amber-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white truncate">{inc.type}</span>
                            <span className="text-[10px] text-slate-500">{inc.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{inc.location}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
