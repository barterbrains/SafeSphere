import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../utils';
import { InstitutionNav } from './InstitutionNav';

export default function InstitutionProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const isDemo = !user || user.id?.startsWith('demo') || user.email?.includes('demo') || user.role === 'consumer' || user.role === 'institution';

  const profileData = {
    name: user?.name || 'Commander Alex Vance',
    role: 'Chief Security Officer (CSO)',
    organization: 'SafeSphere NCR Operations & Delhi Command Desk',
    institutionId: 'INST-DL-84920',
    email: user?.email || 'delhi.command@safesphere.org',
    clearanceLevel: 'LEVEL 5 — STRATEGIC DISPATCH',
    station: 'Delhi NCR Command Hub (Connaught Place)',
    activeGuardians: '148 Active Personnel',
    monitoredUnits: '1,240 Verified Nodes',
    lastAudit: 'Today at 06:00 IST (Passed 100%)',
    encryption: 'AES-256-GCM End-to-End Quantum-Resistant',
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Operational Profile &amp; Clearance
              {isDemo && (
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Demo Command Access
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Credentials, clearance level, and institutional permissions.</p>
          </div>

          <button
            onClick={() => { clearAuth(); navigate('/login'); }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>

        {/* Profile Card & Details Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Column: Avatar & Clearance Badge */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111522]/80 backdrop-blur-2xl border border-white/10 p-6 flex flex-col items-center text-center shadow-xl">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#3730a3] border-2 border-indigo-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                <span className="material-symbols-outlined text-5xl text-white">shield_person</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                Active
              </div>
            </div>

            <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
            <p className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mt-0.5">{profileData.role}</p>
            <p className="text-slate-400 text-xs mt-2 max-w-[240px]">{profileData.organization}</p>

            <div className="w-full border-t border-white/10 my-6" />

            <div className="w-full flex flex-col gap-3 text-left">
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3">
                <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase block">Clearance Status</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">{profileData.clearanceLevel}</span>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Institution ID</span>
                <span className="text-sm font-mono text-slate-200 mt-0.5 block">{profileData.institutionId}</span>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Contact Frequency</span>
                <span className="text-sm font-mono text-slate-200 mt-0.5 block">{profileData.email}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Fleet & Security Permissions */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Operational Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-slate-400 block">Guardians in Field</span>
                <span className="text-2xl font-black text-white mt-1 block">148</span>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span> 100% On-Duty
                </span>
              </div>

              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-slate-400 block">Active Telemetry Units</span>
                <span className="text-2xl font-black text-indigo-400 mt-1 block">1,240</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Sub-second latency</span>
              </div>

              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-slate-400 block">Incident Protocol</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">DEFCON 4</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Standard Readiness</span>
              </div>
            </div>

            {/* Security Parameters & Capabilities */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex-1">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">admin_panel_settings</span>
                Institutional Access &amp; Protocol Grants
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Live Heatmap Dispatch', desc: 'Real-time telemetry overlay access across all city transit corridors.', status: 'Authorized' },
                  { title: 'Emergency SOS Broadcast', desc: 'Instant multi-channel push & emergency contact dispatch trigger.', status: 'Authorized' },
                  { title: 'Fleet SafeScore Auditing', desc: 'Read/write permissions for district-level risk assessments.', status: 'Authorized' },
                  { title: 'Anonymized Data Purging', desc: 'Cryptographic compliance with zero persistent telemetry storage.', status: 'Compliant' },
                ].map((cap) => (
                  <div key={cap.title} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-white">{cap.title}</span>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                          {cap.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Encryption & Compliance Banner */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 to-indigo-900/20 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-indigo-400">lock</span>
                  <div>
                    <span className="text-xs font-bold text-white block">Quantum-Resistant Encryption</span>
                    <span className="text-[11px] text-slate-400 block">{profileData.encryption}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Certificate verified: SafeSphere Institutional Seal 2025')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none"
                >
                  Verify Key
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
