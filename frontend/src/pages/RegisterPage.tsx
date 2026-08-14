import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { error: signUpError } = await signUp(email.trim(), password, name.trim(), 'consumer');
    setLoading(false);
    if (signUpError) {
      // Supabase free tier caps email sends — show a helpful message
      if (signUpError.toLowerCase().includes('rate limit') || signUpError.toLowerCase().includes('email rate')) {
        setError('Too many sign-up attempts. Please wait a few minutes and try again, or contact support.');
      } else {
        setError(signUpError);
      }
      return;
    }
    setSuccess('Account created! You can now sign in directly.');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', padding: 24, fontFamily: "'Inter', sans-serif", color: '#e2e2e2' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: 'rgba(18, 18, 30, 0.75)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 24px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>

          {/* Header */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, cursor: 'pointer' }}
            title="Return to SafeSphere Home"
          >
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4f46e5, #3730a3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(79,70,229,0.4)' }}>
              <Shield size={22} color="white" fill="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>SafeSphere</h1>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>Create your account</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>Get Started</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '-12px 0 0' }}>Navigate smarter and safer across New Delhi NCR</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8', letterSpacing: '0.04em' }}>Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Priya Sharma" required
                style={{ width: '100%', height: 50, borderRadius: 12, padding: '0 16px', background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(144,144,150,0.25)', color: '#f1f5f9', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 2px rgba(79,70,229,0.25)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(144,144,150,0.25)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8', letterSpacing: '0.04em' }}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{ width: '100%', height: 50, borderRadius: 12, padding: '0 16px', background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(144,144,150,0.25)', color: '#f1f5f9', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 2px rgba(79,70,229,0.25)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(144,144,150,0.25)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8', letterSpacing: '0.04em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required
                  style={{ width: '100%', height: 50, borderRadius: 12, padding: '0 46px 0 16px', background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(144,144,150,0.25)', color: '#f1f5f9', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 2px rgba(79,70,229,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(144,144,150,0.25)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#6ee7b7', fontSize: '0.82rem' }}>
                {success}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', height: 50, borderRadius: 12, border: '1px solid rgba(129,140,248,0.35)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 18px rgba(79,70,229,0.45)', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'all 0.2s' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
