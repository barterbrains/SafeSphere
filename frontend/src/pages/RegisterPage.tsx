import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { error: signUpError } = await signUp(email.trim(), password, name.trim(), 'consumer');
    setLoading(false);
    if (signUpError) {
      if (signUpError.toLowerCase().includes('rate limit') || signUpError.toLowerCase().includes('email rate')) {
        setError('Too many sign-up attempts. Please wait a few minutes and try again.');
      } else if (signUpError.toLowerCase().includes('already registered') || signUpError.toLowerCase().includes('user already')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(signUpError);
      }
      return;
    }
    setEmailSent(true);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg('');
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    setResendLoading(false);
    setResendMsg(error ? 'Could not resend — try again in a minute.' : 'Confirmation email resent! Check your inbox.');
  };

  // ── Email Confirmation Screen ─────────────────────────────────────────────
  if (emailSent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', padding: 24, fontFamily: "'Inter', sans-serif", color: '#e2e2e2' }}>
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ background: 'rgba(18, 18, 30, 0.75)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxShadow: '0 24px 50px -12px rgba(0,0,0,0.6)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={32} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Check Your Email</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                We sent a confirmation link to<br />
                <strong style={{ color: '#e2e8f0' }}>{email}</strong><br />
                Click the link in that email to activate your account, then come back here to sign in.
              </p>
            </div>

            <div style={{ width: '100%', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 12, padding: '14px 16px', fontSize: '0.82rem', color: '#a5b4fc', lineHeight: 1.5, textAlign: 'left' }}>
              📬 <strong>Didn't get it?</strong> Check your spam/junk folder, or use the button below to resend.
            </div>

            {resendMsg && (
              <div style={{ width: '100%', padding: '10px 14px', background: resendMsg.includes('resent') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${resendMsg.includes('resent') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, color: resendMsg.includes('resent') ? '#6ee7b7' : '#fca5a5', fontSize: '0.82rem' }}>
                {resendMsg}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', opacity: resendLoading ? 0.6 : 1 }}
            >
              {resendLoading ? 'Resending...' : '📨 Resend Confirmation Email'}
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #3730a3)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              I've confirmed — Sign In <ArrowRight size={16} />
            </button>

            <p style={{ color: '#475569', fontSize: '0.78rem', margin: 0 }}>After confirming your email, sign in using your credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────────────────
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

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', height: 50, borderRadius: 12, border: '1px solid rgba(129,140,248,0.35)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 18px rgba(79,70,229,0.45)', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'all 0.2s', fontFamily: 'inherit' }}
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
