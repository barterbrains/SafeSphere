import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  X, User, Phone, Mail, Heart, AlertTriangle, Home,
  Building, Check, Loader2, ShieldCheck, Sparkles
} from 'lucide-react';

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  homeAddress: string;
  workSafeZone: string;
  emergencyNotes?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: Partial<UserProfileData>;
  onSuccess?: (updated: UserProfileData) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialProfile,
  onSuccess,
}: EditProfileModalProps) {
  const { user, profile: authProfile, isDemo, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+ Positive');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [workSafeZone, setWorkSafeZone] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'basic' | 'medical' | 'safezones'>('basic');

  useEffect(() => {
    if (isOpen) {
      setName(initialProfile?.name || authProfile?.name || (isDemo ? 'Aarav Sharma' : user?.email?.split('@')[0] || 'User'));
      setEmail(initialProfile?.email || user?.email || (isDemo ? 'aarav.sharma@example.com' : ''));
      setPhone(initialProfile?.phone || authProfile?.phone || (isDemo ? '+91 98101 23456' : ''));
      setBloodType(initialProfile?.bloodType || authProfile?.blood_type || (isDemo ? 'O+ Positive' : 'O+ Positive'));
      setAllergies(initialProfile?.allergies || authProfile?.allergies || (isDemo ? 'Penicillin, Peanuts' : ''));
      setMedicalConditions(initialProfile?.medicalConditions || authProfile?.medical_conditions || (isDemo ? 'Asthma (Carries Inhaler)' : ''));
      setHomeAddress(initialProfile?.homeAddress || authProfile?.home_address || (isDemo ? 'C-42, Hauz Khas Enclave, New Delhi' : ''));
      setWorkSafeZone(initialProfile?.workSafeZone || authProfile?.work_safe_zone || (isDemo ? 'Barakhamba Road, Connaught Place, New Delhi' : ''));
      setEmergencyNotes(initialProfile?.emergencyNotes || (isDemo ? 'Emergency contact priority: Dr. Meera Sharma' : ''));
      setErrorMessage('');
    }
  }, [isOpen, initialProfile, authProfile, user, isDemo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const updatedData: UserProfileData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bloodType,
      allergies: allergies.trim(),
      medicalConditions: medicalConditions.trim(),
      homeAddress: homeAddress.trim(),
      workSafeZone: workSafeZone.trim(),
      emergencyNotes: emergencyNotes.trim(),
    };

    try {
      if (!isDemo && user?.id) {
        // Save directly to Supabase profiles table
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: updatedData.name,
            phone: updatedData.phone,
            blood_type: updatedData.bloodType,
            allergies: updatedData.allergies,
            medical_conditions: updatedData.medicalConditions,
            home_address: updatedData.homeAddress,
            work_safe_zone: updatedData.workSafeZone,
          }, { onConflict: 'id' });

        if (error) {
          console.error('[SafeSphere] Update Profile Error:', error);
          setErrorMessage(error.message || 'Failed to update profile in database.');
          setIsSaving(false);
          return;
        }

        if (refreshProfile) {
          await refreshProfile();
        }
      }

      // Save to localStorage for demo persistence
      localStorage.setItem('safesphere_user_profile', JSON.stringify(updatedData));

      if (onSuccess) {
        onSuccess(updatedData);
      }

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error('[SafeSphere] Profile Save Exception:', err);
      setErrorMessage(err?.message || 'Unexpected error saving profile.');
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(5, 7, 14, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#0F1322',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 24,
        width: '100%',
        maxWidth: 580,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(79,70,229,0.15)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(30,35,55,0.4) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(79,70,229,0.4)',
            }}>
              <User size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Edit User Profile
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>
                Update your personal identity, emergency medical info, and safe zones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: 10,
              padding: 8,
              cursor: 'pointer',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{
          display: 'flex',
          padding: '12px 24px 0',
          gap: 8,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(15, 19, 34, 0.5)',
        }}>
          {[
            { id: 'basic', label: 'Identity & Contact', icon: User },
            { id: 'medical', label: 'Emergency Medical', icon: Heart },
            { id: 'safezones', label: 'Safe Zones', icon: Home },
          ].map(tab => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                style={{
                  padding: '10px 14px',
                  background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #818cf8' : '2px solid transparent',
                  color: isActive ? '#c7d2fe' : '#64748B',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                <Icon size={14} color={isActive ? '#818cf8' : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
            }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Identity */}
          {activeSection === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name *
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <User size={16} color="#818cf8" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Phone size={16} color="#34d399" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 98101 23456"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Registered Email (Read-only)
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: 0.8,
                }}>
                  <Mail size={16} color="#64748B" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Emergency Medical */}
          {activeSection === 'medical' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Blood Group
                </label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value)}
                  style={{
                    background: '#151928',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="O+ Positive">O+ Positive</option>
                  <option value="O- Negative">O- Negative</option>
                  <option value="A+ Positive">A+ Positive</option>
                  <option value="A- Negative">A- Negative</option>
                  <option value="B+ Positive">B+ Positive</option>
                  <option value="B- Negative">B- Negative</option>
                  <option value="AB+ Positive">AB+ Positive</option>
                  <option value="AB- Negative">AB- Negative</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Known Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Pollen (or None)"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Medical Conditions / Medication
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={e => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Asthma (Carries Inhaler), Type 1 Diabetes"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}

          {/* Section 3: Safe Zones */}
          {activeSection === 'safezones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Home Safe Zone Address
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Home size={16} color="#818cf8" />
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={e => setHomeAddress(e.target.value)}
                    placeholder="e.g. C-42, Hauz Khas Enclave, New Delhi"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Work / Campus Safe Hub
                </label>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Building size={16} color="#38bdf8" />
                  <input
                    type="text"
                    value={workSafeZone}
                    onChange={e => setWorkSafeZone(e.target.value)}
                    placeholder="e.g. Barakhamba Road, Connaught Place, New Delhi"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Emergency First-Responder Instructions
                </label>
                <textarea
                  value={emergencyNotes}
                  onChange={e => setEmergencyNotes(e.target.value)}
                  placeholder="e.g. Please notify primary contact immediately upon SOS dispatch."
                  rows={3}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    width: '100%',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                padding: '10px 18px',
                borderRadius: 12,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: 12,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
