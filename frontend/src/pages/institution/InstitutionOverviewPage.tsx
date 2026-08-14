import { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Shield, Users, AlertTriangle, Bell, BarChart2, Map, LogOut, Activity } from 'lucide-react';
import { apiFetch, clearAuth, timeAgo } from '../../utils';

function InstitutionNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/institution/overview', icon: Activity, label: 'Overview' },
    { path: '/institution/heatmap', icon: Map, label: 'Heatmap' },
    { path: '/institution/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/institution/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/institution/alerts', icon: Bell, label: 'Alerts' },
  ];

  return (
    <aside style={{ width: 220, background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>SafeSphere</div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Institution Portal</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 12px', flex: 1 }}>
        <p style={{ color: '#475569', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>Navigation</p>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s',
              background: isActive(item.path) ? 'rgba(79,70,229,0.2)' : 'transparent',
              color: isActive(item.path) ? '#a5b4fc' : '#64748b',
            }}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '12px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>GTBIT</p>
          <p style={{ color: '#475569', fontSize: '0.7rem' }}>Guru Tegh Bahadur IT</p>
        </div>
        <button
          onClick={() => { clearAuth(); navigate('/institution/login'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginTop: 12, padding: '8px 12px', width: '100%', borderRadius: 8, fontFamily: 'inherit' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export { InstitutionNav };

export default function InstitutionOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/institution/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <InstitutionNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: '#4f46e5', borderColor: '#1e293b', width: 32, height: 32, borderWidth: 3 }} />
      </div>
    </div>
  );

  const o = data?.overview;

  const stats = [
    { label: 'Total Journeys', value: o?.totalJourneys?.toLocaleString(), icon: Users, color: '#4f46e5', bg: 'rgba(79,70,229,0.15)' },
    { label: 'Avg SafeScore™', value: o?.avgSafeScore, icon: Shield, color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
    { label: 'Open Incidents', value: o?.openIncidents, icon: AlertTriangle, color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
    { label: 'Active Alerts', value: o?.activeAlerts, icon: Bell, color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <InstitutionNav />
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>Safety Overview</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>GTBIT Campus Safety Dashboard · Last 6 months</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </div>
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Lower grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Severity breakdown */}
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20 }}>Incidents by Severity</h3>
            {data?.bySeverity && [
              { key: 'critical', label: 'Critical', color: '#dc2626', max: 5 },
              { key: 'high', label: 'High', color: '#ea580c', max: 8 },
              { key: 'medium', label: 'Medium', color: '#d97706', max: 12 },
              { key: 'low', label: 'Low', color: '#16a34a', max: 15 },
            ].map(({ key, label, color, max }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.83rem' }}>{label}</span>
                  <span style={{ color, fontWeight: 700, fontSize: '0.83rem' }}>{data.bySeverity[key]}</span>
                </div>
                <div style={{ height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(data.bySeverity[key] / max) * 100}%`, background: color, borderRadius: 3, transition: 'width 1s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent alerts */}
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20 }}>Recent Alerts</h3>
            {data?.recentAlerts?.map((alert: any) => (
              <div key={alert.id} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 14, marginBottom: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: alert.severity === 'high' ? '#dc2626' : alert.severity === 'medium' ? '#d97706' : '#16a34a', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.4 }}>{alert.message}</p>
                  <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: 4 }}>{timeAgo(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
