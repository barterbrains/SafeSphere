import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils';
import { InstitutionNav } from './InstitutionOverviewPage';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstitutionAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/institution/analytics').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const customTooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: '0.82rem' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <InstitutionNav />
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>Safety Analytics</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>Trend analysis · Nov 2024 – Apr 2025</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ borderTopColor: '#4f46e5', borderColor: '#1e293b', width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Incidents', value: data?.summary?.totalIncidents, color: '#dc2626' },
                { label: 'Resolution Rate', value: data?.summary?.resolvedRate + '%', color: '#16a34a' },
                { label: 'Avg Response Time', value: data?.summary?.avgResponseTime, color: '#4f46e5' },
                { label: 'Most Common', value: data?.summary?.mostCommonType, color: '#d97706' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: '1.4rem', fontWeight: 800 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Incident trend */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20 }}>Monthly Incident Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="incidents" fill="#4f46e5" radius={[4,4,0,0]} name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SafeScore trend */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20 }}>SafeScore™ Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis domain={[50, 80]} stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Line type="monotone" dataKey="safeScore" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} name="SafeScore" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top risk locations */}
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20 }}>Top High-Risk Locations</h3>
              {data?.topRiskLocations?.map((loc: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #0f172a' }}>
                  <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, width: 20 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 600 }}>{loc.name}</p>
                    <p style={{ color: '#475569', fontSize: '0.75rem' }}>{loc.zone} · {loc.incidents} incidents</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: loc.avgSafeScore < 40 ? '#dc2626' : loc.avgSafeScore < 55 ? '#d97706' : '#16a34a', fontWeight: 800, fontSize: '1rem' }}>{loc.avgSafeScore}</span>
                    <p style={{ color: '#475569', fontSize: '0.7rem' }}>SafeScore</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
