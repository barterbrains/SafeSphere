import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { apiFetch, setAuth } from '../utils';

// Brand Shield Badge Component
function SafeSphereShieldLogo({ size = 44 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      border: '1px solid rgba(129, 140, 248, 0.4)',
      boxShadow: '0 0 20px rgba(79, 70, 229, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Shield size={size * 0.55} color="#ffffff" fill="#ffffff" />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  // Clear prefilled values so users see clean placeholders
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      setAuth(data.token, data.user);
      navigate(data.user.role === 'institution' ? '/institution/overview' : '/home');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please check your email and password or use Demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('safesphere_token', 'demo-token-xyz');
    localStorage.setItem('safesphere_user', JSON.stringify({
      id: 'demo-user-123',
      name: 'Command Agent',
      role: 'institution',
    }));
    navigate('/institution/overview');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: '#0a0a12',
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
          background: 'radial-gradient(circle at 30% 50%, rgba(79, 70, 229, 0.22) 0%, rgba(10, 10, 18, 1) 80%)',
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
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 520 }}>
          {/* Pulsing Shield Emblem in Rich Indigo */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76 }}>
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid rgba(79, 70, 229, 0.6)',
                animation: 'pulse-ring-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <SafeSphereShieldLogo size={58} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h1 style={{ fontSize: '64px', lineHeight: '64px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.04em', margin: 0 }}>
              SafeSphere
            </h1>
            <p style={{ fontSize: '20px', lineHeight: '28px', color: '#a5b4fc', maxWidth: 420, fontWeight: 400, margin: 0 }}>
              Navigate with intelligence, not anxiety.
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: 80, display: 'flex', gap: 24, zIndex: 10, fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
          <Link to="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>Privacy Policy</Link>
          <Link to="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>Terms of Service</Link>
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
        background: '#0a0a12',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          
          {/* Glass Panel Card */}
          <div
            style={{
              background: 'rgba(18, 18, 30, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 28,
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(79, 70, 229, 0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Subtle top indigo glow line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '25%',
              right: '25%',
              height: 2,
              background: 'linear-gradient(to right, transparent, #4f46e5, transparent)',
              opacity: 0.8,
            }} />

            <div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.02em' }}>
                Welcome Back
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Please authenticate to access your SafeSphere account.
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* Email Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="email" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    style={{
                      width: '100%',
                      height: 50,
                      borderRadius: 12,
                      padding: '0 16px 0 46px',
                      background: 'rgba(13, 13, 26, 0.8)',
                      border: '1px solid rgba(144, 144, 150, 0.25)',
                      color: '#f1f5f9',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.25)';
                      e.target.style.background = 'rgba(18, 18, 36, 0.9)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(144, 144, 150, 0.25)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(13, 13, 26, 0.8)';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
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
                      height: 50,
                      borderRadius: 12,
                      padding: '0 46px 0 46px',
                      background: 'rgba(13, 13, 26, 0.8)',
                      border: '1px solid rgba(144, 144, 150, 0.25)',
                      color: '#f1f5f9',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.25)';
                      e.target.style.background = 'rgba(18, 18, 36, 0.9)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(144, 144, 150, 0.25)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(13, 13, 26, 0.8)';
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
                      color: '#64748b',
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
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      accentColor: '#4f46e5',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember device</span>
                </label>
                <Link to="#" style={{ color: '#818cf8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Forgot password?
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

              {/* Actions: Sign In Button + Try Demo Account */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 18px rgba(79, 70, 229, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 24px rgba(79, 70, 229, 0.6)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 18px rgba(79, 70, 229, 0.45)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)';
                  }}
                >
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    background: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.12)';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <ShieldCheck size={18} color="#818cf8" />
                  <span>Try Demo Account</span>
                </button>
              </div>

              {/* Dedicated Institutional Login Button in Card */}
              <div style={{
                marginTop: 6,
                paddingTop: 16,
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/institution/login')}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 12,
                    border: '1px solid rgba(129, 140, 248, 0.25)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#a5b4fc',
                    background: 'rgba(79, 70, 229, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.25)';
                    e.currentTarget.style.color = '#a5b4fc';
                  }}
                >
                  <Building2 size={16} />
                  <span>Institutional Command Login</span>
                </button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>Don't have an account? </span>
            <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
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
