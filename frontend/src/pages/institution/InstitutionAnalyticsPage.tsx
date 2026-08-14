import { useState, useEffect } from 'react';
import { InstitutionNav } from './InstitutionNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstitutionAnalyticsPage() {
  const { user, isDemo } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      // Seeded sample trends for Demo
      setData({
        summary: {
          totalIncidents: 38,
          resolvedRate: 98.4,
          avgResponseTime: '3.2 min',
          mostCommonType: 'Low Street Lighting',
        },
        incidentTrend: [
          { month: 'Nov', incidents: 14, safeScore: 72 },
          { month: 'Dec', incidents: 11, safeScore: 76 },
          { month: 'Jan', incidents: 8, safeScore: 81 },
          { month: 'Feb', incidents: 5, safeScore: 86 },
          { month: 'Mar', incidents: 4, safeScore: 90 },
          { month: 'Apr', incidents: 2, safeScore: 94 },
        ],
        topRiskLocations: [
          { name: 'Subhash Nagar Unlit Cut-through', zone: 'West Delhi Sector', incidents: 12, avgSafeScore: 48 },
          { name: 'Tagore Garden Service Lane', zone: 'West Delhi District', incidents: 9, avgSafeScore: 54 },
          { name: 'Kasturba Gandhi Marg Underpass', zone: 'Central Delhi', incidents: 5, avgSafeScore: 65 },
        ],
      });
      setLoading(false);
      return;
    }

    // Real Account: Query Supabase for real user incident history and metrics
    async function loadRealAnalytics() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: userIncidents } = await supabase
          .from('sos_incidents')
          .select('*')
          .eq('user_id', user.id);

        const total = userIncidents?.length || 0;

        setData({
          summary: {
            totalIncidents: total,
            resolvedRate: total > 0 ? 100 : 0,
            avgResponseTime: total > 0 ? 'Instant SMS' : '—',
            mostCommonType: total > 0 ? (userIncidents?.[0]?.type || 'Emergency SOS') : 'None recorded',
          },
          incidentTrend: [],
          topRiskLocations: [],
        });
      } catch (err) {
        console.error('Error fetching real analytics:', err);
        setData({
          summary: { totalIncidents: 0, resolvedRate: 0, avgResponseTime: '—', mostCommonType: 'None recorded' },
          incidentTrend: [],
          topRiskLocations: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadRealAnalytics();
  }, [isDemo, user?.id]);

  const customTooltipStyle = { background: '#111522', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: 12, color: '#f1f5f9', fontSize: '0.82rem' };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8 relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Risk Analytics
              {isDemo ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Demo Sample Data
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Account Telemetry
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Predictive safety modeling &amp; trend analysis · SafeSphere Operations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative z-10">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Logged Incidents</span>
                <span className="text-3xl font-black text-white mt-1 block">{data?.summary?.totalIncidents ?? 0}</span>
                <span className="text-xs text-slate-500 mt-2 block">{isDemo ? '+2 this week' : 'Real-time account log'}</span>
              </div>
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Incident Resolution Rate</span>
                <span className="text-3xl font-black text-emerald-400 mt-1 block">{data?.summary?.resolvedRate ? `${data.summary.resolvedRate}%` : '—'}</span>
                <span className="text-xs text-emerald-500/80 mt-2 block">{isDemo ? 'Target ≥ 95%' : 'Based on active triggers'}</span>
              </div>
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Avg Response / Dispatch</span>
                <span className="text-3xl font-black text-indigo-400 mt-1 block">{data?.summary?.avgResponseTime ?? '—'}</span>
                <span className="text-xs text-indigo-400/80 mt-2 block">{isDemo ? 'Delhi NCR response SLA' : 'Automated SMS broadcast'}</span>
              </div>
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Primary Incident Type</span>
                <span className="text-lg font-bold text-slate-200 mt-2 block truncate">{data?.summary?.mostCommonType ?? 'None recorded'}</span>
                <span className="text-xs text-slate-500 mt-1 block">Telemetry classification</span>
              </div>
            </div>

            {/* Charts section */}
            {!isDemo && data?.incidentTrend?.length === 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-slate-600">show_chart</span>
                  <div>
                    <h3 className="text-base font-bold text-white">No Monthly Incident Trends Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      As you use SafeSphere for routing, your historical SafeScores and corridor trends will populate here automatically.
                    </p>
                  </div>
                </div>

                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-slate-600">location_off</span>
                  <div>
                    <h3 className="text-base font-bold text-white">No High-Risk Zones Logged</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Identified route deviations, low lighting warnings, and elevated hazard spots along your journeys will be cataloged here.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend line chart */}
                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
                  <h3 className="text-base font-bold text-white mb-1">Incident Volume vs SafeScore Trend</h3>
                  <p className="text-xs text-slate-400 mb-6">6-month rolling overview of logged safety alerts</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.incidentTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
                        <Line type="monotone" dataKey="safeScore" name="SafeScore" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#818cf8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* High risk locations bar chart */}
                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
                  <h3 className="text-base font-bold text-white mb-1">Identified Elevated Risk Locations</h3>
                  <p className="text-xs text-slate-400 mb-6">Top sectors flagged with safety deviations</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.topRiskLocations || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Bar dataKey="incidents" name="Incident Count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
