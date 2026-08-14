import { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Radio,
  Filter, MapPin, Search, ChevronRight, Siren, CheckCircle, RefreshCw, Send
} from 'lucide-react';
import { InstitutionNav } from './InstitutionNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils';

interface SafetyAlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  status: 'active' | 'investigating' | 'resolved';
  timestamp: string;
  source: 'sos' | 'community' | 'automated';
  contactsNotified?: number;
}

const DEFAULT_SAFETY_ALERTS: SafetyAlertItem[] = [
  {
    id: 'ALT-101',
    title: '🚨 Emergency SOS Broadcast Triggered',
    message: 'User indicated distress on Outer Ring Road corridor. Nearest PCR Unit & 3 personal guardians alerted.',
    severity: 'critical',
    location: 'Outer Ring Road (North West Sector)',
    status: 'active',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    source: 'sos',
    contactsNotified: 3,
  },
  {
    id: 'ALT-102',
    title: '⚠️ Unlit Dark Zone & Hazard Reported',
    message: 'Multiple consecutive streetlights non-operational. Reduced SafeScore from 88 to 54 for evening pedestrian transit.',
    severity: 'medium',
    location: 'Subhash Nagar Service Lane',
    status: 'investigating',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    source: 'community',
  },
  {
    id: 'ALT-103',
    title: '👮 Enhanced Police Patrol Deployment',
    message: 'PCR Patrol Unit Alpha-1 assigned to high-density university corridor for scheduled night rounds.',
    severity: 'low',
    location: 'GTBIT Campus Perimeter & Metro Walkway',
    status: 'resolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    source: 'automated',
  },
  {
    id: 'ALT-104',
    title: '🚨 Route Deviation Distress Alarm',
    message: 'Corridor deviation detected with no check-in response within 3-minute safety window.',
    severity: 'high',
    location: 'Barakhamba Road Underpass',
    status: 'resolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    source: 'sos',
    contactsNotified: 2,
  },
];

export default function InstitutionAlertsPage() {
  const { user, isDemo } = useAuth();
  const [alerts, setAlerts] = useState<SafetyAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadAllAlerts = async () => {
    setLoading(true);

    // 1. Read from Supabase sos_incidents
    let dbAlerts: SafetyAlertItem[] = [];
    if (!isDemo && user?.id) {
      try {
        const { data } = await supabase
          .from('sos_incidents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          dbAlerts = data.map((d: any) => {
            const isSos = d.type?.includes('SOS') || d.type?.includes('Emergency') || d.type?.includes('Distress');
            const sev: 'critical' | 'high' | 'medium' | 'low' =
              isSos ? 'critical' :
              d.status?.includes('HIGH') ? 'high' :
              d.status?.includes('CRITICAL') ? 'critical' : 'medium';

            return {
              id: `#ALERT-${d.id.slice(0, 5).toUpperCase()}`,
              title: isSos ? '🚨 Emergency SOS Dispatched' : `⚠️ ${d.type || 'Safety Hazard'}`,
              message: d.resolved_by || `Incident logged near ${d.location_name || 'Delhi NCR'}`,
              severity: sev,
              location: d.location_name || 'Protected Safety Corridor',
              status: (d.status === 'Dispatched' || d.status === 'active') ? 'active' : 'investigating',
              timestamp: d.created_at,
              source: isSos ? 'sos' : 'community',
              contactsNotified: isSos ? 3 : undefined,
            };
          });
        }
      } catch (err) {
        console.warn('Error fetching Supabase alerts:', err);
      }
    }

    const activeUserKey = user?.id || (isDemo ? 'demo' : 'guest');

    // 2. Read from localStorage (reported hazards & SOS strictly for this user)
    let localHazards: any[] = [];
    try {
      const raw = localStorage.getItem(`safesphere_user_reported_incidents_${activeUserKey}`);
      if (raw) localHazards = JSON.parse(raw);
    } catch {}

    const localAlerts: SafetyAlertItem[] = localHazards.map((h: any) => ({
      id: `#HAZ-${h.id.slice(-4).toUpperCase()}`,
      title: `⚠️ ${h.type || 'Community Hazard Report'}`,
      message: h.description || 'Reported hazard impacting safe pedestrian transit score.',
      severity: h.severity || 'medium',
      location: h.address || 'Active Corridor',
      status: 'active',
      timestamp: h.created_at || new Date().toISOString(),
      source: 'community',
    }));

    // 3. Read latest SOS from localStorage strictly for this user
    let localSosAlert: SafetyAlertItem[] = [];
    try {
      const raw = localStorage.getItem(`safesphere_latest_sos_${activeUserKey}`);
      if (raw) {
        const s = JSON.parse(raw);
        localSosAlert = [{
          id: '#SOS-LIVE',
          title: '🚨 Emergency SOS Dispatch Broadcast',
          message: `User distress signal transmitted. Nearest Police Station & ${s.contacts_alerted || 3} emergency guardians alerted.`,
          severity: 'critical',
          location: s.location_name || 'Delhi Corridor',
          status: 'active',
          timestamp: s.created_at || new Date().toISOString(),
          source: 'sos',
          contactsNotified: s.contacts_alerted || 3,
        }];
      }
    } catch {}

    const merged = [
      ...localSosAlert,
      ...localAlerts,
      ...dbAlerts,
      ...(isDemo ? DEFAULT_SAFETY_ALERTS : []),
    ];

    // Deduplicate by ID
    const map = new Map<string, SafetyAlertItem>();
    merged.forEach(item => map.set(item.id, item));

    setAlerts(Array.from(map.values()));
    setLoading(false);
  };

  useEffect(() => {
    loadAllAlerts();
  }, [isDemo, user?.id]);

  const handleUpdateStatus = (id: string, nextStatus: 'active' | 'investigating' | 'resolved') => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    setSuccessToast(`Alert ${id} status updated to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity && a.status !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const severityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return { bg: 'bg-red-500/20 text-red-300 border-red-500/40', label: 'CRITICAL SOS' };
      case 'high':
        return { bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40', label: 'HIGH RISK' };
      case 'medium':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'HAZARD / LIGHTING' };
      default:
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'PATROL / ADVISORY' };
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: '● Active Broadcast' };
      case 'investigating':
        return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '● Investigating' };
      default:
        return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: '✓ Resolved' };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── Top Header Bar ── */}
        <div className="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Safety Alerts &amp; Dispatches
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
                <Radio size={12} className="animate-pulse text-red-400" />
                Live Monitoring Active
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time situational safety bulletins, automated SOS triggers, and community hazard telemetry.
            </p>
          </div>

          {/* Quick Refresh Action */}
          <button
            onClick={loadAllAlerts}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>

        {/* ── Filter Controls & Search ── */}
        <div className="mb-6 relative z-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by location, message, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#111522]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Severity Tabs */}
          <div className="flex gap-1.5 bg-[#111522]/90 border border-white/10 p-1 rounded-xl overflow-x-auto">
            {[
              { key: 'all', label: 'All Alerts' },
              { key: 'critical', label: '🔴 Critical SOS' },
              { key: 'medium', label: '⚠️ Hazards' },
              { key: 'active', label: 'Active' },
              { key: 'resolved', label: 'Resolved' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterSeverity(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${filterSeverity === tab.key ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Alerts Feed List ── */}
        <div className="flex flex-col gap-4 relative z-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs">Fetching real-time safety dispatches...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-[#111522]/80 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white">No Active Alerts Found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                All corridors and pedestrian transit segments currently operating within normal SafeScore thresholds.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const badge = severityBadge(alert.severity);
              const sBadge = statusBadge(alert.status);

              return (
                <div
                  key={alert.id}
                  className="bg-[#111522]/85 backdrop-blur-2xl border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col gap-3 group"
                >
                  {/* Top Row: Severity Badge + Time + Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {alert.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${sBadge.bg}`}>
                        {sBadge.label}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Alert Content */}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {/* Meta Details: Location & Contacts */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <MapPin size={14} className="text-indigo-400" />
                        {alert.location}
                      </span>

                      {alert.contactsNotified && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle size={12} />
                          {alert.contactsNotified} Guardians Alerted via SMS
                        </span>
                      )}
                    </div>

                    {/* Quick State Toggle Actions */}
                    <div className="flex items-center gap-2">
                      {alert.status !== 'investigating' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Mark Investigating
                        </button>
                      )}
                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Success Action Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}
      </main>
    </div>
  );
}
