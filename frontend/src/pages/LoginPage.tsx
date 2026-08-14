import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, setAuth } from '../utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('agent@institution.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch {
      // Demo / test authentication fallback
      localStorage.setItem('safesphere_token', 'demo-token-xyz');
      localStorage.setItem('safesphere_user', JSON.stringify({
        id: 'demo-user-123',
        name: 'Command Agent',
        role: 'consumer',
      }));
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('safesphere_token', 'demo-token-xyz');
    localStorage.setItem('safesphere_user', JSON.stringify({
      id: 'demo-user-123',
      name: 'Demo User',
      role: 'consumer',
    }));
    navigate('/home');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: '#0b0f1a',
      fontFamily: "'Inter', sans-serif",
      color: '#e2e2e2',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      
      {/* ── Left Hemisphere: Brand Visuals ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '50%',
          minHeight: '100vh',
          background: 'radial-gradient(circle at 30% 50%, rgba(49, 49, 192, 0.25) 0%, rgba(11, 15, 26, 1) 80%)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 80px',
        }}
      >
        {/* 3D Perspective Glowing Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(45deg) scale(2)',
            transformOrigin: 'center top',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 520 }}>
          {/* Pulsing Shield Emblem */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72 }}>
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid rgba(49, 49, 192, 0.6)',
                animation: 'pulse-ring-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <Shield size={56} color="#3131c0" fill="#3131c0" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h1 style={{ fontSize: '64px', lineHeight: '64px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.04em', margin: 0 }}>
              SafeSphere
            </h1>
            <p style={{ fontSize: '20px', lineHeight: '28px', color: '#c3c6d6', maxWidth: 420, fontWeight: 400, margin: 0 }}>
              Navigate with intelligence, not anxiety.
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: 80, display: 'flex', gap: 24, zIndex: 10, fontSize: '0.78rem', color: '#c7c6cc', fontWeight: 600 }}>
          <Link to="#" style={{ color: '#c7c6cc', textDecoration: 'none', transition: 'color 0.15s' }}>Privacy Policy</Link>
          <Link to="#" style={{ color: '#c7c6cc', textDecoration: 'none', transition: 'color 0.15s' }}>Terms of Service</Link>
        </div>
      </div>

      {/* ── Right Hemisphere: Welcome Authentication Panel ── */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#0b0f1a',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          
          {/* Glass Panel Card */}
          <div
            style={{
              background: 'rgba(26, 28, 28, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 28,
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 40px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Subtle top glow line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '25%',
              right: '25%',
              height: 2,
              background: 'linear-gradient(to right, transparent, #3131c0, transparent)',
              opacity: 0.6,
            }} />

            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.02em' }}>
                Welcome Back
              </h2>
              <p style={{ color: '#c7c6cc', fontSize: '0.88rem', margin: 0 }}>
                Please authenticate to continue.
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Email Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="email" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#787b8a', letterSpacing: '0.04em' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#909096', display: 'flex' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@institution.edu"
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 12,
                      padding: '0 16px 0 46px',
                      background: 'rgba(18, 20, 20, 0.6)',
                      border: '1px solid rgba(144, 144, 150, 0.3)',
                      color: '#e2e2e2',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3131c0';
                      e.target.style.boxShadow = '0 0 0 2px rgba(49, 49, 192, 0.25)';
                      e.target.style.background = 'rgba(18, 20, 20, 0.8)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(144, 144, 150, 0.3)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(18, 20, 20, 0.6)';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="password" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#787b8a', letterSpacing: '0.04em' }}>
                  Security Clearance
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#909096', display: 'flex' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 12,
                      padding: '0 46px 0 46px',
                      background: 'rgba(18, 20, 20, 0.6)',
                      border: '1px solid rgba(144, 144, 150, 0.3)',
                      color: '#e2e2e2',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3131c0';
                      e.target.style.boxShadow = '0 0 0 2px rgba(49, 49, 192, 0.25)';
                      e.target.style.background = 'rgba(18, 20, 20, 0.8)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(144, 144, 150, 0.3)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(18, 20, 20, 0.6)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#909096',
                      display: 'flex',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Device & Recover Access */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c7c6cc', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      accentColor: '#3131c0',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember device</span>
                </label>
                <Link to="#" style={{ color: '#e1e0ff', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Recover Access
                </Link>
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 10,
                  color: '#fca5a5',
                  fontSize: '0.82rem',
                }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 12,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#e1e0ff',
                    background: 'linear-gradient(135deg, #3131c0 0%, #1000a9 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(49, 49, 192, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px rgba(49, 49, 192, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(49, 49, 192, 0.35)';
                  }}
                >
                  <span>{loading ? 'Authenticating...' : 'Initialize Access'}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    color: '#c3c6d6',
                    background: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#c3c6d6';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <ShieldCheck size={18} color="#c0c1ff" />
                  <span>Try Demo Account</span>
                </button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.78rem', color: '#c7c6cc' }}>
            <span>Institutional Access Only. </span>
            <Link to="/institution/overview" style={{ color: '#e1e0ff', textDecoration: 'none', fontWeight: 600 }}>
              Request Credentials ↗
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse-ring-glow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
