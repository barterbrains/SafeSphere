import { useState } from 'react';
import { InstitutionNav } from './InstitutionNav';
import { DEMO_INCIDENTS } from '../../mock/demoCommandCenterData';

export default function InstitutionIncidentsPage() {
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = DEMO_INCIDENTS.filter(i => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterType && i.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Safety Audits &amp; Logged Incidents</h1>
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
              <tbody className="text-sm">
                {filtered.map(inc => (
                  <tr key={inc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="p-4 font-mono text-indigo-400 font-semibold">{inc.id}</td>
                    <td className="p-4 text-white font-medium">{inc.location}</td>
                    <td className="p-4 text-slate-300">{inc.type}</td>
                    <td className="p-4">
                      {inc.severity === 'HIGH' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                          HIGH
                        </span>
                      )}
                      {inc.severity === 'MEDIUM' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                          MEDIUM
                        </span>
                      )}
                      {inc.severity === 'LOW' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-700/30 text-slate-300 border border-white/10 text-xs font-bold">
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
      </main>
    </div>
  );
}
