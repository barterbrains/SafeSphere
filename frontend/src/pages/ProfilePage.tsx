import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, MapPin, LogOut, Edit3, Heart, CheckCircle2 } from 'lucide-react';
import { getUser, clearAuth, apiFetch } from '../utils';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import SectionCard from '../components/ui/SectionCard';
import ListRow from '../components/ui/ListRow';
import StatusPill from '../components/ui/StatusPill';
import StatCard from '../components/ui/StatCard';
import { EditProfileModal, type UserProfileData } from '../components/EditProfileModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile } = useAuth();
  const legacyUser = getUser();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfileData>({
    name: authProfile?.name || legacyUser?.name || 'Aarav Sharma',
    email: authUser?.email || legacyUser?.email || 'aarav.sharma@example.com',
    phone: authProfile?.phone || '+91 98101 23456',
    bloodType: authProfile?.blood_type || 'O+ Positive',
    allergies: authProfile?.allergies || 'Penicillin, Peanuts',
    medicalConditions: authProfile?.medical_conditions || 'Asthma (Carries Inhaler)',
    homeAddress: authProfile?.home_address || 'C-42, Hauz Khas Enclave, New Delhi',
    workSafeZone: authProfile?.work_safe_zone || 'Barakhamba Road, Connaught Place, New Delhi',
    emergencyNotes: 'Emergency contact priority: Dr. Meera Sharma',
  });

  useEffect(() => {
    apiFetch('/user/contacts').then(setContacts).catch(() => {});
  }, []);

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  return (
    <div className="nav-padded" style={{ background: '#0B0F14', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1520 0%, #0f1e2e 60%, #0B0F14 100%)',
        padding: '52px 20px 36px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #1E2733',
      }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(16,185,129,0.35)',
            }}>
              <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>{profileData.name?.[0] || 'U'}</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', marginBottom: 4, letterSpacing: '-0.02em' }}>
                {profileData.name}
              </h1>
              <p style={{ color: '#475569', fontSize: '0.85rem' }}>{profileData.email}</p>
              <StatusPill label="Active Guardian" variant="active" dot style={{ marginTop: 8 }} />
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            style={{
              background: 'rgba(79, 70, 229, 0.15)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard label="Journeys" value="12" caption="This month" variant="teal" icon={<Shield size={14} />} />
          <StatCard label="Avg SafeScore" value="76" caption="Across all routes" variant="blue" icon={<User size={14} />} />
        </div>

        {/* Emergency Medical Details Card */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingLeft: 2 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Emergency Medical Details
            </p>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Edit
            </button>
          </div>
          <SectionCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E2733', paddingBottom: 8 }}>
                <span style={{ color: '#64748B' }}>Blood Group:</span>
                <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{profileData.bloodType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E2733', paddingBottom: 8 }}>
                <span style={{ color: '#64748B' }}>Allergies:</span>
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{profileData.allergies || 'None listed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Conditions:</span>
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{profileData.medicalConditions || 'None listed'}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Trusted Contacts */}
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>
            Trusted Contacts
          </p>
          <SectionCard noPadding>
            {contacts.length > 0 ? contacts.map((c, i) => (
              <div key={c.id} style={{ borderBottom: i < contacts.length - 1 ? '1px solid #1E2733' : 'none' }}>
                <ListRow
                  icon={<span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.name[0]}</span>}
                  iconBg="linear-gradient(135deg, #10B981, #059669)"
                  iconColor="white"
                  title={c.name}
                  subtitle={c.contact}
                  trailing={<StatusPill label={c.enabled ? 'Active' : 'Off'} variant={c.enabled ? 'active' : 'muted'} />}
                />
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                No contacts added yet.
              </div>
            )}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(16,185,129,0.05)',
                border: 'none', borderTop: '1px solid #1E2733',
                color: '#10B981', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              + Edit Profile &amp; Contact Info
            </button>
          </SectionCard>
        </div>

        {/* Saved places */}
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>
            Recognized Safe Zones
          </p>
          <SectionCard noPadding>
            <ListRow
              icon={<MapPin size={18} />}
              iconBg="rgba(16,185,129,0.12)"
              iconColor="#10B981"
              title="Home Perimeter"
              subtitle={profileData.homeAddress}
            />
            <div style={{ borderTop: '1px solid #1E2733' }}>
              <ListRow
                icon={<MapPin size={18} />}
                iconBg="rgba(59,130,246,0.12)"
                iconColor="#3B82F6"
                title="Work / Campus Hub"
                subtitle={profileData.workSafeZone}
              />
            </div>
          </SectionCard>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', fontWeight: 600, fontSize: '0.875rem',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <BottomNav />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: 12,
          fontWeight: 700, fontSize: '0.85rem', zIndex: 99999, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialProfile={profileData}
        onSuccess={(updated) => {
          setProfileData(updated);
          setToastMessage('Profile updated successfully!');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
