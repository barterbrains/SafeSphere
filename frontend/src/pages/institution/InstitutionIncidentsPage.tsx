import { useState, useEffect } from 'react';
import { Filter, AlertTriangle } from 'lucide-react';
import { apiFetch, timeAgo } from '../../utils';
import { InstitutionNav } from './InstitutionOverviewPage';

export default function InstitutionIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    apiFetch('/institution/incidents').then(setIncidents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(i => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const severityConfig: Record<string, { color: string; bg: string }> = {
    critical: { color: '#dc2626', bg: '#dc262215' },
    high: { color: '#ea580c', bg: '#ea580c15' },
    medium: { color: '#d97706', bg: '#d9770615' },
    low: { color: '#16a34a', bg: '#16a34a15' },
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    open: { color: '#dc2626', label: 'Open' },
    investigating: { color: '#d97706', label: 'Investigating' },
    resolved: { color: '#16a34a', label: 'Resolved' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <InstitutionNav />
      <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>Incident Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>All reported safety incidents · GTBIT Area</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', padding: '8px 12px', fontFamily: 'inherit', fontSize: '0.82rem', outline: 'none' }}>
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', padding: '8px 12px', fontFamily: 'inherit', fontSize: '0.82rem', outline: 'none' }}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ borderTopColor: '#4f46e5', borderColor: '#1e293b', width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: 8 }}>{filtered.length} incidents found</p>
            {filtered.map(incident => {
              const sc = severityConfig[incident.severity] || { color: '#94a3b8', bg: 'transparent' };
              const stc = statusConfig[incident.status] || { color: '#94a3b8', label: incident.status };
              return (
                <div key={incident.id} style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{incident.severity}</span>
                      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.88rem' }}>{incident.type}</span>
                    </div>
                    <span style={{ color: stc.color, fontSize: '0.72rem', fontWeight: 600, background: stc.color + '15', padding: '3px 10px', borderRadius: 999 }}>{stc.label}</span>
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '0.88rem', marginBottom: 10 }}>{incident.description}</p>
                  <div style={{ display: 'flex', gap: 16, color: '#475569', fontSize: '0.75rem' }}>
                    <span>📍 {incident.location.address}</span>
                    <span>🕐 {timeAgo(incident.timestamp)}</span>
                    <span style={{ color: '#334155' }}>·</span>
                    <span>{new Date(incident.timestamp).toLocaleDateString('en-IN')}</span>
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
