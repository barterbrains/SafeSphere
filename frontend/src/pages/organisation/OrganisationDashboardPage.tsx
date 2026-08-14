import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, Bell, TrendingUp, Users, MapPin,
  ExternalLink, ChevronDown, CheckCircle2, AlertOctagon,
  Eye, Radio, Megaphone, HelpCircle, LogOut, ArrowRight,
  ShieldCheck, Layers, FileText, Settings, User, Activity,
  Search, Filter, Download, Calendar, Check, X, Clock,
  Smartphone, Share2, Compass, ArrowUpRight, BarChart2,
  Lock, RefreshCw, Sun, Moon, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── TYPES ──────────────────────────────────────────────────────────────────
interface IncidentItem {
  id: string;
  type: string;
  location: string;
  reporter: string;
  timestamp: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  impact: number;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  notes?: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'moderate' | 'resolved';
  status: 'active' | 'acknowledged' | 'dismissed';
}

interface JourneyItem {
  id: string;
  travelerId: string;
  route: string;
  safeScore: number;
  status: 'Active' | 'Completed' | 'Deviation Flagged' | 'Signal Lost';
  startTime: string;
  eta: string;
  distance: string;
}

export default function OrganisationDashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'heatmap' | 'incidents' | 'analytics' | 'alerts' | 'journeys' | 'reports' | 'profile' | 'settings'>('dashboard');

  // Emergency Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: 'Security Advisory: Reduced Lighting on Ring Road',
    severity: 'high',
    zone: 'Rajouri Garden Perimeter',
    message: 'Campus security patrols have been dispatched along the Ring Road corridor. Travelers are advised to use the Main Gate entrance.',
  });

  // Heatmap Tab state
  const [heatmapTime, setHeatmapTime] = useState<number>(22); // 10 PM
  const [heatmapLayers, setHeatmapLayers] = useState({
    low: true,
    moderate: true,
    elevated: true,
    high: true,
    safeZone: true,
  });
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<{
    name: string;
    score: number;
    risk: string;
    details: string;
    incidents: number;
    patrol: string;
  } | null>(null);

  // Incidents Tab state
  const [incidentSearch, setIncidentSearch] = useState('');
  const [incidentFilterType, setIncidentFilterType] = useState('All');
  const [incidentFilterStatus, setIncidentFilterStatus] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [incidentsList, setIncidentsList] = useState<IncidentItem[]>([
    {
      id: 'INC-2026-089',
      type: 'Harassment',
      location: 'Rajouri Garden Ring Road (Opposite Metro Pillar 382)',
      reporter: '#UG-8429 (Student)',
      timestamp: 'Today, 9:15 PM',
      status: 'Open',
      impact: -18,
      severity: 'High',
      description: 'Catcalling and verbal harassment by group near unlit service lane.',
      notes: 'Campus patrol dispatched. CCTV footage requested from Metro authority.',
    },
    {
      id: 'INC-2026-088',
      type: 'Suspicious Activity',
      location: 'Block C Rear Service Alley',
      reporter: '#ST-1092 (Staff)',
      timestamp: 'Today, 8:40 PM',
      status: 'Investigating',
      impact: -12,
      severity: 'Medium',
      description: 'Two unidentified individuals loitering near the boundary wall after library closing.',
      notes: 'Guard post 4 informed. Perimeter spotlight turned on.',
    },
    {
      id: 'INC-2026-087',
      type: 'Poor Lighting',
      location: 'TDI Mall Cross-link Pathway',
      reporter: '#UG-3312 (Student)',
      timestamp: 'Yesterday, 10:10 PM',
      status: 'Investigating',
      impact: -8,
      severity: 'Medium',
      description: '3 consecutive municipal sodium vapor lamps non-functional.',
      notes: 'PWD maintenance ticket #NDMC-8819 logged.',
    },
    {
      id: 'INC-2026-086',
      type: 'Traffic Hazard',
      location: 'Main Gate Junction Road 28',
      reporter: '#FC-0041 (Faculty)',
      timestamp: 'Yesterday, 6:30 PM',
      status: 'Resolved',
      impact: -6,
      severity: 'Low',
      description: 'Open drainage repair with inadequate reflective barriers during rush hour.',
      notes: 'Barricades deployed with amber flashing lights. Resolved.',
    },
    {
      id: 'INC-2026-085',
      type: 'Route Deviation',
      location: 'Mayapuri Flyover Underpass',
      reporter: '#UG-9921 (Student - Auto Guardian)',
      timestamp: '2 days ago, 11:05 PM',
      status: 'Resolved',
      impact: -15,
      severity: 'High',
      description: 'Automated Journey Guardian flagged 400m sudden off-corridor detour into unlit industrial zone.',
      notes: 'Traveler contacted via welfare ping. Auto-rickshaw driver took alternate route due to road work. Safe arrival confirmed.',
    },
    {
      id: 'INC-2026-084',
      type: 'Harassment',
      location: 'Metro Gate 4 - CP Corridor',
      reporter: '#UG-5501 (Student)',
      timestamp: '3 days ago, 7:20 PM',
      status: 'Resolved',
      impact: -14,
      severity: 'High',
      description: 'Aggressive following reported near subway exit.',
      notes: 'Security escort provided to hostel. Delhi Police PCR booth notified.',
    },
  ]);

  // Alerts Tab state
  const [alertsList, setAlertsList] = useState<AlertItem[]>([
    {
      id: 'ALT-101',
      title: 'High Risk Zone Detected',
      description: 'SafeScore dropped to 42 near Rajouri Garden Ring Road due to incident cluster and reduced lighting.',
      location: 'Rajouri Garden Ring Road',
      timestamp: '8 mins ago',
      severity: 'critical',
      status: 'active',
    },
    {
      id: 'ALT-102',
      title: 'Incident Cluster Detected',
      description: '3 incidents reported near Metro Gate 4 this week. Police patrol requested.',
      location: 'Rajiv Chowk Metro Gate 4, CP',
      timestamp: '21 mins ago',
      severity: 'high',
      status: 'active',
    },
    {
      id: 'ALT-103',
      title: 'Lighting Risk',
      description: 'Low-light conditions detected around Block B & C perimeter fence.',
      location: 'GTBIT Perimeter Zone',
      timestamp: '1 hr ago',
      severity: 'moderate',
      status: 'acknowledged',
    },
    {
      id: 'ALT-104',
      title: 'Risk Reduced',
      description: 'SafeScore improved by 9 points near Main Gate following extra security deployment.',
      location: 'GTBIT Main Gate',
      timestamp: '2 hrs ago',
      severity: 'resolved',
      status: 'acknowledged',
    },
  ]);

  // Analytics Tab state
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Journeys Tab state
  const [journeysList] = useState<JourneyItem[]>([
    {
      id: 'JRN-9401',
      travelerId: 'Traveler #UG-8821',
      route: 'Rajouri Garden Metro Gate 2 → GTBIT Gate 1',
      safeScore: 88,
      status: 'Active',
      startTime: '10:35 PM',
      eta: '4 mins remaining',
      distance: '1.2 km',
    },
    {
      id: 'JRN-9402',
      travelerId: 'Traveler #ST-1104',
      route: 'Subhash Nagar Metro → GTBIT Library Block',
      safeScore: 72,
      status: 'Active',
      startTime: '10:30 PM',
      eta: '8 mins remaining',
      distance: '1.8 km',
    },
    {
      id: 'JRN-9403',
      travelerId: 'Traveler #UG-4419',
      route: 'TDI Paragon Mall → Girls Hostel Block A',
      safeScore: 42,
      status: 'Deviation Flagged',
      startTime: '10:20 PM',
      eta: 'Off corridor +350m',
      distance: '0.9 km',
    },
    {
      id: 'JRN-9400',
      travelerId: 'Traveler #UG-6623',
      route: 'Tagore Garden → GTBIT Main Campus',
      safeScore: 84,
      status: 'Completed',
      startTime: '9:45 PM',
      eta: 'Completed (14m)',
      distance: '1.6 km',
    },
    {
      id: 'JRN-9399',
      travelerId: 'Traveler #FC-0812',
      route: 'Rajouri Garden Ring Road → Staff Quarters',
      safeScore: 78,
      status: 'Completed',
      startTime: '9:15 PM',
      eta: 'Completed (18m)',
      distance: '2.1 km',
    },
  ]);

  // Settings Tab state
  const [settingsState, setSettingsState] = useState({
    criticalThreshold: 40,
    highRiskThreshold: 55,
    autoBroadcastSos: true,
    smsAlerts: true,
    emailDailyDigest: true,
    demoModeActive: true,
    anonymizationDays: 30,
    kAnonymity: 5,
  });

  // Map refs for Dashboard and Full Heatmap
  const dashboardMapRef = useRef<HTMLDivElement>(null);
  const dashboardMapInstance = useRef<L.Map | null>(null);

  const heatmapMapRef = useRef<HTMLDivElement>(null);
  const heatmapMapInstance = useRef<L.Map | null>(null);

  const GTBIT_COORDS: [number, number] = [28.6508, 77.1235];

  // Initialize Dashboard Map
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    if (!dashboardMapRef.current) return;
    if (dashboardMapInstance.current) {
      dashboardMapInstance.current.invalidateSize();
      return;
    }

    const map = L.map(dashboardMapRef.current, {
      center: GTBIT_COORDS,
      zoom: 14.5,
      zoomControl: true,
      attributionControl: false,
    });

    dashboardMapInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Heat zones
    L.circle([28.6475, 77.1210], { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, radius: 400, weight: 1.5 }).addTo(map);
    L.circle([28.6540, 77.1265], { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.3, radius: 350, weight: 1.5 }).addTo(map);
    L.circle([28.6515, 77.1180], { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.25, radius: 300, weight: 1 }).addTo(map);
    L.circle(GTBIT_COORDS, { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, radius: 250, weight: 1.5 }).addTo(map);

    const gtbitIcon = L.divIcon({
      className: 'custom-gtbit-icon',
      html: `
        <div style="background: linear-gradient(135deg, #3730a3, #4f46e5); color: white; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.6); border: 1.5px solid #818cf8; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>🏢</span><span>GTBIT</span>
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    });
    L.marker(GTBIT_COORDS, { icon: gtbitIcon }).addTo(map);

    const safePoints: [number, number][] = [
      [28.6545, 77.1215], [28.6480, 77.1270], [28.6530, 77.1290],
      [28.6465, 77.1190], [28.6560, 77.1250], [28.6510, 77.1320],
    ];
    safePoints.forEach(pt => {
      const shieldIcon = L.divIcon({
        className: 'safe-zone-shield-icon',
        html: `<div style="width: 26px; height: 26px; border-radius: 50%; background: #312e81; border: 1.5px solid #818cf8; box-shadow: 0 0 10px rgba(129, 140, 248, 0.6); display: flex; align-items: center; justify-content: center; color: #c7d2fe; font-size: 12px;">🛡️</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker(pt, { icon: shieldIcon }).addTo(map);
    });

    return () => {
      // Keep instance cached
    };
  }, [activeTab]);

  // Initialize Heatmap Tab Full Map
  useEffect(() => {
    if (activeTab !== 'heatmap') return;
    if (!heatmapMapRef.current) return;
    if (heatmapMapInstance.current) {
      heatmapMapInstance.current.invalidateSize();
      return;
    }

    const map = L.map(heatmapMapRef.current, {
      center: GTBIT_COORDS,
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    heatmapMapInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Interactive clickable risk zones
    const zoneHigh = L.circle([28.6475, 77.1210], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: heatmapTime >= 20 || heatmapTime <= 5 ? 0.45 : 0.25,
      radius: heatmapTime >= 20 ? 480 : 380,
      weight: 2,
    }).addTo(map);

    zoneHigh.on('click', () => {
      setSelectedZoneInfo({
        name: 'Rajouri Garden Ring Road Corridor',
        score: 42,
        risk: 'High Risk (Critical)',
        details: '3 active incidents reported this week. Reduced nighttime lighting from PWD pillar 380 to 410. Low police patrol frequency between 10 PM and 4 AM.',
        incidents: 3,
        patrol: '1 Mobile PCR Unit / 45 min interval',
      });
    });

    const zoneElevated = L.circle([28.6540, 77.1265], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.35,
      radius: 360,
      weight: 1.5,
    }).addTo(map);

    zoneElevated.on('click', () => {
      setSelectedZoneInfo({
        name: 'Metro Gate 4 - CP Transit Corridor',
        score: 48,
        risk: 'Elevated Risk',
        details: 'High pedestrian density at peak rush, followed by abrupt drop in foot traffic post 9:30 PM. Isolated subway underpass.',
        incidents: 2,
        patrol: 'Fixed booth at metro gate',
      });
    });

    const zoneModerate = L.circle([28.6515, 77.1180], {
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.3,
      radius: 320,
      weight: 1.5,
    }).addTo(map);

    zoneModerate.on('click', () => {
      setSelectedZoneInfo({
        name: 'Block C Rear Service Lane',
        score: 55,
        risk: 'Moderate Risk',
        details: 'Narrow commercial cut-through with intermittent lighting. 1 suspicious loitering report under investigation.',
        incidents: 1,
        patrol: 'Campus guard round every 30 mins',
      });
    });

    const zoneSafe = L.circle(GTBIT_COORDS, {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.25,
      radius: 300,
      weight: 2,
    }).addTo(map);

    zoneSafe.on('click', () => {
      setSelectedZoneInfo({
        name: 'GTBIT Campus Core Safe Zone',
        score: 92,
        risk: 'Verified Safe Zone',
        details: '24/7 guarded access gates, continuous LED floodlighting, high-definition CCTV coverage, emergency distress intercom active.',
        incidents: 0,
        patrol: 'Continuous on-campus patrol',
      });
    });

    // Marker
    const gtbitIcon = L.divIcon({
      className: 'custom-gtbit-icon',
      html: `
        <div style="background: linear-gradient(135deg, #3730a3, #4f46e5); color: white; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.6); border: 1.5px solid #818cf8; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>🏢</span><span>GTBIT Center</span>
        </div>
      `,
      iconSize: [90, 30],
      iconAnchor: [45, 15],
    });
    L.marker(GTBIT_COORDS, { icon: gtbitIcon }).addTo(map);

  }, [activeTab, heatmapTime]);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
    }, 1600);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const handleDismissAlert = (id: string) => {
    setAlertsList(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: 'Open' | 'Investigating' | 'Resolved') => {
    setIncidentsList(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a12] text-[#f1f5f9] font-['Inter',sans-serif] overflow-hidden">
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="w-[250px] h-full bg-[#0d0d18] border-r border-white/10 flex flex-col justify-between shrink-0 select-none z-30">
        <div>
          {/* Brand Header */}
          <div
            onClick={() => navigate('/')}
            className="p-4 flex items-center gap-3 cursor-pointer group border-b border-white/5"
            title="Return to SafeSphere Public"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3730a3] border border-[#818cf8]/40 shadow-[0_0_16px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-white tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
                SafeSphere
              </h1>
              <p className="text-[10px] font-semibold text-[#818cf8] tracking-wider uppercase mt-1">
                Institutional Command
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Layers size={17} /> },
              { id: 'heatmap', label: 'Safety Heatmap', icon: <Activity size={17} /> },
              { id: 'incidents', label: 'Incidents', icon: <Shield size={17} /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={17} /> },
              { id: 'alerts', label: 'Alerts', icon: <Bell size={17} /> },
              { id: 'journeys', label: 'Journeys', icon: <Compass size={17} /> },
              { id: 'reports', label: 'Reports', icon: <FileText size={17} /> },
              { id: 'profile', label: 'Profile', icon: <User size={17} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer border-none text-left ${
                    active
                      ? 'bg-gradient-to-r from-[#4f46e5] to-[#3730a3] text-white font-bold shadow-[0_4px_14px_rgba(79,70,229,0.4)]'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04] bg-transparent'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-[#818cf8]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Area */}
        <div className="p-3 space-y-2.5 border-t border-white/5 bg-[#090912]/90">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold text-[12px] py-2.5 px-3 rounded-xl shadow-[0_4px_16px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-400/30"
          >
            <Megaphone size={15} />
            <span>Broadcast Campus Alert</span>
          </button>

          <div className="space-y-0.5 pt-0.5">
            <button
              onClick={() => alert('Campus Security Control Room Help Desk: (011) 2812-4000\nSupport: admin@gtbit.edu.in')}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#94a3b8] hover:text-white text-xs font-medium bg-transparent hover:bg-white/[0.03] transition-colors cursor-pointer border-none"
            >
              <HelpCircle size={14} className="text-[#818cf8]" />
              <span>Help Desk</span>
            </button>
            <button
              onClick={() => {
                signOut();
                navigate('/organisation/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#94a3b8] hover:text-red-300 text-xs font-medium bg-transparent hover:bg-red-500/10 transition-colors cursor-pointer border-none"
            >
              <LogOut size={14} className="text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Institution Demo Badge */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5 flex flex-col gap-1">
            <div className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider">Institution</div>
            <div className="text-xs font-bold text-white truncate">GTBIT, Rajouri Garden</div>
            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full w-fit mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Demo Mode
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto bg-[#07070f] p-6 flex flex-col gap-5">
        {/* Top GTBIT Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/15 p-1 flex items-center justify-center shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-400/40 flex items-center justify-center text-indigo-200 font-extrabold text-sm">
                🛡️
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Guru Tegh Bahadur Institute of Technology (GTBIT)
              </h1>
              <p className="text-xs text-[#94a3b8] font-medium">
                Rajouri Garden, New Delhi
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="self-start md:self-auto bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>View Institution Profile</span>
            <ArrowRight size={13} />
          </button>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: DASHBOARD (Overview)                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 pt-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Institutional Safety Overview
                </h2>
                <p className="text-xs text-[#94a3b8]">
                  Real-time aggregated safety intelligence across campus and surrounding areas.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] font-medium">
                <span>📅 Last updated: Today, 10:42 PM</span>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* 6 KPI Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">Total Journeys (Today)</span>
                  <Activity size={16} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">1,248</div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-1">+12% vs yesterday</div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">Average SafeScore</span>
                  <ShieldCheck size={16} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">
                    76 <span className="text-xs font-normal text-[#94a3b8]">/100</span>
                  </div>
                  <div className="text-[10px] font-bold text-indigo-400 mt-1">Moderate Risk</div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">Active Incidents</span>
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">3</div>
                  <div className="text-[10px] font-bold text-red-400 mt-1">Requires Attention</div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">High Risk Zones</span>
                  <AlertOctagon size={16} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">2</div>
                  <div className="text-[10px] font-bold text-amber-400 mt-1">Critical Areas</div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">Active Alerts</span>
                  <Bell size={16} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">2</div>
                  <div className="text-[10px] font-bold text-yellow-400 mt-1">Campus Notifications</div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#94a3b8]">Safe Zones</span>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">18</div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-1">Active &amp; Verified</div>
                </div>
              </div>
            </section>

            {/* Middle Row: Campus Safety Map & Recent Alerts */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 bg-[#10101d] border border-white/10 rounded-2xl p-4 flex flex-col shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-white">Campus Safety Map</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#cbd5e1]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low Risk</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Moderate</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Elevated</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High Risk</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Safe Zone</span>
                  </div>
                </div>

                <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-white/10 bg-[#07070f]">
                  <div ref={dashboardMapRef} className="w-full h-full" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-[#94a3b8] z-[400] pointer-events-none">
                    © OpenStreetMap contributors
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#10101d] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Recent Safety Alerts</h3>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-around">
                  {alertsList.slice(0, 4).map(alert => (
                    <div key={alert.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500 animate-ping' : alert.severity === 'high' ? 'bg-orange-400' : alert.severity === 'moderate' ? 'bg-yellow-400' : 'bg-emerald-400'} shrink-0`} />
                          <span className="text-xs font-bold text-white">{alert.title}</span>
                        </div>
                        <span className="text-[10px] text-[#64748b]">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#94a3b8] mb-1.5 leading-snug">{alert.description}</p>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold">
                        <MapPin size={11} />
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom Row: 3 Analytics Breakdown Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white">Incident Summary (This Week)</h3>
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    View All
                  </button>
                </div>

                <div className="flex items-center gap-4 my-auto">
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="29 88" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4.5" strokeDasharray="22 88" strokeDashoffset="-29" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="15 88" strokeDashoffset="-51" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="15 88" strokeDashoffset="-66" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="7 88" strokeDashoffset="-81" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black text-white leading-none">12</span>
                      <span className="text-[8px] uppercase tracking-wider text-[#94a3b8] font-bold">Total</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-red-500" /> Harassment</span>
                      <span className="font-bold text-white">4 <span className="text-[#64748b] font-normal text-[10px]">33%</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-orange-500" /> Suspicious Activity</span>
                      <span className="font-bold text-white">3 <span className="text-[#64748b] font-normal text-[10px]">25%</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Poor Lighting</span>
                      <span className="font-bold text-white">2 <span className="text-[#64748b] font-normal text-[10px]">17%</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-blue-500" /> Traffic Hazard</span>
                      <span className="font-bold text-white">2 <span className="text-[#64748b] font-normal text-[10px]">17%</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Others</span>
                      <span className="font-bold text-white">1 <span className="text-[#64748b] font-normal text-[10px]">8%</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white">SafeScore Trend</h3>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">7-Day Trend</span>
                </div>

                <div className="flex items-center justify-between gap-2 my-auto">
                  <div className="flex-1 h-28 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 160 80">
                      <line x1="0" y1="10" x2="160" y2="10" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                      <line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                      <line x1="0" y1="60" x2="160" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                      <defs>
                        <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 5,38 Q 30,42 55,32 T 105,45 T 130,22 T 155,18 L 155,75 L 5,75 Z" fill="url(#scoreTrendGrad)" />
                      <path d="M 5,38 Q 30,42 55,32 T 105,45 T 130,22 T 155,18" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
                      {[[5, 38], [30, 41], [55, 32], [80, 48], [105, 45], [130, 22], [155, 18]].map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[8px] text-[#64748b] font-semibold mt-1">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0 border-l border-white/5">
                    <div className="text-3xl font-black text-indigo-400">76</div>
                    <div className="text-[10px] text-[#94a3b8] font-bold">Current</div>
                    <div className="text-[10px] font-bold text-emerald-400 mt-1">+6 vs last week</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white">Top High Risk Locations</h3>
                  <button
                    onClick={() => setActiveTab('heatmap')}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { rank: 1, name: 'Rajouri Garden Ring Road', score: 42, color: 'bg-red-500/20 text-red-300 border-red-500/40' },
                    { rank: 2, name: 'Metro Gate 4 - CP Corridor', score: 48, color: 'bg-red-500/20 text-red-300 border-red-500/40' },
                    { rank: 3, name: 'Block C Rear Side', score: 55, color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
                    { rank: 4, name: 'TDI Mall Road Stretch', score: 60, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
                    { rank: 5, name: 'Mayapuri Industrial Area Link', score: 62, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
                  ].map(loc => (
                    <div key={loc.rank} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-none">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[11px] font-bold text-[#64748b] w-3">{loc.rank}</span>
                        <span className="text-white font-medium truncate text-[11px]">{loc.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${loc.color}`}>
                        {loc.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SAFETY HEATMAP (Full City / Perimeter View)             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'heatmap' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Top Bar with Time Slider & Layer Toggles */}
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" />
                  <span>City &amp; Campus Perimeter Safety Heatmap</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">
                  Click any risk polygon to inspect live telemetry, patrol frequency, and lighting factors.
                </p>
              </div>

              {/* Time of Day Slider */}
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl">
                {heatmapTime >= 19 || heatmapTime <= 5 ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Simulated Time: <strong className="text-white">{heatmapTime.toString().padStart(2, '0')}:00 {heatmapTime >= 12 ? 'PM' : 'AM'}</strong>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={heatmapTime}
                    onChange={e => setHeatmapTime(parseInt(e.target.value))}
                    className="w-36 accent-indigo-500 cursor-pointer h-1.5 bg-white/20 rounded-lg mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Main Map Container + Inspector Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px]">
              {/* Left: Expansive Heatmap Map */}
              <div className={`${selectedZoneInfo ? 'lg:col-span-8' : 'lg:col-span-12'} bg-[#10101d] border border-white/10 rounded-2xl overflow-hidden relative shadow-lg transition-all`}>
                <div ref={heatmapMapRef} className="w-full h-full" />

                {/* Floating Map Legend Overlay */}
                <div className="absolute top-4 left-4 z-[400] bg-[#0d0d18]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg flex flex-col gap-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">Perimeter Filters</span>
                  <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                    <input type="checkbox" checked={heatmapLayers.high} onChange={e => setHeatmapLayers({ ...heatmapLayers, high: e.target.checked })} className="accent-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Risk (&lt;45)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                    <input type="checkbox" checked={heatmapLayers.elevated} onChange={e => setHeatmapLayers({ ...heatmapLayers, elevated: e.target.checked })} className="accent-orange-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Elevated (45–60)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                    <input type="checkbox" checked={heatmapLayers.moderate} onChange={e => setHeatmapLayers({ ...heatmapLayers, moderate: e.target.checked })} className="accent-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate (60–75)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                    <input type="checkbox" checked={heatmapLayers.safeZone} onChange={e => setHeatmapLayers({ ...heatmapLayers, safeZone: e.target.checked })} className="accent-emerald-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Verified Safe Zone
                  </label>
                </div>
              </div>

              {/* Right: Zone Inspector Drawer (when clicked) */}
              {selectedZoneInfo && (
                <div className="lg:col-span-4 bg-[#10101d] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl animate-in slide-in-from-right duration-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Zone Telemetry</span>
                        <h3 className="text-base font-bold text-white leading-tight mt-0.5">{selectedZoneInfo.name}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedZoneInfo(null)}
                        className="text-[#94a3b8] hover:text-white text-sm bg-transparent border-none cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-3">
                      <div>
                        <span className="text-[10px] text-[#94a3b8] block">Corridor SafeScore</span>
                        <span className="text-2xl font-black text-white">{selectedZoneInfo.score} <span className="text-xs text-[#94a3b8]">/100</span></span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${selectedZoneInfo.score < 50 ? 'bg-red-500/20 text-red-300 border-red-500/40' : selectedZoneInfo.score < 75 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                        {selectedZoneInfo.risk}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Risk Factor Analysis</span>
                      <p className="text-[#cbd5e1] leading-relaxed bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        {selectedZoneInfo.details}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-[#94a3b8] block">7-Day Incidents</span>
                        <span className="text-lg font-bold text-white">{selectedZoneInfo.incidents}</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-[#94a3b8] block">Patrol Status</span>
                        <span className="text-xs font-semibold text-indigo-300">{selectedZoneInfo.patrol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => {
                        setBroadcastData({
                          ...broadcastData,
                          zone: selectedZoneInfo.name,
                          title: `Safety Notice: ${selectedZoneInfo.name}`,
                        });
                        setShowBroadcastModal(true);
                      }}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Megaphone size={14} />
                      <span>Alert Travelers in Zone</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: INCIDENTS MANAGEMENT                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'incidents' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search incidents by location, ID, or type..."
                  value={incidentSearch}
                  onChange={e => setIncidentSearch(e.target.value)}
                  className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <select
                  value={incidentFilterType}
                  onChange={e => setIncidentFilterType(e.target.value)}
                  className="bg-[#1b1e2c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Poor Lighting">Poor Lighting</option>
                  <option value="Traffic Hazard">Traffic Hazard</option>
                  <option value="Route Deviation">Route Deviation</option>
                </select>

                <select
                  value={incidentFilterStatus}
                  onChange={e => setIncidentFilterStatus(e.target.value)}
                  className="bg-[#1b1e2c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-[#10101d] border border-white/10 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-[#94a3b8] uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Incident ID</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Reporter (Anonymized)</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Impact</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
                  {incidentsList
                    .filter(inc => incidentFilterType === 'All' || inc.type === incidentFilterType)
                    .filter(inc => incidentFilterStatus === 'All' || inc.status === incidentFilterStatus)
                    .filter(inc => incidentSearch === '' || inc.location.toLowerCase().includes(incidentSearch.toLowerCase()) || inc.id.toLowerCase().includes(incidentSearch.toLowerCase()) || inc.type.toLowerCase().includes(incidentSearch.toLowerCase()))
                    .map(inc => (
                      <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-300">{inc.id}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${inc.severity === 'High' ? 'bg-red-500/20 text-red-300' : inc.severity === 'Medium' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {inc.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white max-w-xs truncate">{inc.location}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#94a3b8]">{inc.reporter}</td>
                        <td className="py-3 px-4 text-[#94a3b8]">{inc.timestamp}</td>
                        <td className="py-3 px-4 font-bold text-red-400">{inc.impact} pts</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inc.status === 'Open' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : inc.status === 'Investigating' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedIncident(inc)}
                            className="bg-white/5 hover:bg-white/10 text-indigo-300 text-xs px-3 py-1 rounded-lg transition-colors border border-white/10 cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Incident Inspection Modal */}
            {selectedIncident && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#12141f] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{selectedIncident.id}</span>
                      <h3 className="text-base font-bold text-white">{selectedIncident.type}</h3>
                    </div>
                    <button onClick={() => setSelectedIncident(null)} className="text-[#94a3b8] hover:text-white cursor-pointer bg-transparent border-none text-base">✕</button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-0.5">Location &amp; Reporter</span>
                      <p className="text-white font-medium">{selectedIncident.location}</p>
                      <p className="text-[11px] text-indigo-300 font-mono mt-0.5">{selectedIncident.reporter} · {selectedIncident.timestamp}</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">Incident Report Description</span>
                      <p className="text-white leading-relaxed">{selectedIncident.description}</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl">
                      <span className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">Security Dispatch &amp; Resolution Notes</span>
                      <p className="text-[#cbd5e1] leading-relaxed">{selectedIncident.notes}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-[#94a3b8]">Update Incident State:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'Investigating')}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 font-semibold cursor-pointer"
                        >
                          Mark Investigating
                        </button>
                        <button
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'Resolved')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/40 font-semibold cursor-pointer"
                        >
                          Resolve &amp; Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: ADVANCED RISK ANALYTICS                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Range Toggle Header */}
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-400" />
                  <span>Institutional Risk &amp; Corridor Safety Analytics</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">30-Day and 90-Day longitudinal safety performance indicators</p>
              </div>

              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
                {(['7d', '30d', '90d', '1y'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setAnalyticsRange(range)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer border-none ${analyticsRange === range ? 'bg-indigo-600 text-white' : 'text-[#94a3b8] hover:text-white bg-transparent'}`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Comparison Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5">
                <span className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-wider block mb-1">Campus SafeScore vs Benchmark</span>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-black text-indigo-400">76</span>
                  <span className="text-xs text-[#94a3b8]">vs <strong>68</strong> (West Delhi Avg)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-indigo-500 h-full" style={{ width: '76%' }} />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block mt-2">+11.7% above regional average</span>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5">
                <span className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-wider block mb-1">Average SOS Response Time</span>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-black text-emerald-400">4.2m</span>
                  <span className="text-xs text-[#94a3b8]">target: &lt; 5.0 min</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block mt-2">100% dispatch adherence within 6 mins</span>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5">
                <span className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-wider block mb-1">Total Safe Transit Volume</span>
                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-3xl font-black text-white">38,410</span>
                  <span className="text-xs text-[#94a3b8]">journeys monitored</span>
                </div>
                <span className="text-[10px] text-indigo-300 font-bold block mt-2">99.8% safe completion rate</span>
              </div>
            </div>

            {/* Peak Risk Hours & Heat Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Peak Transit Volume by Time of Day</h3>
                <div className="h-48 flex items-end gap-2 pt-4">
                  {[
                    { time: '6 AM', vol: 20 },
                    { time: '8 AM', vol: 85 },
                    { time: '10 AM', vol: 95 },
                    { time: '12 PM', vol: 60 },
                    { time: '2 PM', vol: 50 },
                    { time: '4 PM', vol: 80 },
                    { time: '6 PM', vol: 90 },
                    { time: '8 PM', vol: 70 },
                    { time: '10 PM', vol: 35 },
                    { time: '12 AM', vol: 15 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t transition-all hover:brightness-125"
                        style={{ height: `${bar.vol}%` }}
                      />
                      <span className="text-[9px] text-[#64748b] font-semibold">{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Perimeter Zone Comparative Safety</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { zone: 'Main Entrance & Metro Link', score: 88, status: 'Safe Corridor' },
                    { zone: 'Sports Ground & Boundary Wall', score: 74, status: 'Moderate' },
                    { zone: 'Hostel Block A-D Linkway', score: 82, status: 'Safe Corridor' },
                    { zone: 'Rajouri Garden Ring Road Edge', score: 42, status: 'High Risk' },
                    { zone: 'Mayapuri Industrial Connection', score: 60, status: 'Elevated Caution' },
                  ].map(z => (
                    <div key={z.zone} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{z.zone}</span>
                        <span className="font-bold text-indigo-400">{z.score}/100</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${z.score < 50 ? 'bg-red-500' : z.score < 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${z.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: ALERTS MANAGEMENT                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'alerts' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell size={18} className="text-yellow-400" />
                  <span>Campus Safety Alerts &amp; Advisory Queue</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Live system-generated alerts and manual dispatch triggers</p>
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Megaphone size={14} />
                <span>Issue New Advisory</span>
              </button>
            </div>

            <div className="space-y-3">
              {alertsList.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-[#10101d] border rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.severity === 'critical'
                      ? 'border-red-500/40 bg-red-500/[0.02]'
                      : alert.severity === 'high'
                      ? 'border-orange-500/40'
                      : 'border-white/10'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-500 animate-ping' : alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-400'}`} />
                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <span className="text-[10px] text-[#64748b]">• {alert.timestamp}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${alert.status === 'acknowledged' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] max-w-2xl">{alert.description}</p>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-semibold">
                      <MapPin size={12} />
                      <span>{alert.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 6: JOURNEYS MONITORING                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'journeys' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass size={18} className="text-indigo-400" />
                  <span>Live Journey Guardian &amp; Fleet Monitor</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Live GPS telemetry across campus perimeter with anomaly detection</p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>14 Active Journeys in Geofence</span>
              </div>
            </div>

            <div className="bg-[#10101d] border border-white/10 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-[#94a3b8] uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Journey ID</th>
                    <th className="py-3.5 px-4">Traveler (Anonymized)</th>
                    <th className="py-3.5 px-4">Route Path</th>
                    <th className="py-3.5 px-4">SafeScore</th>
                    <th className="py-3.5 px-4">Distance</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">ETA / Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
                  {journeysList.map(jrn => (
                    <tr key={jrn.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">{jrn.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{jrn.travelerId}</td>
                      <td className="py-3 px-4 text-[#cbd5e1]">{jrn.route}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${jrn.safeScore < 50 ? 'text-red-400' : 'text-indigo-400'}`}>
                          {jrn.safeScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#94a3b8]">{jrn.distance}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${jrn.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : jrn.status === 'Deviation Flagged' ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-white/10 text-[#94a3b8]'}`}>
                          {jrn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#94a3b8]">{jrn.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 7: REPORTS & COMPLIANCE                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-400" />
                  <span>Institutional Safety Audits &amp; Compliance Reports</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Export official safety digests compliant with DPDP Act 2023 &amp; UGC guidelines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'Weekly Executive Safety Digest',
                  period: 'Aug 07 – Aug 14, 2026',
                  desc: 'Comprehensive summary of SafeScore shifts, peak risk hours, and 12 reported incidents.',
                  type: 'PDF · 2.4 MB',
                },
                {
                  title: 'Monthly Infrastructure Lighting Audit',
                  period: 'July 2026 Comprehensive',
                  desc: 'Detailed breakdown of dark-spot corridors for municipal PWD submission and budget allocation.',
                  type: 'CSV + PDF · 4.8 MB',
                },
                {
                  title: 'Campus POSH & Safety Compliance Log',
                  period: 'Q2 2026 Institutional Audit',
                  desc: 'Certified anonymized incident resolution logs and emergency dispatch response time verification.',
                  type: 'Encrypted PDF · 1.9 MB',
                },
              ].map((rep, i) => (
                <div key={i} className="bg-[#10101d] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <FileText size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{rep.type}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{rep.title}</h3>
                    <span className="text-[11px] text-indigo-300 font-mono block">{rep.period}</span>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{rep.desc}</p>
                  </div>

                  <button
                    onClick={() => alert(`Downloading ${rep.title}... (Simulated download)`)}
                    className="mt-4 w-full bg-white/[0.04] hover:bg-indigo-600/20 border border-white/15 hover:border-indigo-500/40 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Report</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 8: INSTITUTION PROFILE                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-900/40 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-lg">
                    🛡️
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Guru Tegh Bahadur Institute of Technology</h2>
                    <p className="text-xs text-[#94a3b8]">GGSIPU Affiliated · AISHE Code: C-32890</p>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full mt-1.5">
                      <CheckCircle2 size={12} />
                      Verified Institutional Entity
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert('Profile update request submitted to SafeSphere Enterprise.')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Registered Campus HQ</span>
                    <p className="text-white font-medium mt-0.5">G-8 Area, Rajouri Garden, New Delhi, Delhi 110064</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Institutional Domain Scope</span>
                    <p className="text-indigo-300 font-mono mt-0.5">gtbit.edu.in (SSO Enabled)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Campus Geofence Radius</span>
                    <p className="text-white font-medium mt-0.5">1.4 km² (Perimeter buffer: 400m)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Security Operations Lead</span>
                    <p className="text-white font-medium mt-0.5">Commander Vikram Singh (Chief Security Officer)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">24/7 Control Room Hotline</span>
                    <p className="text-emerald-400 font-mono mt-0.5">+91 (11) 2812-4000</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Enterprise Subscription Status</span>
                    <p className="text-white font-medium mt-0.5">Institutional Command Suite · Valid till Dec 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 9: SETTINGS & POLICIES                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-[#10101d] border border-white/10 rounded-2xl p-6 shadow-md space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings size={18} className="text-indigo-400" />
                  <span>Institutional Command Configurations</span>
                </h2>
                <p className="text-xs text-[#94a3b8]">Custom safety score thresholds, notification channels, and privacy policies</p>
              </div>

              {/* Threshold Sliders */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Automated Risk Thresholds</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Critical Risk Alert Trigger</span>
                      <span className="font-bold text-red-400">&lt; {settingsState.criticalThreshold} / 100</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={50}
                      value={settingsState.criticalThreshold}
                      onChange={e => setSettingsState({ ...settingsState, criticalThreshold: parseInt(e.target.value) })}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-[#94a3b8]">Auto-notifies campus security when a corridor drops below this SafeScore.</p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Elevated Caution Advisory Trigger</span>
                      <span className="font-bold text-amber-400">&lt; {settingsState.highRiskThreshold} / 100</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={70}
                      value={settingsState.highRiskThreshold}
                      onChange={e => setSettingsState({ ...settingsState, highRiskThreshold: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-[#94a3b8]">Flags yellow advisory on student route analysis interface.</p>
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Dispatch Notification Channels</h3>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-semibold block">SMS Alert to Security Patrol Vehicles</span>
                      <span className="text-[11px] text-[#94a3b8]">Direct dispatch SMS to roaming guard squads on SOS trigger</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsState.smsAlerts}
                      onChange={e => setSettingsState({ ...settingsState, smsAlerts: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-white font-semibold block">Daily 8:00 AM Safety Digest Email</span>
                      <span className="text-[11px] text-[#94a3b8]">Automated executive summary sent to campus safety committee</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsState.emailDailyDigest}
                      onChange={e => setSettingsState({ ...settingsState, emailDailyDigest: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => alert('Settings successfully updated and applied.')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER DISCLAIMER BAR ────────────────────────────────────── */}
        <footer className="mt-auto pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748b] gap-2">
          <div className="flex items-center gap-2 text-left">
            <span className="text-indigo-400 font-bold text-sm">ⓘ</span>
            <span>
              SafeSphere provides decision support by estimating relative safety risk. It is not a guarantee of safety. Data is aggregated and anonymized for institutional use.
            </span>
          </div>

          <a
            href="/#safescore"
            className="text-indigo-400 hover:text-indigo-300 font-semibold whitespace-nowrap flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>Learn more about SafeScore</span>
            <ExternalLink size={12} />
          </a>
        </footer>
      </main>

      {/* ── BROADCAST CAMPUS ALERT MODAL ──────────────────────────────── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12141f] border border-red-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Emergency Campus Alert</h3>
                  <p className="text-[11px] text-[#94a3b8]">Dispatches instant push alerts to registered campus travelers</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-[#94a3b8] hover:text-white text-lg font-bold cursor-pointer bg-transparent border-none"
              >
                ×
              </button>
            </div>

            {broadcastSent ? (
              <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95">
                <CheckCircle2 size={48} className="text-emerald-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">Alert Dispatched Successfully</h4>
                <p className="text-xs text-[#94a3b8]">
                  Transmitted across 1,248 active devices and campus security dashboard channels.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastData.title}
                    onChange={e => setBroadcastData({ ...broadcastData, title: e.target.value })}
                    className="w-full bg-[#1b1e2c] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                      Severity Level
                    </label>
                    <select
                      value={broadcastData.severity}
                      onChange={e => setBroadcastData({ ...broadcastData, severity: e.target.value })}
                      className="w-full bg-[#1b1e2c] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="critical">🔴 Critical Emergency</option>
                      <option value="high">🟠 High Advisory</option>
                      <option value="moderate">🟡 Moderate Precaution</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                      Targeted Perimeter Zone
                    </label>
                    <input
                      type="text"
                      value={broadcastData.zone}
                      onChange={e => setBroadcastData({ ...broadcastData, zone: e.target.value })}
                      className="w-full bg-[#1b1e2c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                    Advisory Body
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={broadcastData.message}
                    onChange={e => setBroadcastData({ ...broadcastData, message: e.target.value })}
                    className="w-full bg-[#1b1e2c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer border border-red-400/40 flex items-center justify-center gap-2"
                  >
                    <Radio size={14} className="animate-pulse" />
                    <span>Send Push Broadcast</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
