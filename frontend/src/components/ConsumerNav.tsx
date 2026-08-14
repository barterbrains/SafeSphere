import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../utils';
import { useAuth } from '../context/AuthContext';

/**
 * ConsumerNav
 * -----------
 * Left sidebar for the consumer-facing /routes page.
 * Contains ONLY personal-journey nav items.
 */
export function ConsumerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemo, setInstitutionDemoMode } = useAuth();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Safe Routes',   icon: 'alt_route',      path: '/routes'    },
    { label: 'Emergency SOS', icon: 'emergency',       path: '/emergency' },
    { label: 'My Profile',    icon: 'account_circle',  path: '/profile'   },
    { label: 'Settings',      icon: 'settings',        path: '/settings'  },
  ];

  function handleInstitutionSwitch() {
    setInstitutionDemoMode();
    navigate('/institution/overview');
  }

  return (
    <nav className="hidden md:flex flex-col h-full w-[240px] bg-[#0d0d1a]/80 backdrop-blur-3xl border-r border-white/10 shadow-lg py-6 z-50 shrink-0">

      {/* Brand */}
      <div
        onClick={() => navigate('/routes')}
        className="px-6 mb-6 flex items-center gap-3 cursor-pointer group select-none"
        title="Safe Routes"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#3730a3] border border-[#818cf8]/40 shadow-[0_0_16px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-white text-lg">shield</span>
        </div>
        <div>
          <h1 className="text-[17px] leading-tight font-bold text-white group-hover:text-indigo-300 transition-colors">SafeSphere</h1>
          <p className="text-[11px] leading-tight tracking-wider font-semibold text-[#818cf8] mt-0.5">Personal Safety</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
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

      {/* Bottom Section */}
      <div className="px-4 mt-auto flex flex-col gap-2">

        {/* DEMO-ONLY: Organisation Portal shortcut */}
        {isDemo && (
          <div className="mb-1">
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <span className="text-[9px] font-bold tracking-[0.15em] text-amber-400/70 uppercase">Demo shortcut</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <button
              onClick={handleInstitutionSwitch}
              title="Demo only - switches to organisation demo context"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 bg-transparent text-[12px] font-semibold tracking-wide transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">corporate_fare</span>
              <span>Organisation Portal</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold tracking-wider">DEMO</span>
            </button>
          </div>
        )}

        <button
          onClick={() => { clearAuth(); navigate('/login'); }}
          className="flex items-center gap-3.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2.5 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span className="text-[12px] tracking-wider font-semibold">Sign Out</span>
        </button>

        <button
          onClick={() => alert('SafeSphere Personal Safety - Help & Support')}
          className="flex items-center gap-3.5 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-xl px-4 py-2.5 text-left transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[19px]">help</span>
          <span className="text-[12px] tracking-wider font-semibold">Help</span>
        </button>
      </div>
    </nav>
  );
}