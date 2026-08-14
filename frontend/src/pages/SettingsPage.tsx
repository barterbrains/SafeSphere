import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, Smartphone, Globe, Moon, ChevronLeft, User, CheckCircle2, Edit3 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import SectionCard from '../components/ui/SectionCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';

interface SettingRow {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  desc: string;
  toggle?: boolean;
  action?: string;
}

const SETTINGS_GROUPS: { heading: string; items: SettingRow[] }[] = [
  {
    heading: 'Account & Identity',
    items: [
      {
        icon: User,
        iconColor: '#818cf8',
        iconBg: 'rgba(99,102,241,0.15)',
        label: 'Edit Profile & Medical Info',
        desc: 'Name, phone, blood group, allergies & safe perimeters',
        action: 'editProfile',
      },
    ],
  },
  {
    heading: 'Notifications & Safety',
    items: [
      { icon: Bell,   iconColor: '#FCD34D', iconBg: 'rgba(245,158,11,0.12)', label: 'Notifications',    desc: 'Push & SMS safety alerts',       toggle: true },
      { icon: Shield, iconColor: '#34D399', iconBg: 'rgba(16,185,129,0.12)', label: 'Privacy & Safety', desc: 'Guardian location sharing',      toggle: true },
    ],
  },
  {
    heading: 'App & Preferences',
    items: [
      { icon: Smartphone, iconColor: '#93C5FD', iconBg: 'rgba(59,130,246,0.12)', label: 'App Settings', desc: 'Permissions & sensors' },
      { icon: Globe,      iconColor: '#A78BFA', iconBg: 'rgba(139,92,246,0.12)', label: 'Language',     desc: 'English (US)' },
      { icon: Moon,       iconColor: '#94A3B8', iconBg: 'rgba(148,163,184,0.1)', label: 'Appearance',   desc: 'Dark Mode' },
    ],
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Notifications': true,
    'Privacy & Safety': true,
  });

  const flip = (label: string) =>
    setToggles(prev => ({ ...prev, [label]: !prev[label] }));

  const handleRowClick = (item: SettingRow) => {
    if (item.action === 'editProfile') {
      setIsEditProfileOpen(true);
    } else if (item.toggle) {
      flip(item.label);
    }
  };

  return (
    <div className="nav-padded" style={{ background: '#0B0F14', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#0B0F14', borderBottom: '1px solid #1E2733',
        padding: '20px 16px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            style={{ background: '#131A24', border: '1px solid #1E2733', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F5F9', margin: 0 }}>Settings</h1>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {SETTINGS_GROUPS.map(group => (
          <div key={group.heading}>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, color: '#334155',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 10, paddingLeft: 2,
            }}>
              {group.heading}
            </p>
            <SectionCard noPadding>
              {group.items.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '15px 16px',
                    borderBottom: i < group.items.length - 1 ? '1px solid #1E2733' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#1A2332'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  onClick={() => handleRowClick(s)}
                >
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: s.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.iconColor,
                  }}>
                    <s.icon size={17} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9' }}>{s.label}</p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{s.desc}</p>
                  </div>

                  {/* Trailing */}
                  {s.toggle ? (
                    <label className="toggle" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={!!toggles[s.label]} onChange={() => flip(s.label)} />
                      <span className="toggle-track" />
                    </label>
                  ) : s.action === 'editProfile' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: '0.78rem', fontWeight: 700 }}>
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </div>
                  ) : (
                    <ChevronLeft size={16} color="#334155" style={{ transform: 'rotate(180deg)' }} />
                  )}
                </div>
              ))}
            </SectionCard>
          </div>
        ))}

        {/* App version */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.72rem', paddingBottom: 8 }}>
          SafeSphere Protection Core v2.4.0 · Institutional Edition
        </p>
      </div>

      <BottomNav />

      {/* Toast */}
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
          setToastMessage('Profile details updated successfully!');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
