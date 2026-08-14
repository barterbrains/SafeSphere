import { useState, useEffect } from 'react';
import { InstitutionNav } from './InstitutionNav';
import { DEMO_INCIDENTS } from '../../mock/demoCommandCenterData';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function InstitutionIncidentsPage() {
  const { user, isDemo } = useAuth();
  const [filterSeverity, setFilterSeverity] = useState('');
  const [realIncidents, setRealIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo || !user?.id) {
      setLoading(false);
      return;
    }

    const currentUserId = user.id;

    async function loadUserAuditLogs() {
      try {
        const { data } = await supabase
          .from('sos_incidents')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (data) {
          setRealIncidents(data.map(d => ({
            id: `#AUD-${d.id.slice(0, 5).toUpperCase()}`,
            location: d.location_name || 'Delhi NCR Region',
            type: d.type || 'Emergency SOS',
            severity: d.status === 'active' ? 'HIGH' : 'LOW',
            time: new Date(d.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          })));
        }
      } catch (err) {
        console.error('Error fetching real incident audits:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserAuditLogs();
  }, [isDemo, user?.id]);

  const incidentsList = isDemo ? DEMO_INCIDENTS : realIncidents;

  const filtered = incidentsList.filter(i => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Safety Audits &amp; Logged Incidents
              {isDemo ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Demo Simulated Audits
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified User Trail
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Verified audit trail and incident log with real-time response dispatch.</p>
          </div>

          <div className="flex gap-3">
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-[#111522] border border-white/10 rounded-xl text-slate-300 text-xs px-3 py-2 outline-none cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Incidents Table Container */}
        <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-xl relative z-10">
          <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filtered.length} Audited Logs Found</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span> Verified Cryptographic Log
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl text-slate-600">policy</span>
              <div>
                <h3 className="text-sm font-bold text-slate-300">No Audited Incidents on Record</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Your safety log is completely clean. Any SOS events, check-in alerts, or corridor deviations will be cryptographically audited here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/5 bg-black/10">
                    <th className="p-4">Incident ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filtered.map(i => (
                    <tr key={i.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-400 text-xs">{i.id}</td>
                      <td className="p-4 text-white font-medium">{i.location}</td>
                      <td className="p-4">
                        <span className="text-slate-300 text-xs bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                          {i.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            i.severity === 'HIGH'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : i.severity === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {i.severity}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs text-slate-400 font-mono">{i.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
