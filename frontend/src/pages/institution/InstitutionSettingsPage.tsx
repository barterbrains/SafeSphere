import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstitutionNav } from './InstitutionNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { EditProfileModal, type UserProfileData } from '../../components/EditProfileModal';
import {
  Shield, Bell, Lock, Eye, MapPin, Smartphone,
  Sliders, Download, Trash2, CheckCircle, RefreshCw, LogOut,
  Edit3, User, Heart, Home
} from 'lucide-react';

export default function InstitutionSettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, isDemo, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // ── Settings States ────────────────────────────────────────────────────────
  // 1. Auto-SOS & SafeScore triggers
  const [autoSosMinutes, setAutoSosMinutes] = useState(
    () => localStorage.getItem('safesphere_setting_autosos_mins') || '5'
  );
  const [safeScoreThreshold, setSafeScoreThreshold] = useState(
    () => localStorage.getItem('safesphere_setting_safescore_thresh') || '60'
  );
  const [defaultRouteMode, setDefaultRouteMode] = useState(
    () => localStorage.getItem('safesphere_setting_route_mode') || 'Safest'
  );
  const [checkInFrequency, setCheckInFrequency] = useState(
    () => localStorage.getItem('safesphere_setting_checkin_freq') || 'Every 15 mins'
  );

  // 2. Privacy & Telemetry Granularity
  const [locationGranularity, setLocationGranularity] = useState(
    () => localStorage.getItem('safesphere_setting_loc_granularity') || 'Exact Precision GPS'
  );
  const [autoExpireSharing, setAutoExpireSharing] = useState(
    () => localStorage.getItem('safesphere_setting_auto_expire') || 'Immediately on Journey End'
  );
  const [whoCanSeeHistory, setWhoCanSeeHistory] = useState(
    () => localStorage.getItem('safesphere_setting_history_vis') || 'Only Me'
  );
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState(
    () => localStorage.getItem('safesphere_setting_retention') || '30 Days (Auto-Purge)'
  );

  // 3. Multi-Channel Notifications
  const [notifySosPush, setNotifySosPush] = useState(
    () => localStorage.getItem('safesphere_setting_push') !== 'false'
  );
  const [notifySosSms, setNotifySosSms] = useState(
    () => localStorage.getItem('safesphere_setting_sms') !== 'false'
  );
  const [notifySafeScoreDrop, setNotifySafeScoreDrop] = useState(
    () => localStorage.getItem('safesphere_setting_score_drop') !== 'false'
  );

  // 4. Security & App Preferences
  const [twoFactorAuth, setTwoFactorAuth] = useState(
    () => localStorage.getItem('safesphere_setting_2fa') === 'true'
  );
  const [appUnits, setAppUnits] = useState(
    () => localStorage.getItem('safesphere_setting_units') || 'Kilometers (km)'
  );
  const [appLanguage, setAppLanguage] = useState('English (India)');

  // ── Save Settings ──────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMsg('');

    // Persist to local storage
    localStorage.setItem('safesphere_setting_autosos_mins', autoSosMinutes);
    localStorage.setItem('safesphere_setting_safescore_thresh', safeScoreThreshold);
    localStorage.setItem('safesphere_setting_route_mode', defaultRouteMode);
    localStorage.setItem('safesphere_setting_checkin_freq', checkInFrequency);
    localStorage.setItem('safesphere_setting_loc_granularity', locationGranularity);
    localStorage.setItem('safesphere_setting_auto_expire', autoExpireSharing);
    localStorage.setItem('safesphere_setting_history_vis', whoCanSeeHistory);
    localStorage.setItem('safesphere_setting_retention', dataRetentionPeriod);
    localStorage.setItem('safesphere_setting_push', String(notifySosPush));
    localStorage.setItem('safesphere_setting_sms', String(notifySosSms));
    localStorage.setItem('safesphere_setting_score_drop', String(notifySafeScoreDrop));
    localStorage.setItem('safesphere_setting_2fa', String(twoFactorAuth));
    localStorage.setItem('safesphere_setting_units', appUnits);

    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Safety preferences and privacy protocols updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 400);
  };

  const handleExportData = async () => {
    const exportPayload = {
      user_id: user?.id || 'demo-user',
      email: user?.email || 'demo@safesphere.in',
      is_demo: isDemo,
      preferences: {
        autoSosMinutes,
        safeScoreThreshold,
        defaultRouteMode,
        checkInFrequency,
        locationGranularity,
        autoExpireSharing,
        whoCanSeeHistory,
        dataRetentionPeriod,
        notifySosPush,
        notifySosSms,
        notifySafeScoreDrop,
        twoFactorAuth,
        appUnits,
      },
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safesphere-settings-export-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Settings &amp; Safety Protocols
              {isDemo ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Demo Session
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Account Preferences
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure automated SOS thresholds, live telemetry precision, notification channels, and privacy policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white shadow-[0_4px_18px_rgba(79,70,229,0.45)] transition-all cursor-pointer border-none flex items-center gap-2"
            >
              <CheckCircle size={15} />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>

            <button
              onClick={() => signOut().then(() => navigate('/login'))}
              className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Settings Sections Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          
          {/* Section 0: User Profile & Personal Identity */}
          <div className="lg:col-span-2 bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#3730a3] flex items-center justify-center font-bold text-white text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                {profile?.name?.[0] || (isDemo ? 'A' : 'U')}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{profile?.name || (isDemo ? 'Aarav Sharma' : user?.email?.split('@')[0] || 'User')}</span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {profile?.blood_type ? `Blood: ${profile.blood_type}` : 'Verified Profile'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {user?.email || (isDemo ? 'aarav.sharma@example.com' : '')} {profile?.phone ? `· ${profile.phone}` : ''} {profile?.home_address ? `· ${profile.home_address}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(79,70,229,0.35)] transition-all cursor-pointer border border-[#818cf8]/30"
            >
              <Edit3 size={14} />
              <span>Edit Profile &amp; Medical Info</span>
            </button>
          </div>

          {/* Section 1: Auto-SOS & Proactive Safety Triggers */}
          <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-lg">emergency</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Auto-SOS &amp; Proactive Triggers</h3>
                <p className="text-xs text-slate-400">Automatic dispatch triggers when threat or inactivity is detected.</p>
              </div>
            </div>

            {/* Missed Check-in */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Missed Check-in Auto-SOS</label>
                <p className="text-[11px] text-slate-400">Trigger emergency broadcast if you do not acknowledge prompt within window.</p>
              </div>
              <select
                value={autoSosMinutes}
                onChange={e => setAutoSosMinutes(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="3">After 3 minutes</option>
                <option value="5">After 5 minutes (Recommended)</option>
                <option value="10">After 10 minutes</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* SafeScore Drop Alarm */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">SafeScore Drop Threshold</label>
                <p className="text-[11px] text-slate-400">Alert guardians if real-time corridor score plunges below threshold.</p>
              </div>
              <select
                value={safeScoreThreshold}
                onChange={e => setSafeScoreThreshold(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="50">Below 50 (High Risk)</option>
                <option value="60">Below 60 (Moderate Risk)</option>
                <option value="70">Below 70 (Caution)</option>
              </select>
            </div>

            {/* Default Routing Mode */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Default Route Mode</label>
                <p className="text-[11px] text-slate-400">Prioritize maximum lighting and CCTV security corridors by default.</p>
              </div>
              <select
                value={defaultRouteMode}
                onChange={e => setDefaultRouteMode(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Safest">Safest (Maximum SafeScore)</option>
                <option value="Balanced">Balanced (Safe + Efficient)</option>
                <option value="Fastest">Fastest (Direct Path)</option>
              </select>
            </div>

            {/* Journey Check-In Prompt */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Journey Check-In Frequency</label>
                <p className="text-[11px] text-slate-400">Frequency of ambient wellness confirmation prompts.</p>
              </div>
              <select
                value={checkInFrequency}
                onChange={e => setCheckInFrequency(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Every 10 mins">Every 10 minutes</option>
                <option value="Every 15 mins">Every 15 minutes (Standard)</option>
                <option value="Every 30 mins">Every 30 minutes</option>
                <option value="Only on deviation">Only upon route deviation</option>
              </select>
            </div>
          </div>

          {/* Section 2: Privacy & Telemetry Granularity */}
          <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <span className="material-symbols-outlined text-lg">shield_lock</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Privacy &amp; Telemetry Granularity</h3>
                <p className="text-xs text-slate-400">Granular controls over GPS precision and automatic data purging.</p>
              </div>
            </div>

            {/* Precision */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Live Location Precision</label>
                <p className="text-[11px] text-slate-400">Exact GPS coordinates vs approximate neighborhood sector.</p>
              </div>
              <select
                value={locationGranularity}
                onChange={e => setLocationGranularity(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Exact Precision GPS">Exact Precision GPS</option>
                <option value="General Area (300m)">General Area (300m buffer)</option>
                <option value="Off except SOS">Off (Broadcast only on SOS)</option>
              </select>
            </div>

            {/* Auto-Expiry */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Live Stream Auto-Expiry</label>
                <p className="text-[11px] text-slate-400">Automatic termination of guardian tracking feed.</p>
              </div>
              <select
                value={autoExpireSharing}
                onChange={e => setAutoExpireSharing(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Immediately on Journey End">Immediately on Journey End</option>
                <option value="15 mins after arrival">15 mins after arrival</option>
                <option value="Manual Stop Only">Manual Stop Only</option>
              </select>
            </div>

            {/* History Visibility */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">SafeScore History Visibility</label>
                <p className="text-[11px] text-slate-400">Who can inspect past journeys and score telemetry.</p>
              </div>
              <select
                value={whoCanSeeHistory}
                onChange={e => setWhoCanSeeHistory(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Only Me">Only Me (Private)</option>
                <option value="Trusted Contacts">All Trusted Contacts</option>
                <option value="Emergency Personnel Only">Emergency Personnel Only</option>
              </select>
            </div>

            {/* Data Retention */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-white block">Data Retention Policy</label>
                <p className="text-[11px] text-slate-400">Automatic cryptographic purging of historical GPS logs.</p>
              </div>
              <select
                value={dataRetentionPeriod}
                onChange={e => setDataRetentionPeriod(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="30 Days (Auto-Purge)">30 Days (Standard Auto-Purge)</option>
                <option value="7 Days">7 Days (Strict Privacy)</option>
                <option value="24 Hours">24 Hours (Ephemeral)</option>
                <option value="Never Store">Never Store on Server</option>
              </select>
            </div>
          </div>

          {/* Section 3: Notification Channels */}
          <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">notifications_active</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Multi-Channel Alerts</h3>
                <p className="text-xs text-slate-400">SMS gateway ensures delivery even in areas with weak cellular data.</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">In-App Push Alerts</span>
                <span className="text-[11px] text-slate-400 block">Immediate notifications for ambient safety alerts.</span>
              </div>
              <input
                type="checkbox"
                checked={notifySosPush}
                onChange={e => setNotifySosPush(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Emergency SMS Gateway</span>
                <span className="text-[11px] text-slate-400 block">SMS dispatch to trusted guardians with live GPS coordinates.</span>
              </div>
              <input
                type="checkbox"
                checked={notifySosSms}
                onChange={e => setNotifySosSms(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">SafeScore Plunge Warnings</span>
                <span className="text-[11px] text-slate-400 block">Vibrate &amp; sound alarm when entering unlit or hazard sectors.</span>
              </div>
              <input
                type="checkbox"
                checked={notifySafeScoreDrop}
                onChange={e => setNotifySafeScoreDrop(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Security, Devices & Account Controls */}
          <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <span className="material-symbols-outlined text-lg">security</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Security &amp; Data Ownership</h3>
                <p className="text-xs text-slate-400">Export your telemetry logs or request cryptographic account purge.</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-slate-400 block">Require biometric or OTP verification for guardian changes.</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={e => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Measurement Units</span>
                <span className="text-[11px] text-slate-400 block">Distance and speed measurements.</span>
              </div>
              <select
                value={appUnits}
                onChange={e => setAppUnits(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Kilometers (km)">Kilometers (km)</option>
                <option value="Miles (mi)">Miles (mi)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <button
                onClick={handleExportData}
                className="bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export My Data (JSON)</span>
              </button>

              <button
                onClick={() => alert('Account deletion requested. SafeSphere will cryptographically purge all telemetry within 24 hours.')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          initialProfile={{
            name: profile?.name,
            email: user?.email || '',
            phone: profile?.phone,
            bloodType: profile?.blood_type,
            allergies: profile?.allergies,
            medicalConditions: profile?.medical_conditions,
            homeAddress: profile?.home_address,
            workSafeZone: profile?.work_safe_zone,
          }}
          onSuccess={() => {
            setSuccessMsg('User Profile and emergency medical details updated successfully!');
            setTimeout(() => setSuccessMsg(''), 4500);
          }}
        />
      </main>
    </div>
  );
}
