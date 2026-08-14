import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Eye, EyeOff } from 'lucide-react';
import { apiFetch, setAuth } from '../../utils';

export default function InstitutionLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gtbit.edu.in');
  const [password, setPassword] = useState('admin1234');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.token, data.user);
      navigate('/institution/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, marginBottom: 16, boxShadow: '0 8px 30px rgba(79,70,229,0.4)' }}>
            <Shield size={30} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SafeSphere</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>Institutional Safety Intelligence</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 20, padding: 32, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Building2 size={20} color="#4f46e5" />
            <div>
              <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>Institution Login</h2>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Safety dashboard access</p>
            </div>
          </div>

          <div style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 24 }}>
            <p style={{ color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 600 }}>Demo credentials pre-filled</p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>GTBIT Safety Dashboard · admin@gtbit.edu.in</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>Institution Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 42px 12px 16px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'}
                  onBlur={e => e.target.style.borderColor = '#334155'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#dc262622', border: '1px solid #dc262644', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: '0.83rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, boxShadow: '0 4px 16px rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : null}
              {loading ? 'Signing in...' : 'Access Dashboard'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="/login" style={{ color: '#64748b', fontSize: '0.82rem', textDecoration: 'none' }}>← Back to user login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
