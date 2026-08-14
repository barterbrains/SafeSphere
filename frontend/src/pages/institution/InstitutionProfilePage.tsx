import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionNav } from './InstitutionNav';
import {
  Building2, Shield, MapPin, Globe, Phone, Mail,
  Users, CheckCircle2, ShieldCheck, Edit3, Plus,
  Clock, AlertTriangle, Radio, Car, Navigation,
  FileText, Award, X, Save, Sparkles, AlertCircle
} from 'lucide-react';

interface InstituteData {
  name: string;
  type: string;
  domain: string;
  address: string;
  affiliation: string;
  licenseNumber: string;
  totalUsers: string;
  csoName: string;
  csoRole: string;
  hotlinePhone: string;
  csoEmail: string;
  nearestPoliceStation: string;
  policeDistance: string;
  nearestHospital: string;
  hospitalDistance: string;
  patrolVehiclesCount: number;
  safeHavensCount: number;
}

export default function InstitutionProfilePage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, isDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'personnel' | 'dispatch'>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // ── Institute Data State ──
  const [institute, setInstitute] = useState<InstituteData>({
    name: 'Guru Tegh Bahadur Institute of Technology (GTBIT)',
    type: 'Engineering & Technology University Campus',
    domain: 'gtbit.edu.in',
    address: 'G-8 Area, Rajouri Garden, New Delhi, Delhi 110064',
    affiliation: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
    licenseNumber: 'AICTE-DEL-ENG-2024 / ISO 27001 Certified',
    totalUsers: '4,850 Active Students & Faculty',
    csoName: 'Prof. Harminder Singh',
    csoRole: 'Chief Security Officer & Campus Proctor',
    hotlinePhone: '+91 (11) 2852-1234 / Ext. 911',
    csoEmail: 'security.command@gtbit.edu.in',
    nearestPoliceStation: 'Rajouri Garden Police Station (West District)',
    policeDistance: '450 meters (3 min PCR dispatch)',
    nearestHospital: 'ESI Postgraduate Medical Institute & Hospital',
    hospitalDistance: '1.2 km (5 min ambulance transit)',
    patrolVehiclesCount: 4,
    safeHavensCount: 6,
  });

  // Edit form state
  const [editForm, setEditForm] = useState<InstituteData>({ ...institute });

  // Safe Havens List
  const [safeHavens, setSafeHavens] = useState([
    { id: 'sh-1', name: 'Main Campus Gate 1 Guard Node', location: 'Ring Road Entry Corridor', status: '24/7 Manned', officers: 3 },
    { id: 'sh-2', name: 'Central Library 24x7 Night Hub', location: 'Block B Ground Floor', status: 'Active Surveillance', officers: 2 },
    { id: 'sh-3', name: 'Girls Hostel Perimeter Security Post', location: 'Hostel Block C East Wing', status: 'High Priority Guarded', officers: 4 },
    { id: 'sh-4', name: 'Admin & Examination Safe Haven', location: 'Main Administrative Complex', status: '24/7 Manned', officers: 2 },
    { id: 'sh-5', name: 'Sports Arena & West Exit Kiosk', location: 'West Gate Athletic Corridor', status: 'Patrol Monitored', officers: 2 },
    { id: 'sh-6', name: 'Rajouri Metro Feeder Safe Corridor', location: 'Subhash Nagar Metro Link', status: 'Active Escort Link', officers: 3 },
  ]);

  // Security Officers Directory
  const [officers, setOfficers] = useState([
    { id: 'off-1', name: 'Prof. Harminder Singh', role: 'Chief Security Officer', badge: 'CSO-01', phone: '+91 98111 22334', shift: 'General Command', status: 'On Duty' },
    { id: 'off-2', name: 'Inspector Jaswant Gill', role: 'Senior Patrol Supervisor', badge: 'SEC-104', phone: '+91 98200 44556', shift: 'Night Escort Command', status: 'On Duty' },
    { id: 'off-3', name: 'Warden Sunita Malhotra', role: 'Hostel Safety Coordinator', badge: 'SEC-108', phone: '+91 97170 88990', shift: 'Evening / Night Shift', status: 'On Duty' },
    { id: 'off-4', name: 'Officer Vikramaditya Rao', role: 'Mobile Rapid PCR Operator', badge: 'PCR-02', phone: '+91 99100 33445', shift: 'Mobile Quick Response', status: 'On Patrol' },
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setInstitute({ ...editForm });
    setIsEditModalOpen(false);
    setSaveToast('Institutional Profile updated successfully.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      {/* Institutional Left Sidebar */}
      <InstitutionNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a12] p-6 lg:p-8 flex flex-col gap-6">
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

        {/* ── Top Institutional Header Card ── */}
        <div className="w-full bg-[#121420] border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Subtle glowing radial background */}
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
                  <span className="bg-[#3131c0]/40 text-[#c0c1ff] border border-[#818cf8]/40 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                    Verified Institution
                  </span>
                </div>
                <p className="text-[#94a3b8] text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-300 font-semibold">{institute.type}</span>
                  <span className="text-white/20">•</span>
                  <span>{institute.affiliation}</span>
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
              <span>Edit Details</span>
            </button>
          </div>

          {/* ── Key Metrics Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Enrolled Users
              </span>
              <span className="text-xl font-black text-white">4,850</span>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-1">● Active Protection</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Patrol Fleet Units
              </span>
              <span className="text-xl font-black text-indigo-300">{institute.patrolVehiclesCount} PCR Units</span>
              <span className="text-[11px] text-[#94a3b8] font-medium block mt-1">GPS Monitored</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Campus Safe Havens
              </span>
              <span className="text-xl font-black text-white">{institute.safeHavensCount} Verified Hubs</span>
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

        {/* ── Tab Navigation Strip ── */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-2 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#3730a3] text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            <Building2 size={15} />
            <span>Campus &amp; Safe Havens</span>
          </button>

          <button
            onClick={() => setActiveTab('personnel')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-2 ${
              activeTab === 'personnel'
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#3730a3] text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            <Users size={15} />
            <span>Security Personnel Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-2 ${
              activeTab === 'dispatch'
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#3730a3] text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            <Radio size={15} />
            <span>Emergency Dispatch &amp; First Responders</span>
          </button>
        </div>

        {/* ── TAB 1: CAMPUS DETAILS & SAFE HAVENS ── */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left 2 Cols: Safe Havens Table */}
            <div className="lg:col-span-2 bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Designated Campus Safe Havens</h2>
                  <p className="text-xs text-[#94a3b8]">Active safe-refuge points with physical panic beacons and escort stations</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {safeHavens.length} Active Hubs
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {safeHavens.map(hub => (
                  <div
                    key={hub.id}
                    className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{hub.name}</h3>
                        <p className="text-xs text-[#94a3b8] flex items-center gap-1.5 mt-1">
                          <MapPin size={12} className="text-indigo-400" />
                          {hub.location}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-bold border border-indigo-500/30">
                        {hub.status}
                      </span>
                      <span className="text-[11px] text-[#94a3b8] block mt-1.5">
                        {hub.officers} Officers Stationed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Accreditation & Operational Compliance */}
            <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <h2 className="text-lg font-bold text-white">Compliance &amp; Accreditations</h2>

              <div className="space-y-4 text-xs">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block">License &amp; Accreditation</span>
                  <span className="text-white font-mono font-medium">{institute.licenseNumber}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block">Security Operations Hotline</span>
                  <span className="text-indigo-300 font-mono font-bold text-sm">{institute.hotlinePhone}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block">Campus Geofence Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Active (Radius: 800m Perimeter)
                  </span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1.5">
                  <span className="text-[#94a3b8] font-bold uppercase tracking-wider text-[10px] block">Emergency Escort Service</span>
                  <span className="text-white font-semibold leading-relaxed">
                    Available 6:00 PM – 6:00 AM for Students &amp; Staff
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SECURITY PERSONNEL DIRECTORY ── */}
        {activeTab === 'personnel' && (
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Campus Security Officers &amp; First Responders</h2>
                <p className="text-xs text-[#94a3b8]">Personnel authorized for emergency dispatch, incident resolution, and campus audit logging</p>
              </div>
              <button
                onClick={() => alert('New Officer Provisioning is managed via your Institution Enterprise Administrator account.')}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Officer</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[#94a3b8] uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 font-bold">Officer Name</th>
                    <th className="py-3.5 px-4 font-bold">Role &amp; Assignment</th>
                    <th className="py-3.5 px-4 font-bold">Badge ID</th>
                    <th className="py-3.5 px-4 font-bold">Direct Phone</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Shift</th>
                    <th className="py-3.5 px-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {officers.map(officer => (
                    <tr key={officer.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {officer.name[0]}
                        </div>
                        <span>{officer.name}</span>
                      </td>
                      <td className="py-4 px-4 text-[#94a3b8] font-medium">{officer.role}</td>
                      <td className="py-4 px-4 text-indigo-300 font-mono font-bold">{officer.badge}</td>
                      <td className="py-4 px-4 text-white font-mono">{officer.phone}</td>
                      <td className="py-4 px-4 text-[#94a3b8]">{officer.shift}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold text-[10px]">
                          ● {officer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: EMERGENCY DISPATCH & FIRST RESPONDERS ── */}
        {activeTab === 'dispatch' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Police Integration Card */}
            <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Local Police Station Link</h3>
                  <p className="text-xs text-red-300 font-semibold">Priority PCR Response Corridor</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-wider block">Jurisdiction Station</span>
                  <span className="text-white font-bold text-sm">{institute.nearestPoliceStation}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[#94a3b8]">Distance from Campus</span>
                  <span className="text-emerald-400 font-bold">{institute.policeDistance}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#94a3b8]">Direct Police Helpline</span>
                  <span className="text-white font-mono font-bold">112 / +91 (11) 2519-1234</span>
                </div>
              </div>
            </div>

            {/* Hospital Integration Card */}
            <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Emergency Trauma &amp; Medical Link</h3>
                  <p className="text-xs text-emerald-300 font-semibold">Ambulance &amp; Emergency Care</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-wider block">Primary Medical Center</span>
                  <span className="text-white font-bold text-sm">{institute.nearestHospital}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[#94a3b8]">Transit Distance</span>
                  <span className="text-emerald-400 font-bold">{institute.hospitalDistance}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#94a3b8]">Ambulance Dispatch</span>
                  <span className="text-white font-mono font-bold">102 / 108</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
                    Institution Type
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
