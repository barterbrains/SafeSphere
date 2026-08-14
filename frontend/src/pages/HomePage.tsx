import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, AlertTriangle, Navigation, Shield, Activity,
  Users, ChevronRight, Clock, ShieldCheck, Route as RouteIcon
} from 'lucide-react';
import { getUser, apiFetch, getRiskCategory } from '../utils';
import BottomNav from '../components/BottomNav';
import StatusPill from '../components/ui/StatusPill';

const QUICK_DESTINATIONS = [
  { id: 'loc-1', address: 'Connaught Place, New Delhi', icon: MapPin, label: 'Central hub · High footfall' },
  { id: 'loc-2', address: 'India Gate, New Delhi', icon: MapPin, label: 'Tourist corridor · Well lit' },
  { id: 'loc-9', address: 'Saket Select CityWalk', icon: MapPin, label: 'Commercial safe zone' },
  { id: 'loc-4', address: 'Gurugram Cyber City', icon: MapPin, label: 'Corporate transit district' },
];

const CURRENT_SAFESCORE = 88;

/* SafeScore Circular Progress Gauge */
function SafeScoreGauge({ score, size = 130 }: { score: number; size?: number }) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  // Determine glow & color based on score
  const color = score >= 80 ? '#2dd4bf' : score >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        filter: 'blur(10px)',
      }} />

      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{
            filter: `drop-shadow(0 0 8px ${color}aa)`,
            transition: 'stroke-dasharray 0.8s ease-out',
          }}
        />
      </svg>

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>/100</span>
        </div>
        <span style={{ fontSize: '0.52rem', fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
          SafeScore
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [showSos, setShowSos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setScore(0);
    const timer = setTimeout(() => setScore(CURRENT_SAFESCORE), 200);
    apiFetch('/safe-zones').then(setSafeZones).catch(() => {});
    apiFetch('/user/contacts').then(setContacts).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const riskCat = getRiskCategory(score);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Explorer';
  const activeContacts = contacts.filter(c => c.enabled);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/routes?destAddress=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="nav-padded" style={{ background: '#0B0E17', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#F1F5F9' }}>
      
      {/* ── Top Header / Profile Badge ── */}
      <div style={{
        background: 'linear-gradient(180deg, #121626 0%, #0B0E17 100%)',
        padding: '24px 20px 32px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {/* Subtle radial lights */}
        <div style={{
          position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Greeting bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{greeting}</p>
              <h1 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
                {firstName}
              </h1>
            </div>
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#13182C', borderRadius: 999, padding: '6px 14px',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
              <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>Active Guardian</span>
            </div>
          </div>

          {/* Upgraded Current Safety Score Card with Radial Ring */}
          <div style={{
            background: 'rgba(18, 22, 38, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px 20px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              
              {/* Radial Score Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <SafeScoreGauge score={score} size={110} />
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Current Perimeter
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: 2, marginBottom: 6 }}>
                    Very Safe Zone
                  </h3>
                  <StatusPill label={riskCat.label} variant={score >= 80 ? 'safe' : 'moderate'} dot />
                </div>
              </div>

              {/* Area Details with Icon Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={13} color="#2dd4bf" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Good Lighting</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={13} color="#818cf8" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>High Footfall</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={13} color="#60a5fa" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Near Safe Haven</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Actions & Destinations ── */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px' }}>

        {/* Search Bar Input */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            background: '#121624',
            borderRadius: 14,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 8px 8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: -22,
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <Search size={18} color="#64748B" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search destination or route..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #3730a3, #4338ca)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Navigation size={14} />
            <span>Go</span>
          </button>
        </form>

        {/* Action Buttons Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          {/* Start Journey */}
          <button
            onClick={() => navigate('/search')}
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#121624',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'}
          >
            <div style={{
              width: 42, height: 42,
              background: 'rgba(45, 212, 191, 0.12)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Navigation size={20} color="#2dd4bf" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#2dd4bf' }}>Route Analysis</p>
              <p style={{ color: '#64748B', fontSize: '0.72rem', marginTop: 2 }}>Compare 3 pathways</p>
            </div>
          </button>

          {/* SOS Emergency Response */}
          <button
            onClick={() => navigate('/emergency')}
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#121624',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'}
          >
            <div style={{
              width: 42, height: 42,
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={20} color="#EF4444" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#EF4444' }}>SOS Trigger</p>
              <p style={{ color: '#64748B', fontSize: '0.72rem', marginTop: 2 }}>Instant live broadcast</p>
            </div>
          </button>
        </div>

        {/* Quick Destinations with Refined Badge Styling */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Intelligent Pathways
            </span>
            <button
              onClick={() => navigate('/search')}
              style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Explore all →
            </button>
          </div>

          <div style={{
            background: '#121624',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            {QUICK_DESTINATIONS.map((dest, i) => (
              <div
                key={dest.id}
                onClick={() => navigate(`/routes?destinationId=${dest.id}&destAddress=${encodeURIComponent(dest.address)}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  borderBottom: i < QUICK_DESTINATIONS.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: 'rgba(79, 70, 229, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <MapPin size={18} color="#818cf8" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F1F5F9' }}>{dest.address}</p>
                    <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>{dest.label}</p>
                  </div>
                </div>
                <ChevronRight size={16} color="#475569" />
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Safe Zones */}
        {safeZones.length > 0 && (
          <div style={{ marginTop: 28, marginBottom: 24 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' }}>
              Nearby Safe Havens
            </span>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
              {safeZones.slice(0, 4).map(zone => (
                <div
                  key={zone.id}
                  style={{
                    flex: '0 0 160px',
                    background: '#121624',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(45, 212, 191, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <ShieldCheck size={16} color="#2dd4bf" />
                  </div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {zone.name}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 2 }}>{zone.type || 'Verified Zone'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
