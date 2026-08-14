import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Building2, Globe, MapPin, ArrowRight, ArrowLeft,
  UploadCloud, FileText, CheckCircle2, Lock, User, Phone,
  Clock, Check, AlertCircle, File
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function InstitutionRegisterPage() {
  const navigate = useNavigate();

  // Wizard state: 1 = Details, 2 = Security Admin, 3 = Verification & Scale, 4 = Under Review
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 Form fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('university');
  const [domain, setDomain] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 Form fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');

  // Step 3 Form fields
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: 'institution_accreditation_certificate.pdf', size: 2450000, type: 'application/pdf' },
  ]);
  const [userScale, setUserScale] = useState('medium');
  const [agreedPolicy, setAgreedPolicy] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1 Validation & Next ──
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Please enter the official organization name.');
      return;
    }
    if (!domain.trim()) {
      setError('Please provide your organization domain (e.g. gtbit.edu.in).');
      return;
    }
    setError('');
    setStep(2);
  };

  // ── Step 2 Validation & Next ──
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      setError('Please enter primary security administrator details.');
      return;
    }
    if (password.length < 6) {
      setError('Security credential must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(3);
  };

  // ── Step 3 File Upload Handlers ──
  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const added: UploadedFile[] = Array.from(newFiles).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles(prev => [...prev, ...added]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // ── Final Submission ──
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPolicy) {
      setError('You must acknowledge the Data Usage Policy to complete institutional registration.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1200);
  };

  return (
    <div
      className="bg-[#121414] text-[#e2e2e2] min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden font-['Inter',sans-serif]"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(49, 49, 192, 0.18) 0%, rgba(18, 20, 20, 1) 50%)',
      }}
    >
      {/* Background SVG Grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-2xl px-4 py-4 flex justify-between items-center z-10 relative mb-2">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-[#c3c6d6] cursor-pointer hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#3131c0]/40 border border-[#818cf8]/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#c0c1ff]" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-white">SafeSphere</span>
        </div>
        <div className="flex items-center gap-2 text-[#94a3b8] text-[12px] font-semibold tracking-wider uppercase">
          <span>Institutional Command Setup</span>
          <span className="text-white/20">/</span>
          <span className="text-indigo-400 font-bold">
            {step === 4 ? 'Complete' : `Step ${step} of 3`}
          </span>
        </div>
      </header>

      {/* Main Registration Container */}
      <div
        className="w-full max-w-2xl p-6 md:p-10 z-10 relative rounded-2xl transition-all duration-300"
        style={{
          background: 'rgba(18, 20, 20, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Progress Indicator (Steps 1-3) */}
        {step < 4 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                Institutional Registration
              </h1>
              <p className="text-sm text-[#94a3b8]">
                Configure your organizational safety &amp; emergency dispatch command center.
              </p>
            </div>

            <div className="flex items-center justify-center px-4 md:px-12">
              {/* Step 1 Pill */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 1 ? 'bg-[#3131c0] text-[#c0c1ff] shadow-[0_0_15px_rgba(49,49,192,0.5)]' : 'bg-white/5 text-[#94a3b8] border border-white/10'
                  }`}
                >
                  {step > 1 ? <Check size={18} /> : '1'}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mt-2">
                  Details
                </span>
              </div>

              <div className={`h-[2px] flex-1 mx-3 transition-colors ${step >= 2 ? 'bg-[#3131c0]' : 'bg-white/10'}`} />

              {/* Step 2 Pill */}
              <div className={`flex flex-col items-center ${step < 2 ? 'opacity-50' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 2 ? 'bg-[#3131c0] text-[#c0c1ff] shadow-[0_0_15px_rgba(49,49,192,0.5)]' : 'bg-white/5 text-[#94a3b8] border border-white/10'
                  }`}
                >
                  {step > 2 ? <Check size={18} /> : '2'}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mt-2">
                  Security
                </span>
              </div>

              <div className={`h-[2px] flex-1 mx-3 transition-colors ${step >= 3 ? 'bg-[#3131c0]' : 'bg-white/10'}`} />

              {/* Step 3 Pill */}
              <div className={`flex flex-col items-center ${step < 3 ? 'opacity-50' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 3 ? 'bg-[#3131c0] text-[#c0c1ff] shadow-[0_0_15px_rgba(49,49,192,0.5)]' : 'bg-white/5 text-[#94a3b8] border border-white/10'
                  }`}
                >
                  3
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mt-2">
                  Verification
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: ORGANIZATION DETAILS ── */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Org Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Organization Name
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <Building2 className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. GTBIT University Campus"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Org Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Organization Type
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <Globe className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <select
                    value={orgType}
                    onChange={e => setOrgType(e.target.value)}
                    className="w-full bg-[#16181e] border-none text-white pl-11 pr-10 py-3 text-sm focus:outline-none appearance-none rounded-xl"
                  >
                    <option value="university">University / Higher Education</option>
                    <option value="corporate">Corporate Enterprise / Tech Park</option>
                    <option value="government">Municipal / Emergency Services</option>
                    <option value="ngo">Non-Governmental Safety Organization</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Official Domain */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Official Domain
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <Globe className="absolute left-3.5 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="e.g. gtbit.edu.in or apexglobal.com"
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-medium"
                />
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-1">
                Used for automated institutional staff email verification and SSO federation.
              </p>
            </div>

            {/* Registered HQ Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Registered Campus / HQ Address
              </label>
              <div className="relative flex items-start rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <MapPin className="absolute left-3.5 top-3.5 text-[#94a3b8]" size={18} />
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. G-8 Area, Rajouri Garden, New Delhi, Delhi 110064"
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 resize-none font-medium"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => navigate('/institution/login')}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-sm py-3 px-7 rounded-xl transition-all shadow-[0_0_20px_rgba(49,49,192,0.4)] flex items-center gap-2 cursor-pointer border border-[#818cf8]/30"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: SECURITY & ADMIN CREDENTIALS ── */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Security Director / Admin Name
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <User className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="Dr. Rajesh Mehta"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Admin Work Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Official Administrative Email
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <Building2 className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@gtbit.edu.in"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Security Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Master Security Credential
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <Lock className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* Emergency Hotline Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  24/7 Campus Dispatch Hotline
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <Phone className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="tel"
                    required
                    value={hotlinePhone}
                    onChange={e => setHotlinePhone(e.target.value)}
                    placeholder="+91 (11) 2852-1234"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-slate-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                All administrative accounts receive hardware-backed 2FA tokens and continuous role-based audit logging.
              </span>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={16} />
                Back to Details
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-sm py-3 px-7 rounded-xl transition-all shadow-[0_0_20px_rgba(49,49,192,0.4)] flex items-center gap-2 cursor-pointer border border-[#818cf8]/30"
              >
                <span>Continue to Verification</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: VERIFICATION DOCUMENTS & SCALE ── */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-300">
            {/* File Upload Widget */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Legitimacy Documents &amp; Accreditations
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer border border-dashed transition-all ${
                  isDragOver
                    ? 'border-[#c0c1ff] bg-indigo-500/10'
                    : 'border-white/20 bg-white/[0.02] hover:border-indigo-400 hover:bg-white/[0.04]'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-indigo-400 mb-2" />
                <p className="text-sm font-semibold text-white mb-0.5">Drag and drop verification files here</p>
                <p className="text-xs text-[#94a3b8] mb-3">Institutional accreditation, registration deed, or authorization letter (PDF, JPG, PNG up to 10MB)</p>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors border border-white/15"
                >
                  <FileText size={14} />
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded File List */}
              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <File className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-white font-medium truncate">{file.name}</span>
                      </div>
                      <span className="text-[#94a3b8] font-mono shrink-0 ml-2">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scale Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Expected Operational User Scale
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] transition-all">
                <select
                  value={userScale}
                  onChange={e => setUserScale(e.target.value)}
                  className="w-full bg-[#16181e] border-none text-white px-4 py-3 text-sm focus:outline-none appearance-none rounded-xl"
                >
                  <option value="small">0 – 500 Active Campus / Fleet Users</option>
                  <option value="medium">501 – 5,000 Active Users (Standard College / Enterprise)</option>
                  <option value="large">5,001 – 25,000 Active Users (Major University / Metro District)</option>
                  <option value="enterprise">25,000+ Multi-Campus Enterprise Deployment</option>
                </select>
              </div>
            </div>

            {/* Data Usage Policy Checkbox */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3 mt-2">
              <input
                id="data-policy"
                type="checkbox"
                checked={agreedPolicy}
                onChange={e => setAgreedPolicy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 text-[#3131c0] focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="data-policy" className="text-xs font-bold text-white cursor-pointer">
                  Data Usage Policy &amp; Privacy Agreement
                </label>
                <p className="text-[12px] text-[#94a3b8] leading-relaxed">
                  I acknowledge that all telemetry and spatial data collected through the SafeSphere Institutional platform is strictly anonymized in compliance with enterprise privacy protocols and utilized solely for collective safety analytics.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={16} />
                Back to Security
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-sm py-3 px-8 rounded-xl transition-all shadow-[0_0_25px_rgba(49,49,192,0.5)] flex items-center gap-2 cursor-pointer border border-[#818cf8]/40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Transmitting Application...
                  </span>
                ) : (
                  <>
                    <span>Complete Submission</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: APPLICATION UNDER REVIEW CONFIRMATION ── */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Glowing Police / Shield Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#3131c0]/30 blur-2xl animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-[#1e2028] border border-[#818cf8]/40 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                <Shield className="w-14 h-14 text-[#c0c1ff]" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              Application Under Review
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-md mb-6 leading-relaxed">
              Your institution's credentials and accreditation documents have been securely transmitted to our enterprise verification team.
            </p>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 max-w-md text-left flex items-start gap-4 mb-8">
              <Clock className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white mb-1">Estimated Provisioning Timeline</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  We will review your documentation and establish your dedicated Command Center instance within <strong className="text-indigo-300 font-semibold">24–48 hours</strong>. You will receive an activation SMS and email.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                onClick={() => navigate('/institution/login')}
                className="flex-1 bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-lg border border-[#818cf8]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Institutional Login</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>SafeSphere Home</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-[11px] text-[#64748b] z-10 relative">
        <p>Protected by SafeSphere Enterprise 256-bit Encryption · All rights reserved</p>
      </footer>
    </div>
  );
}
