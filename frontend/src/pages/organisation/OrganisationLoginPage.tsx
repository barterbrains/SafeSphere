import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Building2, Lock, Eye, EyeOff, ArrowRight,
  ArrowLeft, KeyRound, CheckCircle2, AlertCircle, ShieldCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { setAuth } from '../../utils';

export default function OrganisationLoginPage() {
  const navigate = useNavigate();
  const { setInstitutionDemoMode } = useAuth();

  // Step state: 1 = credentials, 2 = MFA 6-digit code
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('admin@gtbit.edu.in');
  const [password, setPassword] = useState('gtbit#safe2026');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaError, setMfaError] = useState('');

  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Instant Demo Login (1-click bypass for evaluation)
  const handleInstantDemoLogin = () => {
    setLoading(true);
    setInstitutionDemoMode();
    setAuth('org-token-verified', {
      id: 'gtbit-org-admin',
      name: 'Command Administrator',
      email: 'admin@gtbit.edu.in',
      role: 'institution',
      organization: 'Guru Tegh Bahadur Institute of Technology (GTBIT)',
    });
    setTimeout(() => {
      setLoading(false);
      navigate('/organisation/dashboard');
    }, 350);
  };

  // Step 1: Validate credentials and move to MFA step
  const handleProceedToMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both organizational email and security credential.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(2);
      // Auto focus first MFA input after state transition
      setTimeout(() => {
        mfaInputRefs.current[0]?.focus();
      }, 80);
    }, 450);
  };

  // Step 2: Handle MFA digit changes & auto-tab
  const handleMfaDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      const cleanDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      if (cleanDigits.length > 0) {
        const next = [...mfaDigits];
        cleanDigits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d;
        });
        setMfaDigits(next);
        const nextFocus = Math.min(index + cleanDigits.length, 5);
        mfaInputRefs.current[nextFocus]?.focus();
        return;
      }
    }

    const digit = val.slice(-1).replace(/\D/g, '');
    const next = [...mfaDigits];
    next[index] = digit;
    setMfaDigits(next);

    if (digit && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaDigits[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Final Verification
  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = mfaDigits.join('');
    if (fullCode.length < 6) {
      setMfaError('Please enter all 6 digits of the authentication token.');
      return;
    }

    setMfaError('');
    setLoading(true);

    setTimeout(() => {
      setInstitutionDemoMode();
      setAuth('org-token-verified', {
        id: 'gtbit-org-admin',
        name: 'Command Administrator',
        email: email.trim(),
        role: 'institution',
        organization: 'Guru Tegh Bahadur Institute of Technology (GTBIT)',
      });
      setLoading(false);
      navigate('/organisation/dashboard');
    }, 600);
  };

  return (
    <div className="bg-[#0a0a12] text-[#e2e2e2] min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Radial command glow effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% -20%, rgba(79, 70, 229, 0.22) 0%, transparent 55%),
            radial-gradient(circle at 50% 120%, rgba(49, 49, 192, 0.15) 0%, transparent 45%)
          `,
        }}
      />

      {/* Decorative background grid pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="w-full max-w-md z-10 flex flex-col gap-6">
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center gap-2 mb-2 cursor-pointer" onClick={() => navigate('/')} title="Return to SafeSphere Home">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f46e5]/30 to-[#312e81]/40 border border-[#818cf8]/40 shadow-[0_0_24px_rgba(79,70,229,0.4)] flex items-center justify-center mb-1 hover:scale-105 transition-transform">
            <Shield className="w-8 h-8 text-[#c0c1ff]" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">SafeSphere</h1>
          <p className="text-[11px] font-bold text-[#c3c6d6] tracking-widest uppercase">Institutional Command</p>
        </div>

        {/* Glassmorphism Card */}
        <div
          className="rounded-2xl p-8 w-full relative transition-all duration-300"
          style={{
            background: 'rgba(26, 28, 38, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 20px 45px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* STEP 1: CREDENTIALS FORM */}
          {step === 1 ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h2 className="text-[19px] font-bold text-white mb-0.5">Institutional Access</h2>
                  <p className="text-[13px] text-[#94a3b8]">Sign in with your verified organizational credentials</p>
                </div>
                <div className="bg-[#3131c0]/30 text-[#b0b2ff] px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border border-[#818cf8]/30">
                  Verified Only
                </div>
              </div>

              {error && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProceedToMfa} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-[#94a3b8]" htmlFor="org-email">
                    Organizational Email
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-[#12141c]/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <Building2 className="absolute left-3.5 text-[#94a3b8]" size={18} />
                    <input
                      id="org-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@yourorganization.edu"
                      className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none text-[14px] placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-[#94a3b8]" htmlFor="org-pwd">
                    Security Credential
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-[#12141c]/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <Lock className="absolute left-3.5 text-[#94a3b8]" size={18} />
                    <input
                      id="org-pwd"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent border-none text-white pl-11 pr-11 py-3 rounded-xl focus:outline-none text-[14px] placeholder-slate-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#94a3b8] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Two-factor authentication required for all institutional accounts
                  </p>
                </div>

                {/* Submit Action */}
                <div className="mt-1 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#4f46e5] to-[#3730a3] hover:from-[#6366f1] hover:to-[#4338ca] text-white font-bold text-[14px] py-3.5 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all duration-200 relative overflow-hidden group cursor-pointer border border-[#818cf8]/30 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Verifying Credentials...
                      </span>
                    ) : (
                      <>
                        <span>Continue to Verification</span>
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-0.5">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">or</span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>

                  {/* Instant Organisation Demo Login Button */}
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    disabled={loading}
                    className="w-full bg-white/[0.04] hover:bg-indigo-600/20 border border-white/15 hover:border-indigo-500/50 text-white font-bold text-[13px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm group"
                  >
                    <ShieldCheck size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>Use Organisation Demo Account</span>
                    <Sparkles size={14} className="text-amber-400" />
                  </button>
                </div>
              </form>

              {/* Bottom Quick Links */}
              <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/10 text-[12px]">
                <button
                  type="button"
                  onClick={() => navigate('/organisation/register')}
                  className="text-indigo-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 font-medium"
                >
                  Register your organization
                </button>
                <button
                  type="button"
                  onClick={() => alert('Password reset links must be authorized by your campus Security Systems Administrator.')}
                  className="text-[#94a3b8] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: MFA 6-DIGIT VERIFICATION CODE */
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#94a3b8] hover:text-white transition-colors mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase cursor-pointer bg-transparent border-none p-0 w-fit"
              >
                <ArrowLeft size={14} />
                <span>Return to credentials</span>
              </button>

              <div>
                <h2 className="text-[19px] font-bold text-white mb-0.5 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  Verification Required
                </h2>
                <p className="text-[13px] text-[#94a3b8]">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {mfaError && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{mfaError}</span>
                </div>
              )}

              {/* Demo Hint Banner with 1-click quick fill */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-[12px] text-indigo-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Demo Key (<strong>782490</strong>)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaDigits(['7', '8', '2', '4', '9', '0'])}
                  className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/40 cursor-pointer"
                >
                  Quick Fill
                </button>
              </div>

              <form onSubmit={handleVerifyMfa} className="flex flex-col gap-5">
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-2">
                  {mfaDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { mfaInputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={e => handleMfaDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleMfaKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-[#12141c]/90 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none transition-all font-mono"
                    />
                  ))}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#4f46e5] to-[#3730a3] hover:from-[#6366f1] hover:to-[#4338ca] text-white font-bold text-[14px] py-3.5 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all duration-200 cursor-pointer border border-[#818cf8]/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Authenticating Session...
                    </span>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-1">
                <button
                  type="button"
                  onClick={() => alert('Please contact your organization IT Helpdesk to reset your MFA authenticator device.')}
                  className="text-[12px] text-[#94a3b8] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  Trouble accessing your authenticator? Contact support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center flex flex-col gap-2 px-4">
          <p className="text-[11px] text-[#64748b] max-w-sm mx-auto leading-relaxed">
            Institutional accounts are subject to mandatory two-factor authentication and session monitoring for security compliance.
          </p>
          <div className="flex justify-center gap-3 mt-1 text-[11px] text-[#94a3b8]">
            <Link to="/#about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/#about" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/#about" className="hover:text-white transition-colors">Data Usage Agreement</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
