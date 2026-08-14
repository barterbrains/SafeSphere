import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Settings, User } from 'lucide-react';

interface BottomNavProps {
  onSOS?: () => void;
}

const NAV_ITEMS = [
  { path: '/home',     icon: Home,     label: 'Home' },
  { path: '/search',   icon: Search,   label: 'Navigate' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/profile',  icon: User,     label: 'Profile' },
];

export default function BottomNav({ onSOS }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSosClick = () => {
    if (onSOS) onSOS();
    else navigate('/emergency');
  };

  const itemStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '8px 4px',
    color: active ? '#10B981' : '#475569',
    textDecoration: 'none',
    fontSize: '0.7rem',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    transition: 'color 0.15s ease',
    border: 'none',
    background: 'none',
    fontFamily: 'inherit',
  });

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(11,15,20,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #1E2733',
        display: 'flex',
        zIndex: 50,
        boxShadow: '0 -4px 30px rgba(0,0,0,0.45)',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          aria-label={label}
          style={itemStyle(isActive(path))}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}

      {/* SOS center button */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={handleSosClick}
          aria-label="Emergency SOS Alert"
          style={{
            width: 54, height: 54, borderRadius: '50%',
            background: '#EF4444',
            color: 'white',
            border: '3px solid #0B0F14',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.05em',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(239,68,68,0.45), 0 0 0 3px rgba(239,68,68,0.2)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            marginTop: -14,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(239,68,68,0.6)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(239,68,68,0.45), 0 0 0 3px rgba(239,68,68,0.2)';
          }}
        >
          SOS
        </button>
      </div>

      {NAV_ITEMS_RIGHT.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          aria-label={label}
          style={itemStyle(isActive(path))}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
