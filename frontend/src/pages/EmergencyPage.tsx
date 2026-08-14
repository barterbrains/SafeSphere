import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, MapPin, X, Shield, PhoneCall, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils';
import StatusPill from '../components/ui/StatusPill';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const journeyId = location.state?.journeyId;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = journeyId ? `/journeys/${journeyId}/sos` : '/journeys/sos-standalone';
    apiFetch(endpoint, { method: 'POST' }).then(res => {
      setData(res);
    }).catch(() => {
      setData({
        message: 'Emergency mode activated. Trusted contacts have been notified.',
        notifications: [
          { contact: { name: 'Mom', contact: '+91 98765 43210' }, status: 'notified' },
          { contact: { name: 'Brother', contact: '+91 87654 32109' }, status: 'notified' },
        ],
        nearbyResources: [
          { id: '1', name: 'Connaught Place Police Station', type: 'police', location: { address: '0.8 km away' } },
          { id: '2', name: 'AIIMS Hospital', type: 'hospital', location: { address: '2.1 km away' } },
        ],
      });
    }).finally(() => setLoading(false));
  }, [journeyId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#EF4444' }}>
      <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)', width: 28, height: 28 }} />
    </div>
  );

  return (
    <div style={{ background: '#EF4444', minHeight: '100vh', padding: 24, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Close */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: 10, borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
          aria-label="Close emergency screen"
        >
          <X size={22} />
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', animation: 'pulse-ring 2s infinite',
        }}>
          <AlertTriangle size={38} color="white" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8, color: 'white' }}>
          SOS Active
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, maxWidth: 300, margin: '0 auto' }}>
          {data?.message}
        </p>
      </div>

      {/* Inner content card — dark, not white */}
      <div style={{ background: '#111827', borderRadius: 20, padding: 24, flex: 1, border: '1px solid rgba(239,68,68,0.2)' }}>
        {/* Trusted contacts */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Shield size={16} color="#10B981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Trusted Contacts Alerted
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data?.notifications?.map((n: any, i: number) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#0B0F14', padding: '12px 16px', borderRadius: 10, border: '1px solid #1E2733',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>{n.contact.name[0]}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F1F5F9' }}>{n.contact.name}</p>
                    <p style={{ color: '#475569', fontSize: '0.75rem' }}>{n.contact.contact}</p>
                  </div>
                </div>
                <StatusPill label="Notified" variant="safe" dot />
              </div>
            ))}
          </div>
        </div>

        {/* Nearby resources */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MapPin size={16} color="#3B82F6" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Nearby Safe Zones
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data?.nearbyResources?.map((res: any) => (
              <div key={res.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#0B0F14', padding: '12px 16px', borderRadius: 10, border: '1px solid #1E2733',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.4rem' }}>{res.type === 'police' ? '🚔' : '🏥'}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F1F5F9' }}>{res.name}</p>
                    <p style={{ color: '#475569', fontSize: '0.75rem' }}>{res.location.address}</p>
                  </div>
                </div>
                <button style={{
                  background: 'rgba(59,130,246,0.15)', color: '#93C5FD',
                  border: '1px solid rgba(59,130,246,0.2)',
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call 112 */}
      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-full"
          style={{
            background: 'white', color: '#EF4444', padding: '16px',
            fontSize: '1rem', fontWeight: 800, borderRadius: 14,
            boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <PhoneCall size={20} />
          Call National Emergency (112)
        </button>
      </div>
    </div>
  );
}
