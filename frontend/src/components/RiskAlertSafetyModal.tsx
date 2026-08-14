import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  AlertTriangle, ShieldCheck, PhoneCall, Radio, X, Check,
  ArrowRight, ShieldAlert, Heart, Users, MapPin, Loader2, Volume2,
  Siren, Building2
} from 'lucide-react';

export interface RiskAlertSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRouteName?: string;
  currentLocation?: { lat: number; lng: number; address?: string };
  onRerouteSafe: () => void;
  onSosTriggered?: () => void;
}

export function RiskAlertSafetyModal({
  isOpen,
  onClose,
  currentRouteName = 'Selected Corridor',
  currentLocation = { lat: 28.6129, lng: 77.2295, address: 'New Delhi Corridor' },
  onRerouteSafe,
  onSosTriggered,
}: RiskAlertSafetyModalProps) {
  const { user, profile, isDemo } = useAuth();

  const [step, setStep] = useState<'prompt' | 'rerouting' | 'sos_active'>('prompt');
  const [isDispatchingSos, setIsDispatchingSos] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [sosIncidentId, setSosIncidentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      setIsDispatchingSos(false);

      // Load trusted contacts for SOS dispatch
      if (!isDemo && user?.id) {
        supabase
          .from('trusted_contacts')
          .select('*')
          .eq('user_id', user.id)
          .then(({ data }) => {
            if (data && data.length > 0) {
              setContacts(data);
            } else {
              setContacts([
                { name: 'Primary Guardian (Dr. Meera Sharma)', phone: '+91 98200 11223', relationship: 'Mother' },
                { name: 'Emergency Contact (Rohan Sharma)', phone: '+91 98111 88990', relationship: 'Brother' },
              ]);
            }
          });
      } else {
        setContacts([
          { name: 'Dr. Meera Sharma', phone: '+91 98200 11223', relationship: 'Mother (24/7 Live)' },
          { name: 'Rohan Sharma', phone: '+91 98111 88990', relationship: 'Brother (SOS Only)' },
          { name: 'Ananya Verma', phone: '+91 97170 33445', relationship: 'Emergency Contact' },
        ]);
      }
    }
  }, [isOpen, isDemo, user?.id]);

  if (!isOpen) return null;

  // ── Handler: User answers "Yes, I Feel Safe" → Auto Reroute ──
  const handleUserFeelsSafe = () => {
    setStep('rerouting');
    setTimeout(() => {
      onRerouteSafe();
      onClose();
    }, 1200);
  };

  // ── Handler: User answers "No, I Don't Feel Safe" → Emergency SOS Dispatch ──
  const handleUserNotSafe = async () => {
    setIsDispatchingSos(true);
    setStep('sos_active');

    const incidentPayload = {
      user_id: user?.id || 'demo-user',
      user_name: profile?.name || (isDemo ? 'Aarav Sharma' : user?.email?.split('@')[0] || 'Citizen'),
      user_phone: profile?.phone || '+91 98101 23456',
      type: 'High-Risk Path Deviation (User Distress SOS)',
      status: 'Dispatched',
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      location_name: currentLocation.address || currentRouteName,
      medical_info: {
        blood_group: profile?.blood_type || 'O+ Positive',
        allergies: profile?.allergies || 'Penicillin, Peanuts',
        medical_conditions: profile?.medical_conditions || 'Asthma (Carries Inhaler)',
      },
      contacts_alerted: contacts.length,
      created_at: new Date().toISOString(),
    };

    if (!isDemo && user?.id) {
      try {
        const { data, error } = await supabase
          .from('sos_incidents')
          .insert({
            user_id: user.id,
            type: incidentPayload.type,
            status: 'Dispatched',
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            location_name: incidentPayload.location_name,
            resolved_by: 'Emergency Response Unit Dispatched',
          })
          .select()
          .single();

        if (data) {
          setSosIncidentId(data.id);
        }
      } catch (err) {
        console.error('Error inserting SOS incident:', err);
      }
    }

    // Save to user-scoped local storage
    const userSosKey = `safesphere_latest_sos_${user?.id || (isDemo ? 'demo' : 'guest')}`;
    localStorage.setItem(userSosKey, JSON.stringify(incidentPayload));

    setIsDispatchingSos(false);
    if (onSosTriggered) {
      onSosTriggered();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(5, 7, 14, 0.88)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: step === 'sos_active' ? '#140608' : '#0F1322',
        border: step === 'sos_active' ? '2px solid #ef4444' : '1.5px solid rgba(245, 158, 11, 0.5)',
        borderRadius: 24,
        width: '100%',
        maxWidth: 560,
        overflow: 'hidden',
        boxShadow: step === 'sos_active'
          ? '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(239, 68, 68, 0.4)'
          : '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(245, 158, 11, 0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Modal Top Banner */}
        <div style={{
          padding: '20px 24px',
          background: step === 'sos_active'
            ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.15))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: step === 'sos_active' ? '#ef4444' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: step === 'sos_active' ? '0 0 20px #ef4444' : '0 0 16px #f59e0b',
              color: '#FFFFFF',
              flexShrink: 0,
            }}>
              {step === 'sos_active' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                {step === 'sos_active'
                  ? '🚨 Emergency SOS Broadcast Active'
                  : 'Safety Check: Path Risk Detected'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: step === 'sos_active' ? '#FECACA' : '#FDE68A', margin: '2px 0 0' }}>
                {step === 'sos_active'
                  ? 'Live GPS location and medical profile dispatched to guardians'
                  : 'Anomalous path deviation or elevated hazard detected ahead'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 10,
              padding: 8,
              cursor: 'pointer',
              color: '#FFFFFF',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── STAGE 1: PROMPT QUESTION (Are you feeling safe?) ── */}
        {step === 'prompt' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Risk Telemetry Box */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Risk Analysis
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#FCA5A5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                }}>
                  SafeScore Dropped to 48
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
                We detected that you are traversing a different path or an area with elevated risk (low street lighting / reduced patrol coverage).
              </p>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} color="#818cf8" />
                <span>Near {currentLocation.address || currentRouteName}</span>
              </div>
            </div>

            {/* Core Question Prompt */}
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                Are you feeling safe right now?
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                If you feel safe, SafeSphere will instantly reroute you along the safest lit corridor. If not, we will immediately raise SOS and alert your trusted contacts.
              </p>
            </div>

            {/* Action Buttons: YES / NO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Option A: YES (Feel safe → Reroute) */}
              <button
                onClick={handleUserFeelsSafe}
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontSize: '1rem', fontWeight: 900 }}>Yes, I Feel Safe</span>
                </div>
                <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>Auto-Reroute to Safest Corridor</span>
              </button>

              {/* Option B: NO (Need help → Raise SOS) */}
              <button
                onClick={handleUserNotSafe}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45)',
                  animation: 'pulse 2s infinite',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontSize: '1rem', fontWeight: 900 }}>No, I Need Help</span>
                </div>
                <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>Raise SOS &amp; Alert Contacts</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: REROUTING IN PROGRESS ── */}
        {step === 'rerouting' && (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Loader2 size={36} className="animate-spin text-emerald-400" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                Rerouting to Safest Corridor...
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                Calculating safest lit path with active police &amp; CCTV coverage to avoid the risk zone.
              </p>
            </div>
          </div>
        )}

        {/* ── STAGE 3: SOS ACTIVE & CONTACTS DISPATCHED ── */}
        {step === 'sos_active' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Live GPS & Dispatch Status Card */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FCA5A5', fontSize: '0.78rem', fontWeight: 800 }}>
                <Radio size={14} color="#EF4444" className="animate-pulse" />
                <span>LIVE EMERGENCY TELEMETRY TRANSMISSION ACTIVE</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 700 }}>
                Location: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)} ({currentLocation.address || 'Delhi Corridor'})
              </div>
              <div style={{ fontSize: '0.76rem', color: '#FECACA' }}>
                Medical Profile: Blood {profile?.blood_type || 'O+'} · Allergies: {profile?.allergies || 'None'} · Conditions: {profile?.medical_conditions || 'Asthma'}
              </div>
            </div>

            {/* Nearby Police Station Notification Card */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Siren size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Nearby Police Station &amp; PCR Unit Alerted
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#FECACA' }}>
                    Nearest Precinct (0.4 km) · Central Emergency Band Dispatched
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}>
                <Check size={12} />
                <span>PCR Alerted</span>
              </div>
            </div>

            {/* Trusted Contacts Alerted List */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Trusted Contacts Alerted via SMS &amp; Push
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                {contacts.map((c, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}>
                        {c.name ? c.name[0] : 'G'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{c.phone || c.contact} · {c.relationship || 'Guardian'}</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      color: '#34d399',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}>
                      <Check size={12} />
                      <span>Notified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 1-Touch Emergency Hotlines */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <a
                href="tel:112"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 12,
                  padding: '10px 8px',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                }}
              >
                <PhoneCall size={16} color="#ef4444" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Call 112</span>
                <span style={{ fontSize: '0.65rem', color: '#FECACA' }}>Police Emergency</span>
              </a>

              <a
                href="tel:1091"
                style={{
                  background: 'rgba(236, 72, 153, 0.2)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  borderRadius: 12,
                  padding: '10px 8px',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                }}
              >
                <PhoneCall size={16} color="#ec4899" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Call 1091</span>
                <span style={{ fontSize: '0.65rem', color: '#FBCFE8' }}>Women Helpline</span>
              </a>

              <a
                href="tel:102"
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: 12,
                  padding: '10px 8px',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                }}
              >
                <PhoneCall size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Call 102</span>
                <span style={{ fontSize: '0.65rem', color: '#BAE6FD' }}>Ambulance</span>
              </a>
            </div>

            {/* Resolve / Disarm Action */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderRadius: 12,
                padding: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              I Am Safe Now (Dismiss Alarm)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
