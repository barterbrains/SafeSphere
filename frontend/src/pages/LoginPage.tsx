import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Eye, EyeOff, MapPin, Activity, Users, ChevronRight,
  ArrowRight
} from 'lucide-react';
import { apiFetch, setAuth } from '../utils';

/* ─── Feature data ─── */
const FEATURES = [
  {
    icon: <Activity size={16} />,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    title: 'Real-time Safety Scoring',
    desc: 'Every route segment scored live using verified incident data.',
  },
  {
    icon: <MapPin size={16} />,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Journey Guardian',
    desc: 'Someone watches your trip and alerts contacts if you go off-route.',
  },
  {
    icon: <Users size={16} />,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Community Intelligence',
    desc: 'Verified reports from thousands of commuters, updated in real time.',
  },
];

/* ─── Styles (self-contained) ─── */
const S = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    background: '#0B0F14',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  } as React.CSSProperties,

  /* Left panel */
  left: {
    flex: '0 0 50%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
    overflow: 'hidden',
  } as React.CSSProperties,

  leftBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0B0F14 0%, #0d1821 60%, #0B0F14 100%)',
    zIndex: 0,
  } as React.CSSProperties,

  glow1: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
    top: -100,
    left: -100,
    zIndex: 0,
    pointerEvents: 'none',
  } as React.CSSProperties,

  glow2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
    bottom: -80,
    right: -80,
    zIndex: 0,
    pointerEvents: 'none',
  } as React.CSSProperties,

  gridLines: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    zIndex: 0,
    pointerEvents: 'none',
  } as React.CSSProperties,

  /* Right panel */
  right: {
    flex: '0 0 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    borderLeft: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.015)',
  } as React.CSSProperties,

  formWrap: {
    width: '100%',
    maxWidth: 400,
  } as React.CSSProperties,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusField, setFocusField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.token, data.user);
      navigate(data.user.role === 'institution' ? '/institution/overview' : '/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      {/* ── Left Panel ── */}
      <div style={S.left} id="login-hero">
        <div style={S.leftBg} />
        <div style={S.gridLines} />
        <div style={S.glow1} />
        <div style={S.glow2} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.35)',
          }}>
            <Shield size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ color: '#F1F5F9', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            SafeSphere
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: '#F1F5F9',
            marginBottom: 20,
          }}>
            The safest way<br />
            to get{' '}
            <span style={{
              background: 'linear-gradient(90deg, #10B981, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              home.
            </span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 360, marginBottom: 48 }}>
            SafeSphere gives you live safety intelligence for every route — so you can navigate confidently, day or night, alone or with others.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ color: '#E2E8F0', fontSize: '0.88rem', fontWeight: 600, marginBottom: 3 }}>
                    {f.title}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <div style={{ position: 'relative', zIndex: 1, color: '#334155', fontSize: '0.75rem' }}>
          Trusted by thousands of commuters
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={S.right} id="login-form-panel">
        <div style={S.formWrap}>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              color: '#F1F5F9', fontSize: '1.6rem', fontWeight: 700,
              letterSpacing: '-0.03em', marginBottom: 8,
            }}>
              Welcome back
            </h2>
            <p style={{ color: '#475569', fontSize: '0.88rem' }}>
              Sign in to continue.{' '}
              <Link
                to="/register"
                style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}
                aria-label="Create a new account"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* OAuth buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[
              {
                label: 'Google', id: 'btn-google',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: 'Apple', id: 'btn-apple',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F1F5F9">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.4.07 2.37.74 3.18.8.94-.19 1.84-.89 3.29-.95 1.97-.09 3.44.82 4.3 2.05-3.87 2.32-2.99 7.48.98 8.89-.57 1.22-1.26 2.41-3.75 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                ),
              },
            ].map((provider) => (
              <button
                key={provider.label}
                id={provider.id}
                type="button"
                aria-label={`Sign in with ${provider.label}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {provider.icon}
                {provider.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: '#334155', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 7, letterSpacing: '0.01em' }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-label="Email address"
                style={{
                  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                  background: '#111827', border: `1.5px solid ${focusField === 'email' ? '#10B981' : '#2A3441'}`,
                  borderRadius: 10, color: '#F1F5F9', fontSize: '0.92rem',
                  fontFamily: 'inherit', outline: 'none',
                  boxShadow: focusField === 'email' ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label
                  htmlFor="login-password"
                  style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.01em' }}
                >
                  Password
                </label>
                <a href="#" style={{ color: '#475569', fontSize: '0.75rem', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#10B981'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#475569'}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', boxSizing: 'border-box',
                    background: '#111827', border: `1.5px solid ${focusField === 'password' ? '#10B981' : '#2A3441'}`,
                    borderRadius: 10, color: '#F1F5F9', fontSize: '0.92rem',
                    fontFamily: 'inherit', outline: 'none',
                    boxShadow: focusField === 'password' ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', display: 'flex', padding: 4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#475569'}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10,
                color: '#FCA5A5',
                fontSize: '0.83rem',
                lineHeight: 1.5,
              }}
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-signin"
              type="submit"
              disabled={loading}
              aria-label="Sign in to SafeSphere"
              style={{
                width: '100%', padding: '13px 20px', marginTop: 2,
                background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none', borderRadius: 10,
                color: 'white', fontSize: '0.92rem', fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.35)',
                transition: 'all 0.15s ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(16,185,129,0.45)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)';
              }}
              onMouseDown={e => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.985)';
              }}
              onMouseUp={e => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
            >
              {loading
                ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in...</>
                : <><span>Sign In to SafeSphere</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Footer microcopy */}
          <p style={{ textAlign: 'center', marginTop: 28, color: '#334155', fontSize: '0.73rem', lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <a href="#" style={{ color: '#475569', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#475569', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>

          {/* Institution link */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link
              to="/institution/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                color: '#334155', fontSize: '0.78rem', textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#64748B'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#334155'}
            >
              Institution admin? <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive collapse */}
      <style>{`
        @media (max-width: 767px) {
          #login-hero { display: none !important; }
          #login-form-panel {
            flex: 1 !important;
            padding: 40px 24px !important;
            border-left: none !important;
          }
        }
        @media (min-width: 768px) {
          #login-hero { display: flex !important; flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
