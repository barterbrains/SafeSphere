import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, AlertTriangle, Navigation, Activity } from 'lucide-react';
import { getUser, apiFetch, getRiskCategory } from '../utils';
import BottomNav from '../components/BottomNav';
import StatusPill from '../components/ui/StatusPill';
import ListRow from '../components/ui/ListRow';

const QUICK_DESTINATIONS = [
  { id: 'loc-1', address: 'Connaught Place, New Delhi', icon: MapPin },
  { id: 'loc-2', address: 'India Gate, New Delhi', icon: MapPin },
  { id: 'loc-9', address: 'Saket Select CityWalk', icon: MapPin },
  { id: 'loc-4', address: 'Gurugram Cyber City', icon: MapPin },
];

const CURRENT_SAFESCORE = 74;

/* Score → semantic color */
const scoreColor = (s: number) =>
  s >= 80 ? '#34D399' : s >= 65 ? '#FCD34D' : s >= 50 ? '#FB923C' : '#FCA5A5';

export default function HomePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [showSos, setShowSos] = useState(false);

  useEffect(() => {
    setScore(0);
    const timer = setTimeout(() => setScore(CURRENT_SAFESCORE), 300);
    apiFetch('/safe-zones').then(setSafeZones).catch(() => {});
    apiFetch('/user/contacts').then(setContacts).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const riskCat = getRiskCategory(score);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const activeContacts = contacts.filter(c => c.enabled);

  return (
    <div className="nav-padded" style={{ background: '#0B0F14', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header / SafeScore Hero ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1520 0%, #0f1e2e 60%, #0B0F14 100%)',
        padding: '52px 20px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
          {/* Greeting row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: 4 }}>{greeting},</p>
              <h1 style={{ color: '#F1F5F9', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {firstName} 👋
              </h1>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#131A24', borderRadius: 9999, padding: '6px 12px',
              border: '1px solid #1E2733',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              <span style={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>GTBIT, Rohini</span>
            </div>
          </div>

          {/* SafeScore card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16, padding: '20px 24px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Current Area Safety
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ color: scoreColor(score), fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, transition: 'color 0.5s' }}>
                    {score}
                  </span>
                  <span style={{ color: '#334155', fontSize: '1rem', alignSelf: 'flex-end', marginBottom: 6 }}>/100</span>
                </div>
                <StatusPill label={riskCat.label} variant={score >= 80 ? 'safe' : score >= 65 ? 'moderate' : score >= 50 ? 'elevated' : 'danger'} dot />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#334155', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Area Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                  {['🔆 Moderate lighting', '👥 Active area', '🚇 Near metro'].map(d => (
                    <span key={d} style={{ color: '#64748B', fontSize: '0.73rem' }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px' }}>

        {/* Search bar */}
        <div
          onClick={() => navigate('/search')}
          style={{
            background: '#111827', borderRadius: 12, border: '1px solid #1E2733',
            padding: '10px 10px 10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: -28, position: 'relative', zIndex: 10,
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#2A3441')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1E2733')}
        >
          <Search size={17} color="#475569" />
          <span style={{ flex: 1, color: '#334155', fontSize: '0.9rem' }}>Where to? Search destination...</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); navigate('/search'); }}
            style={{ borderRadius: 8 }}
          >
            <Navigation size={14} />
            Go
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          {/* Start Journey */}
          <button
            onClick={() => navigate('/search')}
            style={{
              padding: 18, display: 'flex', alignItems: 'center', gap: 12,
              background: '#111827', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#131A24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111827'; }}
          >
            <div style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Navigation size={18} color="#10B981" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#10B981' }}>Start Journey</p>
              <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: 2 }}>SafeScore routing</p>
            </div>
          </button>

          {/* SOS */}
          <button
            onClick={() => setShowSos(true)}
            style={{
              padding: 18, display: 'flex', alignItems: 'center', gap: 12,
              background: '#111827', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#131A24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111827'; }}
          >
            <div style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#EF4444' }}>SOS</p>
              <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: 2 }}>Emergency alert</p>
            </div>
          </button>
        </div>

        {/* Trusted contacts */}
        {activeContacts.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingLeft: 2 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trusted Contacts</span>
              <StatusPill label="Active" variant="active" dot />
            </div>
            <div style={{ background: '#111827', border: '1px solid #1E2733', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
              {activeContacts.slice(0, 4).map(c => (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(16,185,129,0.3)' }}>
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>{c.name[0]}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#475569' }}>{c.name.split(' ')[0]}</span>
                </div>
              ))}
              {activeContacts.length > 4 && (
                <span style={{ color: '#334155', fontSize: '0.75rem', marginLeft: 4 }}>+{activeContacts.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Quick destinations */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingLeft: 2 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Destinations</span>
            <button
              onClick={() => navigate('/search')}
              style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              See all →
            </button>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1E2733', borderRadius: 12, overflow: 'hidden' }}>
            {QUICK_DESTINATIONS.map((dest, i) => (
              <div key={dest.id} style={{ borderBottom: i < QUICK_DESTINATIONS.length - 1 ? '1px solid #1E2733' : 'none' }}>
                <ListRow
                  icon={<MapPin size={16} />}
                  iconBg="rgba(16,185,129,0.1)"
                  iconColor="#10B981"
                  title={dest.address}
                  onClick={() => navigate(`/routes?destinationId=${dest.id}&destAddress=${encodeURIComponent(dest.address)}`)}
                  showArrow
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nearby safe zones */}
        {safeZones.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 20 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'block', paddingLeft: 2 }}>
              Nearby Safe Zones
            </span>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {safeZones.slice(0, 5).map(zone => {
                const icons: Record<string, string> = { police: '🚔', hospital: '🏥', metro: '🚇', mall: '🏬', campus: '🎓', public: '🏛️' };
                return (
                  <div key={zone.id} style={{ flexShrink: 0, background: '#111827', border: '1px solid #1E2733', borderRadius: 12, padding: '12px 14px', minWidth: 120, textAlign: 'center' }}>
                    <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: 6 }}>{icons[zone.type] || '📍'}</span>
                    <p style={{ fontWeight: 600, fontSize: '0.73rem', color: '#94A3B8', lineHeight: 1.3 }}>{zone.name}</p>
                    <StatusPill label={zone.type} variant="info" style={{ marginTop: 6, fontSize: '0.62rem' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SOS Confirmation Modal */}
      {showSos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="animate-slide-in-bottom" style={{ width: '100%', maxWidth: 360, background: '#111827', border: '1px solid #1E2733', borderRadius: 20, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', marginBottom: 8 }}>Emergency SOS</h3>
            <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5 }}>
              This will alert your trusted contacts and show nearby emergency resources. Are you sure?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowSos(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => { setShowSos(false); navigate('/emergency'); }} className="btn btn-danger" style={{ flex: 1 }}>
                Confirm SOS
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav onSOS={() => setShowSos(true)} />
    </div>
  );
}
