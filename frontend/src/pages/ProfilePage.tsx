import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, MapPin, LogOut } from 'lucide-react';
import { getUser, clearAuth, apiFetch } from '../utils';
import BottomNav from '../components/BottomNav';
import SectionCard from '../components/ui/SectionCard';
import ListRow from '../components/ui/ListRow';
import StatusPill from '../components/ui/StatusPill';
import StatCard from '../components/ui/StatCard';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [contacts, setContacts] = useState<any[]>([]);

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

        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(16,185,129,0.35)',
          }}>
            <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>{user?.name?.[0] || 'U'}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F1F5F9', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {user?.name || 'User'}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>{user?.email}</p>
            <StatusPill label="Active Guardian" variant="active" dot style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard label="Journeys" value="12" caption="This month" variant="teal" icon={<Shield size={14} />} />
          <StatCard label="Avg SafeScore" value="76" caption="Across all routes" variant="blue" icon={<User size={14} />} />
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
              <div style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '0.85rem' }}>
                No contacts added yet.
              </div>
            )}
            <button style={{
              width: '100%', padding: '14px 16px',
              background: 'rgba(16,185,129,0.05)',
              border: 'none', borderTop: '1px solid #1E2733',
              color: '#10B981', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              + Add Trusted Contact
            </button>
          </SectionCard>
        </div>

        {/* Saved places */}
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>
            Saved Places
          </p>
          <SectionCard noPadding>
            {[
              { name: 'GTBIT Campus', type: 'Saved Place' },
              { name: 'Hostel Area', type: 'Saved Place' },
            ].map((place, i, arr) => (
              <div key={place.name} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1E2733' : 'none' }}>
                <ListRow
                  icon={<MapPin size={16} />}
                  iconBg="#1A2332"
                  iconColor="#475569"
                  title={place.name}
                  subtitle={place.type}
                  showArrow
                />
              </div>
            ))}
          </SectionCard>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '13px 20px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, color: '#EF4444', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.14)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
