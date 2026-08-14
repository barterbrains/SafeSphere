import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { apiFetch, timeAgo } from '../../utils';
import { InstitutionNav } from './InstitutionOverviewPage';

export default function InstitutionAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/institution/alerts').then(setAlerts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const severityConfig: Record<string, { color: string; bg: string; icon: string }> = {
    critical: { color: '#dc2626', bg: '#dc262215', icon: '🔴' },
    high: { color: '#ea580c', bg: '#ea580c15', icon: '🟠' },
    medium: { color: '#d97706', bg: '#d9770615', icon: '🟡' },
    low: { color: '#16a34a', bg: '#16a34a15', icon: '🟢' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <InstitutionNav />
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>Safety Alerts</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>Real-time safety notifications · GTBIT</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ borderTopColor: '#4f46e5', borderColor: '#1e293b', width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {alerts.map(alert => {
              const sc = severityConfig[alert.severity] || { color: '#94a3b8', bg: '#1e293b', icon: '⚫' };
              return (
                <div key={alert.id} style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: `1px solid ${sc.color}33`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', marginTop: 2 }}>{sc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: sc.color, fontSize: '0.72rem', fontWeight: 700, background: sc.bg, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>{alert.severity}</span>
                      <span style={{ color: '#475569', fontSize: '0.72rem' }}>{timeAgo(alert.timestamp)}</span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 8 }}>{alert.message}</p>
                    <div style={{ display: 'flex', gap: 12, color: '#475569', fontSize: '0.75rem' }}>
                      <span>📍 {alert.location}</span>
                      <span style={{ color: alert.status === 'open' ? '#dc2626' : alert.status === 'investigating' ? '#d97706' : '#16a34a', fontWeight: 600 }}>● {alert.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
