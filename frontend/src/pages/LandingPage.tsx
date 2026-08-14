import { useNavigate } from 'react-router-dom';
import { Shield, Navigation, AlertTriangle, Activity, Lock, Users, Map, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Basic mock login for the demo account
    localStorage.setItem('safesphere_token', 'demo-token-xyz');
    localStorage.setItem('safesphere_user', JSON.stringify({
      id: 'demo-user-123',
      name: 'Demo User',
      role: 'consumer'
    }));
    navigate('/home');
  };

  return (
    <div style={{ background: '#0B0F17', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#F1F5F9' }}>
      {/* ── Navigation Bar ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6D5FFD, #5B4FE0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SafeSphere</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => navigate('/login')} className="btn btn-ghost" style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Log In</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ background: '#6D5FFD', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 600 }}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ padding: '80px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109, 95, 253, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109, 95, 253, 0.1)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(109, 95, 253, 0.2)', marginBottom: 24 }}>
            <Activity size={14} color="#6D5FFD" />
            <span style={{ color: '#6D5FFD', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Safety Intelligence</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Navigate with intelligence, <br />
            <span style={{ color: '#6D5FFD' }}>not anxiety.</span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: '#94A3B8', marginBottom: 40, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}>
            Standard navigation optimizes for time. SafeSphere optimizes for you. Real-time safety scores, dynamic rerouting, and active journey protection for peace of mind.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')} 
              style={{ background: '#6D5FFD', border: 'none', borderRadius: 12, padding: '14px 28px', color: 'white', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Get Started <Navigation size={18} />
            </button>
            <button 
              onClick={handleDemoLogin} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 28px', color: '#F1F5F9', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              Try Demo Account
            </button>
          </div>
        </div>
      </section>

      {/* ── Problem / Solution Strip ── */}
      <section style={{ padding: '60px 5%', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ width: 48, height: 48, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <AlertTriangle size={24} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Static Maps Fail You</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5, fontSize: '0.95rem' }}>Crime maps are disconnected from active navigation. SafeSphere reasons about safety while your journey is actually happening.</p>
          </div>
          <div>
            <div style={{ width: 48, height: 48, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Map size={24} color="#10B981" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Explainable Routing</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5, fontSize: '0.95rem' }}>Compare routes based on Fastest, Safest, or Balanced. Every route includes a transparent breakdown of why it received its safety score.</p>
          </div>
          <div>
            <div style={{ width: 48, height: 48, background: 'rgba(109, 95, 253, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Lock size={24} color="#6D5FFD" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>Active Protection</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5, fontSize: '0.95rem' }}>Journey Guardian monitors your route live. If risk increases ahead, we automatically offer a safer detour.</p>
          </div>
        </div>
      </section>

      {/* ── SafeScore Explainer ── */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>The SafeScore Engine</h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: 40 }}>A transparent 0-100 score computed from real-world data, not guesses.</p>
          
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 40, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, paddingBottom: 30, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>85</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Very Safe</h4>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Score updates dynamically based on route segments.</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <h5 style={{ color: '#10B981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 700 }}>Positive Factors (+)</h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li style={{ display: 'flex', gap: 8 }}><CheckCircle2 size={16} color="#10B981" /> Historical District Safety (NCRB)</li>
                  <li style={{ display: 'flex', gap: 8 }}><CheckCircle2 size={16} color="#10B981" /> Good Street Lighting (OSM)</li>
                  <li style={{ display: 'flex', gap: 8 }}><CheckCircle2 size={16} color="#10B981" /> Proximity to Safe Zones</li>
                  <li style={{ display: 'flex', gap: 8 }}><CheckCircle2 size={16} color="#10B981" /> Active Pedestrian Areas</li>
                </ul>
              </div>
              <div>
                <h5 style={{ color: '#EF4444', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 700 }}>Risk Penalties (-)</h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li style={{ display: 'flex', gap: 8 }}><AlertTriangle size={16} color="#EF4444" /> Active Safety Events</li>
                  <li style={{ display: 'flex', gap: 8 }}><AlertTriangle size={16} color="#EF4444" /> High Isolation Zones</li>
                  <li style={{ display: 'flex', gap: 8 }}><AlertTriangle size={16} color="#EF4444" /> Recent Incident Reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Institutions ── */}
      <section style={{ padding: '60px 5%', background: '#0F1623' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(109, 95, 253, 0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Users size={28} color="#6D5FFD" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Enterprise & Campus Safety</h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            Give your security teams aggregated, anonymized visibility into incident patterns and fleet activity to justify infrastructure decisions and demonstrate duty of care.
          </p>
          <button 
            onClick={() => navigate('/institution/login')} 
            style={{ background: 'transparent', border: '1px solid #6D5FFD', borderRadius: 8, padding: '10px 24px', color: '#6D5FFD', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Institutional Access
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
        <p>SafeSphere © 2026. Built by BarterBrains for SRCAS Hackathon 3.0.</p>
      </footer>
    </div>
  );
}
