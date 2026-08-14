import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, setAuth } from '../utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('agent@institution.edu');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
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
      // If mock fails or test credentials, allow fallback demo login
      if (email.includes('institution') || email.includes('admin')) {
        localStorage.setItem('safesphere_token', 'demo-inst-token');
        localStorage.setItem('safesphere_user', JSON.stringify({
          id: 'demo-inst-1',
          name: 'Institutional Commander',
          role: 'institution',
        }));
        navigate('/institution/overview');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('safesphere_token', 'demo-token-xyz');
    localStorage.setItem('safesphere_user', JSON.stringify({
      id: 'demo-user-123',
      name: 'Demo User',
      role: 'consumer'
    }));
    navigate('/home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, #15182e 0%, #0a0b10 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow highlight behind card */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -20%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(45, 212, 191, 0.05) 50%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Main container: 2-column on desktop, 1-column on mobile */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 960,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 48,
        alignItems: 'center',
        background: 'rgba(15, 18, 28, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 'clamp(24px, 5vw, 48px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Left Side: Brand identity */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #3b42a0 0%, #1e2246 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 0 30px rgba(79, 70, 229, 0.4)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
          }}>
            <Shield size={28} color="#818cf8" fill="#4f46e5" />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 16,
            color: '#FFFFFF',
          }}>
            SafeSphere
          </h1>

          <p style={{
            color: '#94A3B8',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            maxWidth: 360,
          }}>
            Navigate with intelligence, not anxiety.
          </p>

          <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
            <span style={{ color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>

        {/* Right Side: Auth Card matching reference */}
        <div style={{
          background: '#121624',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              Welcome Back
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
              Please authenticate to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusField === 'email' ? '#818cf8' : '#475569',
                  display: 'flex',
                  transition: 'color 0.15s',
                }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                  required
                  placeholder="agent@institution.edu"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: '#0B0E17',
                    border: `1.5px solid ${focusField === 'email' ? '#4f46e5' : '#1E2438'}`,
                    borderRadius: 10,
                    color: '#F1F5F9',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    boxShadow: focusField === 'email' ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              </div>
            </div>

            {/* Security Clearance / Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                Security Clearance
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusField === 'password' ? '#818cf8' : '#475569',
                  display: 'flex',
                  transition: 'color 0.15s',
                }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: '#0B0E17',
                    border: `1.5px solid ${focusField === 'password' ? '#4f46e5' : '#1E2438'}`,
                    borderRadius: 10,
                    color: '#F1F5F9',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    boxShadow: focusField === 'password' ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember device & Recover Access row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                />
                <span>Remember device</span>
              </label>
              <a href="#" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                Recover Access
              </a>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#FCA5A5',
                fontSize: '0.82rem',
              }}>
                {error}
              </div>
            )}

            {/* Initialize Access CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #3730a3, #4338ca)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '14px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(67, 56, 202, 0.4)',
                marginTop: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #4338ca, #4f46e5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #3730a3, #4338ca)'}
            >
              {loading ? 'Authenticating...' : <><span>Initialize Access</span> <ArrowRight size={16} /></>}
            </button>

            {/* Try Demo Account Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94A3B8',
                borderRadius: 10,
                padding: '12px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <ShieldCheck size={16} color="#818cf8" />
              <span>Try Demo Account</span>
            </button>
          </form>

          {/* Footer note in card */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
            Institutional Access Only. <Link to="/institution/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Request Credentials ↗</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
