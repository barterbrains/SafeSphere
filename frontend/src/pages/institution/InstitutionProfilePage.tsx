import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionNav } from './InstitutionNav';
import {
  Building2, Shield, MapPin, Globe, Phone, Mail,
  Users, CheckCircle2, ShieldCheck, Edit3, Award,
  Clock, AlertTriangle, Radio, Car, Navigation,
  FileText, X, Save, Sparkles, Landmark, BadgeCheck,
  Hospital, ShieldAlert
} from 'lucide-react';

interface InstituteProfileData {
  name: string;
  type: string;
  domain: string;
  address: string;
  affiliation: string;
  licenseNumber: string;
  establishmentYear: string;
  totalUsers: string;
  csoName: string;
  csoRole: string;
  hotlinePhone: string;
  csoEmail: string;
  nearestPoliceStation: string;
  policeDistance: string;
  policePhone: string;
  nearestHospital: string;
  hospitalDistance: string;
  hospitalPhone: string;
  fireStation: string;
  geofenceRadius: string;
  patrolFleetCount: number;
}

export default function InstitutionProfilePage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, isDemo } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // ── College / Institute Profile Details ──
  const [institute, setInstitute] = useState<InstituteProfileData>({
    name: 'Guru Tegh Bahadur Institute of Technology (GTBIT)',
    type: 'Engineering & Technology University Campus',
    domain: 'gtbit.edu.in',
    address: 'G-8 Area, Rajouri Garden, New Delhi, Delhi 110064',
    affiliation: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
    licenseNumber: 'AICTE-DEL-ENG-2024 / ISO 27001 Safety Certified',
    establishmentYear: '1999',
    totalUsers: '4,850 Enrolled Students, Faculty & Staff',
    csoName: 'Prof. Harminder Singh',
    csoRole: 'Chief Security Officer & Campus Proctor',
    hotlinePhone: '+91 (11) 2852-1234 / Ext. 911',
    csoEmail: 'security.command@gtbit.edu.in',
    nearestPoliceStation: 'Rajouri Garden Police Station (West District)',
    policeDistance: '450 meters (3 min PCR dispatch)',
    policePhone: '112 / +91 (11) 2519-1234',
    nearestHospital: 'ESI Postgraduate Medical Institute & Hospital',
    hospitalDistance: '1.2 km (5 min ambulance transit)',
    hospitalPhone: '102 / +91 (11) 2545-2000',
    fireStation: 'Janakpuri Fire Division (Station #14) · 2.1 km',
    geofenceRadius: '800 meters Active Radius',
    patrolFleetCount: 4,
  });

  // Edit form state
  const [editForm, setEditForm] = useState<InstituteProfileData>({ ...institute });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setInstitute({ ...editForm });
    setIsEditModalOpen(false);
    setSaveToast('Institute Profile updated successfully.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      {/* Institutional Left Sidebar */}
      <InstitutionNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a12] p-6 lg:p-10 flex flex-col gap-6">
        {/* Toast Notification */}
        {saveToast && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm flex items-center justify-between shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>{saveToast}</span>
            </div>
            <button onClick={() => setSaveToast(null)} className="text-emerald-300/60 hover:text-emerald-200 bg-transparent border-none cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Top Header Banner: College / Organization Profile ── */}
        <div className="w-full bg-[#121420] border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#312e81] border border-[#818cf8]/40 shadow-[0_0_24px_rgba(79,70,229,0.4)] flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {institute.name}
                  </h1>
                  <span className="bg-[#3131c0]/40 text-[#c0c1ff] border border-[#818cf8]/40 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                    <BadgeCheck size={13} className="text-indigo-300" />
                    Verified Institution
                  </span>
                </div>
                <p className="text-[#94a3b8] text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-300 font-semibold">{institute.type}</span>
                  <span className="text-white/20">•</span>
                  <span>{institute.affiliation}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-slate-400">Est. {institute.establishmentYear}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-[#94a3b8] mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    <Globe size={13} />
                    {institute.domain}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={13} className="text-red-400" />
                    {institute.address}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditForm({ ...institute });
                setIsEditModalOpen(true);
              }}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 text-white font-bold text-xs px-5 py-3 rounded-xl border border-indigo-500/40 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start"
            >
              <Edit3 size={15} className="text-indigo-400" />
              <span>Edit Institute Details</span>
            </button>
          </div>

          {/* ── Key Institute Metrics ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Active Enrolled Users
              </span>
              <span className="text-xl font-black text-white">4,850</span>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-1">● Active Campus Coverage</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Patrol Escort Fleets
              </span>
              <span className="text-xl font-black text-indigo-300">{institute.patrolFleetCount} Vehicles</span>
              <span className="text-[11px] text-[#94a3b8] font-medium block mt-1">GPS Telemetry Linked</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Campus Security Geofence
              </span>
              <span className="text-xl font-black text-white">{institute.geofenceRadius}</span>
              <span className="text-[11px] text-emerald-400 font-medium block mt-1">24/7 Monitored</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Police Station Link
              </span>
              <span className="text-xl font-black text-red-400">450m</span>
              <span className="text-[11px] text-[#94a3b8] font-medium block mt-1">Rajouri Garden PS</span>
            </div>
          </div>
        </div>

        {/* ── 2-Column Institutional Information Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Organization & Campus Entity Info */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Landmark size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Entity &amp; Campus Registration</h2>
                <p className="text-xs text-[#94a3b8]">Official organizational credentials and accreditation</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-start">
                <div>
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Legal Institution Name
                  </span>
                  <span className="text-white font-bold text-sm">{institute.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Institution Category
                  </span>
                  <span className="text-white font-semibold">{institute.type}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    University / Board Affiliation
                  </span>
                  <span className="text-white font-semibold">{institute.affiliation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    License &amp; Accreditation ID
                  </span>
                  <span className="text-indigo-300 font-mono font-bold">{institute.licenseNumber}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Official Domain &amp; SSO
                  </span>
                  <span className="text-indigo-300 font-mono font-bold">{institute.domain}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Registered Campus HQ Address
                </span>
                <span className="text-white font-medium flex items-center gap-1.5 mt-1">
                  <MapPin size={14} className="text-red-400 shrink-0" />
                  {institute.address}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Security Administration & Command Contacts */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Security Command Administration</h2>
                <p className="text-xs text-[#94a3b8]">Chief Security Officer and active dispatch desks</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Chief Security Officer &amp; Proctor
                  </span>
                  <span className="text-white font-bold text-sm">{institute.csoName}</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">{institute.csoRole}</span>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  ● On Duty
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    24/7 Command Hotline
                  </span>
                  <span className="text-indigo-300 font-mono font-bold text-sm">{institute.hotlinePhone}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Official Security Email
                  </span>
                  <span className="text-white font-mono font-semibold truncate block">{institute.csoEmail}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Night Escort &amp; Patrol Transit Service
                </span>
                <span className="text-white font-medium flex items-center gap-1.5 mt-1">
                  <Clock size={14} className="text-indigo-400 shrink-0" />
                  Active 6:00 PM – 6:00 AM (4 Mobile Escort PCR Vehicles)
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Fire &amp; Disaster Management Station
                </span>
                <span className="text-white font-medium flex items-center gap-1.5 mt-1">
                  <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                  {institute.fireStation}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Emergency First Responders Jurisdictions ── */}
        <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Radio size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Emergency First Responder Integrations</h2>
              <p className="text-xs text-[#94a3b8]">Live dispatch channels linked to nearby emergency civic stations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
            {/* Police Station */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px]">Jurisdiction Police Station</span>
                <span className="text-emerald-400 font-bold">{institute.policeDistance}</span>
              </div>
              <span className="text-white font-bold text-sm">{institute.nearestPoliceStation}</span>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[#94a3b8]">
                <span>Emergency Contact:</span>
                <span className="text-white font-mono font-bold">{institute.policePhone}</span>
              </div>
            </div>

            {/* Hospital Link */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px]">Emergency Medical &amp; Trauma Centre</span>
                <span className="text-emerald-400 font-bold">{institute.hospitalDistance}</span>
              </div>
              <span className="text-white font-bold text-sm">{institute.nearestHospital}</span>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[#94a3b8]">
                <span>Ambulance Hotline:</span>
                <span className="text-white font-mono font-bold">{institute.hospitalPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── EDIT INSTITUTE PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 lg:p-8 relative border border-white/15 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#121522' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Institute Details</h2>
                  <p className="text-xs text-[#94a3b8]">Update official campus entity information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#94a3b8] hover:text-white bg-transparent border-none cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                  Official Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                    Institution Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                    Official Domain
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.domain}
                    onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                  Campus HQ Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                    Security Operations Hotline
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.hotlinePhone}
                    onChange={e => setEditForm({ ...editForm, hotlinePhone: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1.5">
                    Chief Security Officer (CSO)
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.csoName}
                    onChange={e => setEditForm({ ...editForm, csoName: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#3730a3] hover:from-[#6366f1] hover:to-[#4338ca] text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(79,70,229,0.35)] flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
