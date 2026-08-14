import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../../utils';

export function InstitutionNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Overview', icon: 'dashboard', path: '/institution/overview' },
    { label: 'Heatmap', icon: 'local_shipping', path: '/institution/heatmap' },
    { label: 'Incidents', icon: 'verified_user', path: '/institution/incidents' },
    { label: 'Analytics', icon: 'analytics', path: '/institution/analytics' },
    { label: 'Alerts', icon: 'notifications_active', path: '/institution/alerts' },
    { label: 'Profile', icon: 'apartment', path: '/institution/profile' },
    { label: 'Settings', icon: 'settings', path: '/institution/settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-full w-[280px] bg-[#0d0d1a]/80 backdrop-blur-3xl border-r border-white/10 shadow-lg py-6 z-50 shrink-0">
      <div
        onClick={() => navigate('/institution/overview')}
        className="px-6 mb-6 flex items-center gap-3 cursor-pointer group select-none"
        title="Open Command Center"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3730a3] border border-[#818cf8]/40 shadow-[0_0_16px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(79,70,229,0.7)] transition-all">
          <span className="material-symbols-outlined text-white text-lg">shield</span>
        </div>
        <div>
          <h1 className="text-[18px] leading-tight font-bold text-white group-hover:text-indigo-300 transition-colors">SafeSphere</h1>
          <p className="text-[11px] leading-tight tracking-wider font-semibold text-[#818cf8] mt-0.5">Institutional Command</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/routes' && (currentPath === '/routes' || currentPath === '/home'));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer border-none ${
                isActive
                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] font-bold'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5 bg-transparent font-medium'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[13px] tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-auto">
        <button
          onClick={() => navigate('/institution/alerts')}
          className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] text-white text-[12px] tracking-wider font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(220,38,38,0.5)] transition-all cursor-pointer border border-red-500/40"
        >
          <span className="material-symbols-outlined text-base">campaign</span>
          Broadcast Campus Alert
        </button>
      </div>

      <div className="mt-4 px-3 flex flex-col gap-1">
        <button
          onClick={() => alert('SafeSphere Institutional Command Desk · Active 24/7 Operations')}
          className="flex items-center gap-3.5 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-xl px-4 py-2.5 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[19px]">help</span>
          <span className="text-[12px] tracking-wider font-semibold">Help Desk</span>
        </button>

        <button
          onClick={() => { clearAuth(); navigate('/login'); }}
          className="flex items-center gap-3.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2.5 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span className="text-[12px] tracking-wider font-semibold">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
