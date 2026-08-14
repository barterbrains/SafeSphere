import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils';
import { InstitutionNav } from './InstitutionNav';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstitutionAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/institution/analytics')
      .then(setData)
      .catch(() => {
        // Fallback demo data if backend offline
        setData({
          summary: {
            totalIncidents: 42,
            resolvedRate: 98,
            avgResponseTime: '3.4 min',
            mostCommonType: 'Low Lighting',
          },
          incidentTrend: [
            { month: 'Nov', incidents: 14, safeScore: 68 },
            { month: 'Dec', incidents: 10, safeScore: 72 },
            { month: 'Jan', incidents: 8, safeScore: 78 },
            { month: 'Feb', incidents: 5, safeScore: 84 },
            { month: 'Mar', incidents: 3, safeScore: 89 },
            { month: 'Apr', incidents: 2, safeScore: 94 },
          ],
          topRiskLocations: [
            { name: 'Sector 7G Transit Point', zone: 'West District', incidents: 12, avgSafeScore: 48 },
            { name: 'North Corridor Underpass', zone: 'North Sector', incidents: 9, avgSafeScore: 52 },
            { name: 'Commercial Square Alley', zone: 'Central Zone', incidents: 6, avgSafeScore: 64 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const customTooltipStyle = { background: '#111522', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: 12, color: '#f1f5f9', fontSize: '0.82rem' };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Risk Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Predictive safety modeling &amp; trend analysis · SafeSphere Operations</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative z-10">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Incidents', value: data?.summary?.totalIncidents, color: '#ef4444' },
                { label: 'Resolution Rate', value: data?.summary?.resolvedRate + '%', color: '#10b981' },
                { label: 'Avg Response Time', value: data?.summary?.avgResponseTime, color: '#818cf8' },
                { label: 'Most Common Factor', value: data?.summary?.mostCommonType, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{s.label}</div>
                  <div style={{ color: s.color }} className="text-2xl font-black">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incident trend */}
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-bold mb-4">Monthly Incident Frequency</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.incidentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Bar dataKey="incidents" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* SafeScore trend */}
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-bold mb-4">SafeScore™ Aggregate Index</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.incidentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Line type="monotone" dataKey="safeScore" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name="SafeScore" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top risk locations */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-white font-bold mb-4">High Priority Risk Segments</h3>
              <div className="flex flex-col gap-3">
                {data?.topRiskLocations?.map((loc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-black text-sm">#{i+1}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{loc.name}</p>
                        <p className="text-slate-400 text-xs">{loc.zone} · {loc.incidents} active reports</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">{loc.avgSafeScore}/100</span>
                      <p className="text-slate-500 text-[11px]">SafeScore</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
