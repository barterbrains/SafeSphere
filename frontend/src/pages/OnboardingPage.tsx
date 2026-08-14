import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, ArrowRight, ArrowLeft, Heart, Users, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, completeOnboarding } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Identity
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  // Step 2: Emergency Medical Details (Optional)
  const [bloodType, setBloodType] = useState(profile?.blood_type || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');
  const [medicalConditions, setMedicalConditions] = useState(profile?.medical_conditions || '');

  // Step 3: Trusted Contact (Optional with warning)
  const [hasContact, setHasContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Parent / Family');
  const [contactPerm, setContactPerm] = useState('SOS Only');
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Step 4: Safe Zones (Optional)
  const [homeAddress, setHomeAddress] = useState(profile?.home_address || '');
  const [workSafeZone, setWorkSafeZone] = useState(profile?.work_safe_zone || '');

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid phone number for emergency contact.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    setError('');

    try {
      // 1. If trusted contact was entered, save to Supabase
      if (hasContact && contactName.trim() && contactPhone.trim() && user?.id) {
        await supabase.from('trusted_contacts').insert({
          user_id: user.id,
          name: contactName.trim(),
          phone: contactPhone.trim(),
          relationship: contactRel,
          permission: contactPerm,
          status: 'Accepted',
          enabled: true,
        });
      }

      // 2. Save profile updates with onboarded = true
      const { error: saveError } = await completeOnboarding({
        name: name.trim(),
        phone: phone.trim(),
        blood_type: bloodType || null,
        allergies: allergies.trim() || null,
        medical_conditions: medicalConditions.trim() || null,
        home_address: homeAddress.trim() || null,
        work_safe_zone: workSafeZone.trim() || null,
      });

      if (saveError) {
        setError(saveError);
        setSubmitting(false);
        return;
      }

      // If user skipped contacts, save warning flag for persistent banner
      if (!hasContact || !contactName.trim()) {
        localStorage.setItem('safesphere_dismiss_contact_warning', 'false');
      }

      navigate('/routes');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete setup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-[#111522]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#3730a3] flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Shield size={20} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SafeSphere Guardian Setup</h1>
              <p className="text-xs text-slate-400">Personalize your safety telemetry &amp; SOS protocols</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-400">Step {step} of 4</span>
            <div className="w-24 h-1.5 bg-black/40 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Basic Identity ── */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Basic Identity</h2>
              <p className="text-xs text-slate-400 mt-1">Confirm your name and primary phone number for dispatch verification.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-slate-400 cursor-not-allowed outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="h-12 px-6 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border-none"
              >
                <span>Continue to Medical Info</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Emergency Medical Details (Optional) ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-red-400" />
                <h2 className="text-xl font-extrabold text-white">Emergency Medical Details</h2>
                <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">Optional</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Only disclosed to verified emergency responders and trusted contacts during an active SOS broadcast.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Blood Group</label>
              <select
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="">Select Blood Group (Optional)</option>
                <option value="A+ Positive">A+ Positive</option>
                <option value="A- Negative">A- Negative</option>
                <option value="B+ Positive">B+ Positive</option>
                <option value="B- Negative">B- Negative</option>
                <option value="AB+ Positive">AB+ Positive</option>
                <option value="AB- Negative">AB- Negative</option>
                <option value="O+ Positive">O+ Positive</option>
                <option value="O- Negative">O- Negative</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Known Allergies</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Medical Conditions &amp; Notes</label>
              <input
                type="text"
                value={medicalConditions}
                onChange={e => setMedicalConditions(e.target.value)}
                placeholder="e.g. Asthma (Carries Inhaler), Diabetic"
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-12 px-5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-white/5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-12 px-6 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border-none"
              >
                <span>Continue to Contacts</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Trusted Contacts ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white">Add Trusted Guardian</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Guardians receive automatic SMS telemetry and emergency dispatch coordinates during an SOS.
              </p>
            </div>

            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => { setContactName(e.target.value); setHasContact(true); }}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full h-11 bg-[#111522] border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => { setContactPhone(e.target.value); setHasContact(true); }}
                    placeholder="+91 98111 22334"
                    className="w-full h-11 bg-[#111522] border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={contactRel}
                    onChange={e => setContactRel(e.target.value)}
                    className="w-full h-11 bg-[#111522] border border-white/10 rounded-xl px-3 text-xs text-slate-200 outline-none"
                  >
                    <option value="Parent / Family">Parent / Family</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend / Colleague">Friend / Colleague</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Live Telemetry Permission</label>
                  <select
                    value={contactPerm}
                    onChange={e => setContactPerm(e.target.value)}
                    className="w-full h-11 bg-[#111522] border border-white/10 rounded-xl px-3 text-xs text-slate-200 outline-none"
                  >
                    <option value="SOS Only">SOS Broadcast Only</option>
                    <option value="Active Journeys Only">During Active Journeys Only</option>
                    <option value="Always (24/7 Live)">Always (24/7 Live Location)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skip Warning Notification */}
            {showSkipWarning && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle size={16} />
                  <span>Important Safety Warning</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Without at least one trusted contact, emergency SOS broadcasts cannot reach personal guardians. You can still add contacts anytime from your Profile settings.
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-12 px-5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-white/5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {!contactName.trim() && !showSkipWarning && (
                  <button
                    type="button"
                    onClick={() => setShowSkipWarning(true)}
                    className="h-12 px-4 text-xs font-bold text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    Skip For Now
                  </button>
                )}

                {showSkipWarning && !contactName.trim() && (
                  <button
                    type="button"
                    onClick={() => { setHasContact(false); setStep(4); }}
                    className="h-12 px-4 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer"
                  >
                    Proceed Without Contact →
                  </button>
                )}

                {contactName.trim() && (
                  <button
                    type="button"
                    onClick={() => { setHasContact(true); setStep(4); }}
                    className="h-12 px-6 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border-none"
                  >
                    <span>Continue to Safe Zones</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Recognized Safe Zones (Optional) ── */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white">Recognized Safe Zones</h2>
                <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">Optional</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure your frequent base perimeters so the engine recognizes known-safe territories.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Home Perimeter / Address</label>
              <input
                type="text"
                value={homeAddress}
                onChange={e => setHomeAddress(e.target.value)}
                placeholder="e.g. C-42, Hauz Khas Enclave, New Delhi"
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Work / Campus Safe Zone</label>
              <input
                type="text"
                value={workSafeZone}
                onChange={e => setWorkSafeZone(e.target.value)}
                placeholder="e.g. Barakhamba Road, Connaught Place, New Delhi"
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" />
              <span>You're all set! You can modify or expand any of these details anytime in Settings.</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-12 px-5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-white/5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={submitting}
                className="h-12 px-8 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#6366f1] hover:to-[#4f46e5] text-white text-sm font-extrabold rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer border-none"
              >
                <span>{submitting ? 'Finalizing Setup...' : 'Complete Setup & Enter SafeSphere'}</span>
                <CheckCircle size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
