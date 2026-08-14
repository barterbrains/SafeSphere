import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionNav } from './InstitutionNav';
import {
  Building2, Shield, MapPin, Globe, Users,
  CheckCircle2, ShieldCheck, Edit3, Award,
  Clock, AlertTriangle, Radio, Landmark,
  X, Save, FileText, Check, Info, Lock,
  ShieldAlert, Hospital, Info as InfoIcon
} from 'lucide-react';

interface InstitutionProfile {
  name: string;
  shortName: string;
  type: string;
  affiliation: string;
  location: string;
  address: string;
  domain: string;
  institutionId: string;
  administrator: string;
  authorizedStaffCount: number;
  safetyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  monitoredZones: number;
  safeZones: number;
  highRiskZones: number;
  insufficientDataZones: number;
  activeIncidents: number;
  activeAlerts: number;
  dataCoverage: number;
  totalArea: string;
  lastUpdated: string;
  lastRefresh: string;
}

export default function InstitutionProfilePage() {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // ── Centralized Institution Profile Object (Demo Environment) ──
  const [profile, setProfile] = useState<InstitutionProfile>({
    name: 'Guru Tegh Bahadur Institute of Technology (GTBIT)',
    shortName: 'GTBIT',
    type: 'Engineering & Technology Institution',
    affiliation: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
    location: 'New Delhi, India',
    address: 'G-8 Area, Rajouri Garden, New Delhi, Delhi 110064',
    domain: 'gtbit.edu.in',
    institutionId: 'INST-DEL-GTBIT-01',
    administrator: 'Campus Safety Operations Desk (admin@gtbit.edu.in)',
    authorizedStaffCount: 4,
    safetyScore: 76,
    riskLevel: 'Moderate',
    monitoredZones: 24,
    safeZones: 18,
    highRiskZones: 4,
    insufficientDataZones: 2,
    activeIncidents: 3,
    activeAlerts: 2,
    dataCoverage: 82,
    totalArea: '~1.8 km² Campus Perimeter',
    lastUpdated: 'Today, 11:30 PM',
    lastRefresh: 'Today, Periodic Update (OSM & Reports)',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: profile.name,
    type: profile.type,
    affiliation: profile.affiliation,
    location: profile.location,
    address: profile.address,
    domain: profile.domain,
    administrator: profile.administrator,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editForm.name,
      type: editForm.type,
      affiliation: editForm.affiliation,
      location: editForm.location,
      address: editForm.address,
      domain: editForm.domain,
      administrator: editForm.administrator,
      lastUpdated: 'Just now',
    }));
    setIsEditModalOpen(false);
    setSaveToast('Institution configuration updated successfully.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a12] text-[#e2e2e2] font-['Inter',sans-serif]">
      {/* Institutional Left Sidebar (Fixed) */}
      <InstitutionNav />

      {/* Main Scrollable Content Container */}
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
        <div className="max-w-[1360px] mx-auto flex flex-col gap-7">

          {/* Toast Notification */}
          {saveToast && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{saveToast}</span>
              </div>
              <button onClick={() => setSaveToast(null)} className="text-emerald-300/60 hover:text-emerald-200 bg-transparent border-none cursor-pointer">
                <X size={15} />
              </button>
            </div>
          )}

          {/* ── 1. CLEAN INSTITUTION HEADER ── */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 lg:p-7 relative shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-[#a5b4fc]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                      {profile.name}
                    </h1>
                    <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Demo Institution
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#94a3b8] flex-wrap mt-0.5">
                    <span className="text-slate-300 font-medium">{profile.type}</span>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin size={13} className="text-rose-400 shrink-0" />
                      {profile.location}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">{profile.institutionId}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditForm({
                    name: profile.name,
                    type: profile.type,
                    affiliation: profile.affiliation,
                    location: profile.location,
                    address: profile.address,
                    domain: profile.domain,
                    administrator: profile.administrator,
                  });
                  setIsEditModalOpen(true);
                }}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start md:self-center"
              >
                <Edit3 size={14} className="text-indigo-400" />
                <span>Edit Institution Details</span>
              </button>
            </div>
          </div>

          {/* ── 2. TWO-COLUMN: ORGANIZATION DETAILS & SAFETY ADMINISTRATION ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Organization Details */}
            <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                  <Landmark size={17} className="text-indigo-400" />
                  <span>Organization Details</span>
                </div>
                <span className="text-[11px] text-[#64748b] font-medium">Core Configuration</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Institution Name</span>
                  <span className="text-slate-200 font-semibold text-right max-w-[65%]">{profile.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Institution Type</span>
                  <span className="text-slate-200 font-semibold">{profile.type}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">University / Board Affiliation</span>
                  <span className="text-slate-200 font-semibold text-right">{profile.affiliation}</span>
                </div>
                <div className="flex justify-between items-start py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Campus Location</span>
                  <span className="text-slate-200 font-medium text-right max-w-[65%]">{profile.address}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Website / Domain</span>
                  <span className="text-indigo-300 font-mono font-medium">{profile.domain}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#94a3b8] font-medium">Institution Identifier</span>
                  <span className="text-slate-300 font-mono bg-white/5 px-2 py-0.5 rounded text-[11px] border border-white/5">{profile.institutionId}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Safety Administration */}
            <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                  <ShieldCheck size={17} className="text-indigo-400" />
                  <span>Safety Administration</span>
                </div>
                <span className="text-[11px] text-[#64748b] font-medium">Management &amp; Staff</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Safety Administrator</span>
                  <span className="text-slate-200 font-semibold text-right max-w-[65%] truncate">{profile.administrator}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Authorized Safety Staff</span>
                  <span className="text-slate-200 font-semibold">{profile.authorizedStaffCount} Admin Users</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Active Safety Zones</span>
                  <span className="text-emerald-400 font-semibold">{profile.safeZones} Configured Safe Zones</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[#94a3b8] font-medium">Active Alerts</span>
                  <span className="text-amber-300 font-semibold">{profile.activeAlerts} Active Alerts</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#94a3b8] font-medium">Last Safety Data Update</span>
                  <span className="text-slate-300 font-mono text-[11px]">{profile.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. CAMPUS SAFETY PROFILE (COMPACT KPI CARDS) ── */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Campus Safety Profile</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">Aggregated safety metrics across campus routes and monitored zones</p>
              </div>
              <span className="bg-indigo-500/10 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Aggregated Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Overall SafeScore */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Overall Safety Score</span>
                <div className="flex items-baseline gap-1 my-1.5">
                  <span className="text-2xl font-black text-indigo-300">{profile.safetyScore}</span>
                  <span className="text-xs text-[#94a3b8]">/ 100</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Relative Safety Assessment</span>
              </div>

              {/* Risk Level */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Risk Level</span>
                <span className="text-xl font-black text-amber-300 my-1.5">{profile.riskLevel}</span>
                <span className="text-[10px] text-slate-400 font-medium">Current Risk Assessment</span>
              </div>

              {/* Monitored Zones */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Monitored Zones</span>
                <span className="text-2xl font-black text-white my-1.5">{profile.monitoredZones}</span>
                <span className="text-[10px] text-slate-400 font-medium">Configured Geofences</span>
              </div>

              {/* Safe Zones */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Safe Zones</span>
                <span className="text-2xl font-black text-emerald-400 my-1.5">{profile.safeZones}</span>
                <span className="text-[10px] text-emerald-400/90 font-medium">Configured Safe Zones</span>
              </div>

              {/* Active Incidents */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Active Incidents</span>
                <span className="text-2xl font-black text-amber-400 my-1.5">{profile.activeIncidents}</span>
                <span className="text-[10px] text-slate-400 font-medium">Requires Attention</span>
              </div>

              {/* Active Alerts */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Active Alerts</span>
                <span className="text-2xl font-black text-rose-400 my-1.5">{profile.activeAlerts}</span>
                <span className="text-[10px] text-rose-300/90 font-medium">Active Notifications</span>
              </div>
            </div>

            {/* SafeScore Disclaimer */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#94a3b8]">
              <InfoIcon size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                SafeSphere uses route activity, incident reports, environmental conditions, accessibility, isolation, lighting and proximity to safe zones to estimate relative safety risk. SafeScore is an estimate and <strong className="text-slate-300 font-semibold">not a guarantee of safety</strong>.
              </p>
            </div>
          </div>

          {/* ── 4. SAFETY COVERAGE ── */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Safety Coverage</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">Safety intelligence coverage across the institution's configured area</p>
              </div>
              <span className="text-sm font-mono font-bold text-indigo-300">{profile.dataCoverage}% Coverage</span>
            </div>

            {/* Coverage Meter */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.dataCoverage}%` }}
                />
              </div>
              <p className="text-xs text-[#94a3b8]">
                <strong className="text-white font-semibold">{profile.dataCoverage}%</strong> of the institution's configured area currently has safety intelligence coverage.
              </p>
            </div>

            {/* Coverage Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-3 border-t border-white/5 text-xs">
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">Monitored Area</span>
                <span className="text-slate-200 font-semibold mt-0.5 block">{profile.totalArea}</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">Monitored Zones</span>
                <span className="text-slate-200 font-semibold mt-0.5 block">{profile.monitoredZones} Zones</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">Configured Safe Zones</span>
                <span className="text-emerald-400 font-semibold mt-0.5 block">{profile.safeZones} Hubs</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">High-Risk Sectors</span>
                <span className="text-amber-400 font-semibold mt-0.5 block">{profile.highRiskZones} Sectors</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">Insufficient Data</span>
                <span className="text-slate-400 font-semibold mt-0.5 block">{profile.insufficientDataZones} Sectors</span>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block uppercase font-bold">Last Data Refresh</span>
                <span className="text-indigo-300 font-medium mt-0.5 block truncate">{profile.lastRefresh}</span>
              </div>
            </div>
          </div>

          {/* ── 5. EMERGENCY RESOURCES (INFORMATIONAL ONLY) ── */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Resources</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">Configured local emergency resources for student and faculty reference</p>
              </div>
              <span className="text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full w-fit">
                Informational Reference (No Direct Municipal Dispatch)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
              {/* Campus Security Desk */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase block mb-1">Campus Security Desk</span>
                  <span className="text-white font-semibold text-xs block">Gate 1 Main Office</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">Direct Internal Ext.</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[#94a3b8] text-[10px]">On-Campus</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">Active Desk</span>
                </div>
              </div>

              {/* Emergency Assembly Point */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase block mb-1">Assembly Point</span>
                  <span className="text-white font-semibold text-xs block">Central Sports Grounds</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">Designated Open Field</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[#94a3b8] text-[10px]">On-Campus</span>
                  <span className="text-indigo-300 font-semibold text-[11px]">Primary Area</span>
                </div>
              </div>

              {/* Police Station */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase block mb-1">Police Station</span>
                  <span className="text-white font-semibold text-xs block">Rajouri Garden Station</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">West Delhi District</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[#94a3b8] text-[10px]">~450m</span>
                  <span className="text-slate-300 text-[11px]">Informational</span>
                </div>
              </div>

              {/* Hospital */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase block mb-1">Medical Hospital</span>
                  <span className="text-white font-semibold text-xs block">ESI PGIMSR Hospital</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">Emergency Care Unit</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[#94a3b8] text-[10px]">~1.2 km</span>
                  <span className="text-slate-300 text-[11px]">Informational</span>
                </div>
              </div>

              {/* Fire Station */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[#94a3b8] text-[10px] font-bold uppercase block mb-1">Fire &amp; Rescue</span>
                  <span className="text-white font-semibold text-xs block">Janakpuri Fire Division</span>
                  <span className="text-[#94a3b8] text-[11px] block mt-0.5">Station #14</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[#94a3b8] text-[10px]">~2.1 km</span>
                  <span className="text-slate-300 text-[11px]">Informational</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. DATA & PRIVACY ARCHITECTURE ── */}
          <div className="bg-[#121420] border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm pb-2.5 border-b border-white/10">
              <Lock size={16} className="text-indigo-400" />
              <span>Data &amp; Privacy Architecture</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Institutional data is access-controlled and role-restricted</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Individual journeys are anonymized for institutional analytics</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Institutional dashboards display aggregated safety intelligence</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Emergency actions require explicit user interaction in consumer app</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>SafeScore represents relative risk, not guaranteed safety</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#94a3b8]">
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Telemetry data is isolated within secure tenant partitions</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── EDIT INSTITUTION DETAILS MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 relative border border-white/15 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#121522' }}
          >
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Edit Institution Details</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#94a3b8] hover:text-white bg-transparent border-none cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#94a3b8] font-semibold block mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] font-semibold block mb-1">Institution Type</label>
                  <input
                    type="text"
                    required
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] font-semibold block mb-1">Domain</label>
                  <input
                    type="text"
                    required
                    value={editForm.domain}
                    onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                    className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] font-semibold block mb-1">Affiliation</label>
                <input
                  type="text"
                  required
                  value={editForm.affiliation}
                  onChange={e => setEditForm({ ...editForm, affiliation: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] font-semibold block mb-1">Campus Location / Address</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] font-semibold block mb-1">Safety Administrator Contact</label>
                <input
                  type="text"
                  required
                  value={editForm.administrator}
                  onChange={e => setEditForm({ ...editForm, administrator: e.target.value })}
                  className="w-full bg-[#1a1d2e] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#3730a3] hover:from-[#6366f1] hover:to-[#4338ca] text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
                >
                  <Save size={14} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
