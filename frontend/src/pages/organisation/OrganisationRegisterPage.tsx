import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Building2, Globe, MapPin, ArrowRight, ArrowLeft,
  UploadCloud, CheckCircle2, Lock, User, Phone,
  Clock, Check, AlertCircle, FileText, CheckSquare, Square
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function OrganisationRegisterPage() {
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

  // ── File Upload Handlers ──
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      newFiles.push({
        name: f.name,
        size: f.size,
        type: f.type,
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Step 3 Final Submission ──
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPolicy) {
      setError('You must accept the Data Usage Policy Agreement to proceed.');
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
          <span>Organisation Command Setup</span>
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
                    placeholder="e.g. Guru Tegh Bahadur Institute of Technology"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>

              {/* Org Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Organization Type
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <select
                    value={orgType}
                    onChange={e => setOrgType(e.target.value)}
                    className="w-full bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none cursor-pointer [&>option]:bg-[#1a1c24] [&>option]:text-white"
                  >
                    <option value="university">University / Higher Education</option>
                    <option value="corporate">Corporate Campus / Enterprise</option>
                    <option value="government">Municipal / Smart City Command</option>
                    <option value="hospital">Healthcare Network / Hospital</option>
                    <option value="ngo">Public Safety / Non-Governmental</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Official Domain */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Official Domain &amp; Network Scope
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <Globe className="absolute left-3.5 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="e.g. gtbit.edu.in or apexglobal.com"
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30"
                />
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-1">
                Used to whitelist member authentication, SOS dispatch routing, and automated Single Sign-On (SSO).
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
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="G-8 Area, Rajouri Garden, New Delhi, Delhi 110064..."
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => navigate('/organisation/login')}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-sm py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(49,49,192,0.4)] flex items-center gap-2 cursor-pointer border border-[#818cf8]/40"
              >
                <span>Continue to Security Setup</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: SECURITY ADMINISTRATOR ── */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Primary Security Officer Name
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                  <User className="absolute left-3.5 text-[#94a3b8]" size={18} />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="e.g. Commander Vikram Singh"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>

              {/* Admin Email */}
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
                    placeholder="security-chief@gtbit.edu.in"
                    className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Master Security Credential (Password)
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <Lock className="absolute left-3.5 text-[#94a3b8]" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30 font-mono"
                />
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Must be at least 6 characters. Two-factor authentication (MFA) will be configured on initial login.
              </p>
            </div>

            {/* Emergency Hotline */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                24/7 Campus Control Room Hotline
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <Phone className="absolute left-3.5 text-[#94a3b8]" size={18} />
                <input
                  type="tel"
                  value={hotlinePhone}
                  onChange={e => setHotlinePhone(e.target.value)}
                  placeholder="+91 (11) 2812-4000"
                  className="w-full bg-transparent border-none text-white pl-11 pr-4 py-3 text-sm focus:outline-none placeholder-white/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
              >
                <ArrowLeft size={14} />
                <span>Back to Details</span>
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-sm py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(49,49,192,0.4)] flex items-center gap-2 cursor-pointer border border-[#818cf8]/40"
              >
                <span>Continue to Verification</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: VERIFICATION & SCALE ── */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-300">
            {/* Legitimacy Documents Drag & Drop */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Legitimacy Documents &amp; Accreditation (Optional in Demo)
              </label>

              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/15 bg-white/[0.02] hover:border-indigo-400/50 hover:bg-white/[0.04]'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white mb-1">Drag and drop accreditation files here</p>
                <p className="text-xs text-[#94a3b8] mb-3">PDF, JPG, PNG up to 15MB per file</p>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-white/10"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Uploaded File Pill List */}
              {files.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-lg px-3.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={15} className="text-indigo-400 shrink-0" />
                        <span className="text-white truncate">{file.name}</span>
                        <span className="text-[#94a3b8] shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-400 hover:text-red-300 ml-2 font-bold cursor-pointer bg-transparent border-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scale Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Expected Operational Scale
              </label>
              <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#3131c0] focus-within:ring-1 focus-within:ring-[#3131c0] transition-all">
                <select
                  value={userScale}
                  onChange={e => setUserScale(e.target.value)}
                  className="w-full bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none cursor-pointer [&>option]:bg-[#1a1c24] [&>option]:text-white"
                >
                  <option value="small">Tier 1: 0 – 500 Active Users (Single Campus Building)</option>
                  <option value="medium">Tier 2: 501 – 5,000 Active Users (Standard College Campus)</option>
                  <option value="large">Tier 3: 5,001 – 25,000 Active Users (Multi-College University)</option>
                  <option value="enterprise">Tier 4: 25,000+ Active Users (Metropolitan / Enterprise Network)</option>
                </select>
              </div>
            </div>

            {/* Data Usage Policy Agreement */}
            <div
              onClick={() => setAgreedPolicy(!agreedPolicy)}
              className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4 cursor-pointer select-none hover:bg-white/[0.05] transition-colors"
            >
              <div className="mt-0.5 text-indigo-400">
                {agreedPolicy ? <CheckSquare size={18} /> : <Square size={18} className="text-[#94a3b8]" />}
              </div>
              <div className="text-xs text-[#94a3b8] leading-relaxed">
                <strong className="text-white block mb-0.5">Data Usage &amp; Privacy Agreement</strong>
                I acknowledge that all telemetry and spatial routing data collected through SafeSphere Institutional Command will be anonymized in compliance with DPDP Act 2023 protocols. Aggregated metrics are used exclusively for institutional safety intelligence.
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
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
              Your organisation's credentials and accreditation documents have been securely transmitted to our enterprise verification team.
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
                onClick={() => navigate('/organisation/login')}
                className="flex-1 bg-gradient-to-r from-[#3131c0] to-[#1000a9] hover:from-[#4338ca] hover:to-[#3131c0] text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-lg border border-[#818cf8]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Organisation Login</span>
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
