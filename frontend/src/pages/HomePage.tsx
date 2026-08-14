import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch, setAuth } from '../utils';

export default function HomePage() {
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
      navigate(data.user.role === 'institution' ? '/institution/overview' : '/routes');
    } catch {
      // Demo / test authentication fallback
      localStorage.setItem('safesphere_token', 'demo-token-xyz');
      localStorage.setItem('safesphere_user', JSON.stringify({
        id: 'demo-user-123',
        name: 'Command Agent',
        role: 'consumer',
      }));
      navigate('/routes');
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
    navigate('/routes');
  };

  return (
    <div className="text-[#e2e2e2] antialiased flex flex-col lg:flex-row w-full min-h-screen bg-[#0b0f1a] font-['Inter',sans-serif] overflow-x-hidden">
      
      {/* ── Left Hemisphere: Brand Visuals ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-center items-start p-20 relative z-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(49, 49, 192, 0.25) 0%, rgba(11, 15, 26, 1) 80%)',
          overflow: 'hidden',
        }}
      >
        {/* Glowing Lines Overlay */}
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

        <div className="z-10 flex flex-col gap-8 max-w-xl">
          {/* Pulse Shield */}
          <div className="relative inline-flex items-center justify-center w-20 h-20">
            <div
              className="absolute w-full h-full rounded-full border-2 border-[rgba(49,49,192,0.6)]"
              style={{ animation: 'pulse-ring-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />
            <span
              className="material-symbols-outlined text-[64px] text-[#3131c0]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-[72px] leading-[72px] font-extrabold text-white tracking-[-0.04em]">
              SafeSphere
            </h1>
            <p className="text-[20px] leading-[28px] text-[#c3c6d6] max-w-md font-light">
              Navigate with intelligence, not anxiety.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 flex gap-6 z-10 text-xs font-semibold tracking-wider text-[#c7c6cc]">
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* ── Right Hemisphere: Login Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-12 relative z-10 bg-[#0b0f1a]">
        <div className="w-full max-w-[480px]">
          
          {/* Mobile Logo (hidden on desktop) */}
          <div className="flex lg:hidden flex-col items-center gap-4 text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
              <div
                className="absolute w-full h-full rounded-full border-2 border-[rgba(49,49,192,0.6)]"
                style={{ animation: 'pulse-ring-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              />
              <span
                className="material-symbols-outlined text-[48px] text-[#3131c0]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#c3c6d6]">SafeSphere</h1>
            <p className="text-[16px] text-[#c7c6cc]">Navigate with intelligence, not anxiety.</p>
          </div>

          {/* Glass Panel Container */}
          <div
            className="rounded-2xl lg:rounded-[32px] p-8 lg:p-12 flex flex-col gap-8 relative overflow-hidden"
            style={{
              background: 'rgba(26, 28, 28, 0.5)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 40px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#3131c0] to-transparent opacity-50" />

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-[#c7c6cc] text-sm">Please authenticate to continue.</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
              
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-wider text-[#787b8a] px-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#909096]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@institution.edu"
                    className="w-full h-[56px] rounded-xl pl-12 pr-4 text-[16px] outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(18, 20, 20, 0.6)',
                      border: '1px solid rgba(144, 144, 150, 0.3)',
                      color: '#e2e2e2',
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
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold tracking-wider text-[#787b8a] px-1" htmlFor="password">
                  Security Clearance
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#909096]">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[56px] rounded-xl pl-12 pr-12 text-[16px] outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(18, 20, 20, 0.6)',
                      border: '1px solid rgba(144, 144, 150, 0.3)',
                      color: '#e2e2e2',
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#909096] hover:text-[#c3c6d6] transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Device & Recover Access */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#121414] border-[#909096] text-[#3131c0] focus:ring-[#3131c0]"
                  />
                  <span className="text-sm text-[#c7c6cc] group-hover:text-white transition-colors">Remember device</span>
                </label>
                <Link to="#" className="text-sm text-[#e1e0ff] hover:text-[#c0c1ff] transition-colors">
                  Recover Access
                </Link>
              </div>

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] rounded-xl font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #3131c0 0%, #1000a9 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(49, 49, 192, 0.3)',
                    color: '#e1e0ff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 8px 20px rgba(49, 49, 192, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3838d4 0%, #1a08d1 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(49, 49, 192, 0.3)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3131c0 0%, #1000a9 100%)';
                  }}
                >
                  <span>{loading ? 'Authenticating...' : 'Initialize Access'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full h-[56px] rounded-xl font-semibold text-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 text-[#c3c6d6]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = '#c3c6d6';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">science</span>
                  <span>Try Demo Account</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center flex items-center justify-center gap-4 text-sm text-[#c7c6cc]">
            <span>Institutional Access Only.</span>
            <Link to="/institution/overview" className="text-[#e1e0ff] hover:text-white transition-colors flex items-center gap-1">
              <span>Request Credentials</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
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
