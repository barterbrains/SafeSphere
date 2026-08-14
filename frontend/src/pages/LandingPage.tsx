import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Navigation2, AlertTriangle, MapPin, Shield,
  Activity, Users, ChevronDown, ChevronRight,
  BarChart2, Lock, Bell, Map, ArrowRight, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Shield Emblem Logo ────────────────────────────────────────────────────────
function SafeSphereLogo({ size = 32 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      border: '1px solid rgba(129, 140, 248, 0.4)',
      boxShadow: '0 0 16px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Shield size={size * 0.55} color="#ffffff" fill="#ffffff" />
    </div>
  );
}

// ── SafeScore Ring (Rich Indigo Glow) ─────────────────────────────────────────
function SafeScoreRing({
  score = 88, size = 160, color = '#6366f1'
}: { score?: number; size?: number; color?: string }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}35 0%, transparent 70%)`,
        filter: 'blur(10px)',
      }} />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
          style={{ filter: `drop-shadow(0 0 10px ${color}dd)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2,
      }}>
        <span style={{ fontSize: size > 130 ? '2.2rem' : '1.4rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.52rem', fontWeight: 700, color, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>SafeScore</span>
      </div>
    </div>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  const contacts = [
    { initial: 'S', name: 'Sarah', status: 'Active Area' },
    { initial: 'M', name: 'Mom', status: 'Anna Maria' },
    { initial: 'JK', name: 'Jasmine K.', status: 'Safe Zone' },
  ];
  return (
    <div style={{
      width: 280, background: '#0a0a14', borderRadius: 40,
      border: '2px solid rgba(129, 140, 248, 0.3)', overflow: 'hidden',
      boxShadow: '0 0 70px rgba(79, 70, 229, 0.25), 0 40px 80px rgba(0,0,0,0.8)',
      position: 'relative',
    }}>
      <div style={{ background: '#000', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 16, background: '#0d0d1a', borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 18px', fontSize: '0.65rem', color: '#94a3b8' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Activity size={10} color="#818cf8" />
          <span style={{ color: '#818cf8' }}>●●●</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 12px' }}>
        <SafeScoreRing score={88} size={160} color="#6366f1" />
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>
            <MapPin size={11} /><span>New York City</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', marginTop: 2 }}>1.3 miles · Now LIVE</div>
        </div>
      </div>
      <div style={{ margin: '0 14px', background: '#121222', borderRadius: 14, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Trusted Contacts</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {contacts.map(c => (
            <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e1e38, rgba(79, 70, 229, 0.2))',
                border: '1.5px solid rgba(129, 140, 248, 0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#818cf8',
              }}>{c.initial}</div>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{c.name}</span>
              <span style={{ fontSize: '0.55rem', color: '#818cf8' }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '14px 14px 20px' }}>
        <div style={{
          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
          borderRadius: 10, padding: '12px', textAlign: 'center',
          fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.12em',
          color: 'white', boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
        }}>SOS — EMERGENCY ASSISTANCE</div>
      </div>
    </div>
  );
}

// ── FAQ Accordion Item ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 0', cursor: 'pointer', fontFamily: 'inherit',
          color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left',
          gap: 16,
        }}
      >
        <span>{q}</span>
        <ChevronDown size={18} color="#818cf8" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, paddingBottom: 20, margin: 0 }}>{a}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  const { setConsumerDemoMode } = useAuth();
  const handleDemoLogin = () => {
    setConsumerDemoMode();
    navigate('/routes');
  };

  const capabilities = [
    { num: '7', label: 'Weighted Safety Factors' },
    { num: 'Live', label: 'OSM Overpass Data Feeds' },
    { num: '0–100', label: 'Transparent SafeScore Range' },
    { num: '3', label: 'Route Comparison Modes' },
  ];

  const features = [
    {
      icon: <Navigation2 size={20} color="#818cf8" />,
      label: 'Dynamic Routing',
      desc: 'Real-time path analysis that continuously prioritises well-lit, populated corridors over raw speed.',
      stat: 'Scores each segment across 7 weighted factors from live OSM data.',
    },
    {
      icon: <Bell size={20} color="#818cf8" />,
      label: 'Ambient Threat Detection',
      desc: 'Passive monitoring flags environmental risk shifts before they escalate into incidents along your path.',
      stat: 'Queries OSM Overpass API with configurable polling intervals.',
    },
    {
      icon: <Users size={20} color="#818cf8" />,
      label: 'Guardian Network',
      desc: 'Trusted contacts receive push updates and exact coordinates — no app install required on their end.',
      stat: 'Contacts notified via push with exact coordinates on SOS trigger.',
    },
    {
      icon: <Lock size={20} color="#818cf8" />,
      label: 'End-to-End Privacy',
      desc: 'Location data is encrypted in transit, never sold, and automatically purged 30 days after your journey ends.',
      stat: 'Zero third-party data sharing. Ever.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Set Your Destination',
      desc: 'Enter where you\'re going. SafeSphere instantly pulls live OSM data, district-level crime statistics, and current lighting conditions for your route.',
      icon: <Map size={22} color="#818cf8" />,
    },
    {
      num: '02',
      title: 'SafeScore Calculates in Real Time',
      desc: 'Our engine scores each possible route 0–100 across 7 weighted factors. You see Fastest, Safest, and Balanced options — all with transparent breakdowns.',
      icon: <BarChart2 size={22} color="#818cf8" />,
    },
    {
      num: '03',
      title: 'Contacts Get Live Updates',
      desc: 'Once your journey starts, trusted contacts see your position and SafeScore updates at regular intervals. No manual check-ins required.',
      icon: <Users size={22} color="#818cf8" />,
    },
    {
      num: '04',
      title: 'Instant SOS If Anything Changes',
      desc: 'If your score drops sharply, you\'re off-route, or you trigger SOS — contacts and emergency services are alerted with your exact coordinates.',
      icon: <Shield size={22} color="#818cf8" />,
    },
  ];

  const testimonials = [
    {
      quote: "I used to take Ubers home instead of walking because I was anxious about the route. SafeSphere gave me my commute back. I can actually see why a path is rated safe, not just guess.",
      name: 'Priya K.',
      role: 'Graduate student · Mumbai',
      initial: 'P',
    },
    {
      quote: "The Guardian Network feature is the one thing that convinced my parents to stop calling me every time I work late. They can see I\'m moving safely without me having to text constantly.",
      name: 'Aisha M.',
      role: 'Night shift nurse · London',
      initial: 'A',
    },
    {
      quote: "We piloted SafeSphere across our campus security operations. The aggregated heatmap data is exactly what our safety committee needed to make infrastructure budget decisions.",
      name: 'Dr. R. Nair',
      role: 'Head of Campus Safety · SRCAS',
      initial: 'R',
    },
  ];

  const faqs = [
    {
      q: 'Does SafeSphere drain my battery?',
      a: 'SafeSphere uses a combination of GPS and network-based positioning with adaptive polling — designed to keep power usage comparable to standard navigation apps. Background monitoring (when a journey is not active) uses minimal battery.',
    },
    {
      q: 'Who can see my location?',
      a: 'Only the trusted contacts you explicitly add and approve can see your live location, and only while a journey is active. SafeSphere staff cannot view individual journeys. All data is end-to-end encrypted.',
    },
    {
      q: 'What happens if I lose mobile signal?',
      a: 'SafeSphere caches your last known route and SafeScore locally. If signal drops during an active journey, your trusted contacts receive an automatic low-signal alert with your last confirmed coordinates.',
    },
    {
      q: 'Is my data ever sold to third parties?',
      a: 'Never. We do not sell, rent, or share individual journey data. Institutional customers receive only aggregated, fully anonymised district-level statistics — no individual user data is ever accessible.',
    },
    {
      q: 'Can I use SafeSphere without adding trusted contacts?',
      a: 'Yes. Trusted contacts are optional. Without them you still get full SafeScore routing, Journey Guardian monitoring, and SOS (which will attempt to contact local emergency services). Adding contacts simply unlocks the live-share and auto-alert features.',
    },
  ];

  const scoreExamples = [
    {
      score: 85, color: '#6366f1', label: 'Very Safe', labelColor: '#818cf8',
      desc: 'Well-lit route through active commercial areas with police station 200m away.',
      positives: ['Good street lighting on all segments', 'High pedestrian density (evening peak)', 'Police station 200m from route'],
      risks: [],
    },
    {
      score: 42, color: '#f59e0b', label: 'Use Caution', labelColor: '#f59e0b',
      desc: 'Partially unlit residential cut-through with two recent incident reports in the area.',
      positives: ['Shorter distance (saves 8 min)'],
      risks: ['2 incidents reported in past 72h', 'Unlit stretch: 600m segment', 'Low pedestrian activity after 9 PM'],
    },
  ];

  return (
    <div style={{ background: '#0a0a12', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#F1F5F9', overflowX: 'hidden' }}>

      {/* ═══ NAV ══════════════════════════════════════════════════════════ */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 6%', borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,18,0.92)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SafeSphereLogo size={34} />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>SafeSphere</span>
        </div>
        <div className="landing-nav-links" style={{ display: 'flex', gap: 32 }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'SafeScore', href: '#safescore' },
            { label: 'About', href: '#about' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(129,140,248,0.3)',
              borderRadius: 999, padding: '8px 16px',
              color: '#a5b4fc', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#a5b4fc'; }}
          >
            <Users size={14} />
            Log In
          </button>
          <button
            onClick={() => navigate('/organisation/login')}
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(129,140,248,0.3)',
              borderRadius: 999, padding: '8px 16px',
              color: '#a5b4fc', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#a5b4fc'; }}
          >
            <Building2 size={14} />
            Organisation Login
          </button>
          <button onClick={handleDemoLogin} style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            borderRadius: 999, padding: '9px 22px',
            color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.45)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >Try Demo</button>
        </div>
      </nav>

      {/* ═══ HERO ═════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '80px 6% 60px', overflow: 'hidden' }}>
        {/* Soft radial indigo glow */}
        <div style={{
          position: 'absolute', top: -120, right: '5%', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.16) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(79, 70, 229, 0.1)', padding: '6px 14px',
              borderRadius: 999, border: '1px solid rgba(129, 140, 248, 0.25)',
              marginBottom: 24, fontSize: '0.75rem', fontWeight: 700,
              color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block', boxShadow: '0 0 6px #818cf8' }} />
              Always On. Always Safe.
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Safety, redefined<br />by{' '}
              <span style={{ color: '#818cf8' }}>intelligence.</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
              Real-time risk assessment built on live OpenStreetMap data, NCRB district statistics, and environmental factors — not guesswork. One-tap protection for your most confident daily life.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48, alignItems: 'center' }}>
              <button onClick={() => navigate('/register')} style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                borderRadius: 999, padding: '14px 30px',
                color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 0 28px rgba(79, 70, 229, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >Get Early Access</button>
              <button onClick={handleDemoLogin} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, padding: '14px 26px', color: '#f1f5f9', fontWeight: 600,
                fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.12)'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                Try Demo
              </button>
              <button
                onClick={() => navigate('/organisation/login')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(129,140,248,0.35)',
                  borderRadius: 999, padding: '13px 22px',
                  color: '#a5b4fc', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Building2 size={16} />
                Organisation Login
              </button>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(129, 140, 248, 0.2)',
              borderRadius: 12, padding: '8px 16px',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={14} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 700 }}>System Status</div>
                <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>Secure & Operational</div>
              </div>
            </div>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES BAR ═════════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', padding: '36px 6%' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {capabilities.map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '0 24px',
              borderRight: i < capabilities.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#818cf8', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 6%', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', maxWidth: 500 }}>From destination to doorstep, automatically protected.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 0, position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative', paddingRight: 32 }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 24, right: 0, width: '100%', height: 1,
                    background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.4) 0%, rgba(79, 70, 229, 0.05) 100%)',
                    display: 'block',
                  }} />
                )}
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(129, 140, 248, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    position: 'relative', zIndex: 1,
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(129, 140, 248, 0.5)', letterSpacing: '0.06em' }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#f1f5f9' }}>{step.title}</h3>
                <p style={{ fontSize: '0.87rem', color: '#94a3b8', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '80px 6%', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Protection that operates in the background.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Every feature runs passively so you can focus on your day, not your security posture.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.label} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '28px 24px', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(129, 140, 248, 0.35)'; el.style.background = 'rgba(79, 70, 229, 0.05)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(79, 70, 229, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>{f.label}</h3>
                <p style={{ fontSize: '0.87rem', color: '#94a3b8', lineHeight: 1.6, flex: 1 }}>{f.desc}</p>
                {/* Concrete stat */}
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.78rem', color: '#818cf8', fontWeight: 600,
                }}>{f.stat}</div>
                <button style={{
                  marginTop: 12, background: 'none', border: 'none', color: '#64748b',
                  fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  Learn more <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SAFESCORE ENGINE ════════════════════════════════════════════ */}
      <section id="safescore" style={{ padding: '100px 6%', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The SafeScore Engine</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', maxWidth: 520, marginBottom: 12 }}>
              A transparent score. Not a black box.
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 560, lineHeight: 1.7, fontSize: '0.95rem' }}>
              Every SafeScore is computed from 7 weighted factors across live OSM data and historical NCRB district records. Here's the same route, two different paths.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {scoreExamples.map(ex => (
              <div key={ex.label} style={{
                background: '#0e0e1a', border: `1px solid ${ex.color}33`,
                borderRadius: 20, padding: 32,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <SafeScoreRing score={ex.score} size={110} color={ex.color} />
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: ex.labelColor, marginBottom: 6 }}>{ex.label}</div>
                    <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }}>{ex.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ex.positives.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.83rem', color: '#cbd5e1' }}>{p}</span>
                    </div>
                  ))}
                  {ex.risks.map(r => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.83rem', color: '#94a3b8' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 6%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>
              What early testers are saying.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Feedback from beta users during internal testing.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={t.name} style={{
                background: i === 1 ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.02)',
                border: i === 1 ? '1px solid rgba(129, 140, 248, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '28px 24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e1e38, rgba(79, 70, 229, 0.25))',
                    border: '1.5px solid rgba(129, 140, 248, 0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', flexShrink: 0,
                  }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{t.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ENTERPRISE ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 6%' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Enterprise & Campus</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Institutional intelligence, not just individual protection.
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: 28 }}>
              Security teams get aggregated, anonymised visibility across their entire campus or fleet — without ever accessing individual user data.
            </p>
            <button onClick={() => navigate('/institution/login')} style={{
              background: 'transparent', border: '1.5px solid rgba(129, 140, 248, 0.4)',
              borderRadius: 999, padding: '11px 28px', color: '#818cf8',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'; e.currentTarget.style.borderColor = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.4)'; }}
            >Request Institutional Access</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: <Map size={18} color="#818cf8" />, title: 'Aggregated Incident Heatmaps', desc: 'Visualise SafeScore distributions and incident clusters across your campus perimeter, updated daily.' },
              { icon: <BarChart2 size={18} color="#818cf8" />, title: 'Fleet-Wide SafeScore Analytics', desc: 'Track how route safety evolves over time for your entire user cohort. Justify infrastructure spend with data.' },
              { icon: <Lock size={18} color="#818cf8" />, title: 'SSO & Admin Dashboard Access', desc: 'Single Sign-On integration, role-based admin controls, and a dedicated security command centre.' },
            ].map(item => (
              <div key={item.title} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ══════════════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: '80px 6%', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>
              Questions we actually get asked.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Honest answers — no marketing deflection.</p>
          </div>
          <div>
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 6% 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div style={{ maxWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <SafeSphereLogo size={28} />
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>SafeSphere</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
                Protective Sophistication. Real-time safety intelligence for everyday life.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                <button key={l} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Documentation', 'GitHub', 'Institutional Access'].map(l => (
                <button key={l} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >{l}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>© 2024 SafeSphere. Protective Sophistication.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Twitter / X', href: '#' },
                { label: 'LinkedIn', href: '#' },
                { label: 'GitHub', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} style={{ fontSize: '0.78rem', color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >{s.label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) { .landing-nav-links { display: none !important; } }
        @media (max-width: 640px) {
          section { padding-left: 4% !important; padding-right: 4% !important; }
        }
      `}</style>
    </div>
  );
}
