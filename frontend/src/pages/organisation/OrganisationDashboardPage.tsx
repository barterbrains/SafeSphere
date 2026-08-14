import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, Bell, TrendingUp, Users, MapPin,
  ExternalLink, ChevronDown, CheckCircle2, AlertOctagon,
  Eye, Radio, Megaphone, HelpCircle, LogOut, ArrowRight,
  ShieldCheck, Layers, FileText, Settings, User, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrganisationDashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: 'Security Advisory: Reduced Lighting on Ring Road',
    severity: 'high',
    zone: 'Rajouri Garden Perimeter',
    message: 'Campus security patrols have been dispatched along the Ring Road corridor. Travelers are advised to use the Main Gate entrance.',
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // GTBIT coordinates in Rajouri Garden, New Delhi
  const GTBIT_COORDS: [number, number] = [28.6508, 77.1235];

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: GTBIT_COORDS,
      zoom: 14.5,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Heat circles / Risk zones
    // 1. High Risk Zone (Red) near Ring Road
    L.circle([28.6475, 77.1210], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.35,
      radius: 400,
      weight: 1.5,
    }).addTo(map);

    // 2. Elevated Risk Zone (Orange)
    L.circle([28.6540, 77.1265], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.3,
      radius: 350,
      weight: 1.5,
    }).addTo(map);

    // 3. Moderate Risk (Yellow)
    L.circle([28.6515, 77.1180], {
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.25,
      radius: 300,
      weight: 1,
    }).addTo(map);

    // 4. Safe Campus Core Zone (Green/Blue)
    L.circle(GTBIT_COORDS, {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.2,
      radius: 250,
      weight: 1.5,
    }).addTo(map);

    // Custom GTBIT Center Pin Badge
    const gtbitIcon = L.divIcon({
      className: 'custom-gtbit-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #3730a3, #4f46e5);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.6);
          border: 1.5px solid #818cf8;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        ">
          <span>🏢</span>
          <span>GTBIT</span>
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    });

    L.marker(GTBIT_COORDS, { icon: gtbitIcon }).addTo(map);

    // Surrounding Safe Zone Shield Pins
    const safeZonePoints: [number, number][] = [
      [28.6545, 77.1215],
      [28.6480, 77.1270],
      [28.6530, 77.1290],
      [28.6465, 77.1190],
      [28.6560, 77.1250],
      [28.6510, 77.1320],
    ];

    safeZonePoints.forEach(pt => {
      const shieldIcon = L.divIcon({
        className: 'safe-zone-shield-icon',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #312e81;
            border: 1.5px solid #818cf8;
            box-shadow: 0 0 10px rgba(129, 140, 248, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c7d2fe;
            font-size: 12px;
          ">
            🛡️
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker(pt, { icon: shieldIcon }).addTo(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
    }, 1600);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a12] text-[#f1f5f9] font-['Inter',sans-serif] overflow-hidden">
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="w-[260px] h-full bg-[#0d0d18] border-r border-white/10 flex flex-col justify-between shrink-0 select-none z-30">
        <div>
          {/* Brand Header */}
          <div
            onClick={() => navigate('/')}
            className="p-5 flex items-center gap-3 cursor-pointer group border-b border-white/5"
            title="Return to SafeSphere Public"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3730a3] border border-[#818cf8]/40 shadow-[0_0_16px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
                SafeSphere
              </h1>
              <p className="text-[10px] font-semibold text-[#818cf8] tracking-wider uppercase mt-1">
                Institutional Command
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Layers size={18} /> },
              { id: 'heatmap', label: 'Safety Heatmap', icon: <Activity size={18} /> },
              { id: 'incidents', label: 'Incidents', icon: <Shield size={18} /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
              { id: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
              { id: 'journeys', label: 'Journeys', icon: <MapPin size={18} /> },
              { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
              { id: 'profile', label: 'Profile', icon: <User size={18} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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

        {/* Sidebar Footer Area */}
        <div className="p-3 space-y-2.5 border-t border-white/5 bg-[#090912]/80">
          {/* Broadcast Alert Red CTA Button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold text-[12px] py-2.5 px-3 rounded-xl shadow-[0_4px_16px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-400/30"
          >
            <Megaphone size={15} />
            <span>Broadcast Campus Alert</span>
          </button>

          <div className="space-y-0.5 pt-1">
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

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto bg-[#07070f] p-6 flex flex-col gap-5">
        {/* Top Organization Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-3.5">
            {/* GTBIT Crest Logo */}
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

        {/* Sub-Header & Live Pulse */}
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

        {/* ── 6 TOP METRIC CARDS ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Journeys */}
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

          {/* Card 2: Average SafeScore */}
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

          {/* Card 3: Active Incidents */}
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

          {/* Card 4: High Risk Zones */}
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

          {/* Card 5: Active Alerts */}
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

          {/* Card 6: Safe Zones */}
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

        {/* ── MIDDLE SECTION: MAP & RECENT ALERTS ──────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Campus Safety Map (7 cols on large) */}
          <div className="lg:col-span-7 bg-[#10101d] border border-white/10 rounded-2xl p-4 flex flex-col shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Campus Safety Map</span>
              </h3>

              {/* Map Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#cbd5e1]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400" /> Elevated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> High Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Safe Zone
                </span>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-white/10 bg-[#07070f]">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-[#94a3b8] z-[400] pointer-events-none">
                © OpenStreetMap contributors
              </div>
            </div>
          </div>

          {/* Recent Safety Alerts (5 cols on large) */}
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
              {/* Alert 1 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="text-xs font-bold text-white">High Risk Zone Detected</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">8 mins ago</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mb-1.5 leading-snug">
                  SafeScore dropped to 42 near Rajouri Garden Ring Road.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
                  <MapPin size={11} />
                  <span>Rajouri Garden Ring Road</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Incident Cluster Detected</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">21 mins ago</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mb-1.5 leading-snug">
                  3 incidents reported near Metro Gate 4 this week.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                  <MapPin size={11} />
                  <span>Rajiv Chowk Metro Gate 4, CP</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Lighting Risk</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">1 hr ago</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mb-1.5 leading-snug">
                  Low-light conditions detected around Block B &amp; C.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-semibold">
                  <MapPin size={11} />
                  <span>GTBIT Perimeter Zone</span>
                </div>
              </div>

              {/* Alert 4 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Risk Reduced</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">2 hrs ago</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] mb-1.5 leading-snug">
                  SafeScore improved by 9 points near Main Gate.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <MapPin size={11} />
                  <span>GTBIT Main Gate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM SECTION: 3 CARDS ─────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Incident Summary Donut */}
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
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                  {/* Harassment (33%) -> 29.0 */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="29 88" strokeDashoffset="0" />
                  {/* Suspicious Activity (25%) -> 22.0 */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4.5" strokeDasharray="22 88" strokeDashoffset="-29" />
                  {/* Poor Lighting (17%) -> 15.0 */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="15 88" strokeDashoffset="-51" />
                  {/* Traffic Hazard (17%) -> 15.0 */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="15 88" strokeDashoffset="-66" />
                  {/* Others (8%) -> 7.0 */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="7 88" strokeDashoffset="-81" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-white leading-none">12</span>
                  <span className="text-[8px] uppercase tracking-wider text-[#94a3b8] font-bold">Total</span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Harassment
                  </span>
                  <span className="font-bold text-white">4 <span className="text-[#64748b] font-normal text-[10px]">33%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Suspicious Activity
                  </span>
                  <span className="font-bold text-white">3 <span className="text-[#64748b] font-normal text-[10px]">25%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" /> Poor Lighting
                  </span>
                  <span className="font-bold text-white">2 <span className="text-[#64748b] font-normal text-[10px]">17%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Traffic Hazard
                  </span>
                  <span className="font-bold text-white">2 <span className="text-[#64748b] font-normal text-[10px]">17%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Others
                  </span>
                  <span className="font-bold text-white">1 <span className="text-[#64748b] font-normal text-[10px]">8%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SafeScore Trend Line */}
          <div className="bg-[#10101d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white">SafeScore Trend</h3>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                7-Day Trend
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 my-auto">
              {/* SVG Line Curve */}
              <div className="flex-1 h-28 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 160 80">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="160" y2="10" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                  <line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                  <line x1="0" y1="60" x2="160" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />

                  {/* Gradient area */}
                  <defs>
                    <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 5,38 Q 30,42 55,32 T 105,45 T 130,22 T 155,18 L 155,75 L 5,75 Z"
                    fill="url(#scoreTrendGrad)"
                  />
                  {/* Glow Spline */}
                  <path
                    d="M 5,38 Q 30,42 55,32 T 105,45 T 130,22 T 155,18"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Data Dots */}
                  {[
                    [5, 38], [30, 41], [55, 32], [80, 48], [105, 45], [130, 22], [155, 18]
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                  ))}
                </svg>
                {/* X Axis Labels */}
                <div className="flex justify-between text-[8px] text-[#64748b] font-semibold mt-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Right Big Score Callout */}
              <div className="text-right pl-2 shrink-0 border-l border-white/5">
                <div className="text-3xl font-black text-indigo-400">76</div>
                <div className="text-[10px] text-[#94a3b8] font-bold">Current</div>
                <div className="text-[10px] font-bold text-emerald-400 mt-1">+6 vs last week</div>
              </div>
            </div>
          </div>

          {/* 3. Top High Risk Locations */}
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

        {/* ── BOTTOM DISCLAIMER / COMPLIANCE BAR ───────────────────────── */}
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
