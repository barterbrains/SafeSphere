import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Navigation, MapPin, X } from 'lucide-react';
import { apiFetch, getRiskCategory, formatEta, formatDistance } from '../utils';
import MapView from '../components/MapView';
import DemoControls from '../components/DemoControls';
import StatusPill from '../components/ui/StatusPill';

const scoreColor = (s: number) =>
  s >= 80 ? '#34D399' : s >= 65 ? '#FCD34D' : s >= 50 ? '#FB923C' : '#FCA5A5';

const riskVariant = (score: number): 'safe' | 'moderate' | 'elevated' | 'danger' =>
  score >= 80 ? 'safe' : score >= 65 ? 'moderate' : score >= 50 ? 'elevated' : 'danger';

export default function JourneyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rerouteOffer, setRerouteOffer] = useState<any>(null);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    apiFetch(`/journeys/${id}`)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));

    apiFetch('/user/contacts')
      .then(c => setContactsCount(c.filter((x: any) => x.enabled).length))
      .catch(() => {});
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0B0F14' }}>
      <div className="spinner" style={{ borderTopColor: '#10B981', borderColor: '#1E2733', width: 28, height: 28 }} />
    </div>
  );

  if (!data || !data.journey) return (
    <div style={{ padding: 24, color: '#94A3B8', background: '#0B0F14', minHeight: '100vh' }}>Journey not found.</div>
  );

  const { journey, route } = data;
  const hasActiveEvent = journey.events.some((e: any) => e.active);
  const latestEvent = journey.events[journey.events.length - 1];

  const triggerEvent = async (type: string) => {
    if (type === 'emergency') { navigate('/emergency', { state: { journeyId: journey.id } }); return; }
    try {
      const res = await apiFetch(`/journeys/${journey.id}/events`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      setData((prev: any) => ({ ...prev, journey: res.journey }));
      if (['incident', 'risk_increase', 'deviation'].includes(type)) {
        setTimeout(async () => {
          const rr = await apiFetch(`/journeys/${journey.id}/reroute`, { method: 'POST' });
          setRerouteOffer(rr);
        }, 1500);
      }
    } catch (err) { console.error(err); }
  };

  const acceptReroute = () => {
    if (!rerouteOffer) return;
    setData((prev: any) => ({
      ...prev,
      route: rerouteOffer.newRoute,
      journey: { ...prev.journey, routeId: rerouteOffer.newRoute.id, currentSafeScore: rerouteOffer.newRoute.safeScore },
    }));
    setRerouteOffer(null);
  };

  const endJourney = async () => {
    try { await apiFetch(`/journeys/${journey.id}/complete`, { method: 'POST' }); } catch { /* ignore */ }
    navigate('/home');
  };

  return (
    <div style={{ background: '#0B0F14', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top Guardian Bar ── */}
      <div style={{
        background: hasActiveEvent ? '#7F1D1D' : '#0d1520',
        color: 'white', padding: '16px 20px',
        transition: 'background 0.5s',
        borderBottom: `1px solid ${hasActiveEvent ? 'rgba(239,68,68,0.3)' : '#1E2733'}`,
        position: 'relative', zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: contactsCount > 0 && !hasActiveEvent ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: hasActiveEvent ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.15)',
              borderRadius: '50%', padding: 8, display: 'flex',
              animation: hasActiveEvent ? 'pulse-ring 2s infinite' : 'none',
            }}>
              {hasActiveEvent
                ? <AlertTriangle size={20} color="#EF4444" />
                : <Shield size={20} color="#10B981" />
              }
            </div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#F1F5F9' }}>
                Journey Guardian™
              </h1>
              <p style={{ fontSize: '0.72rem', color: hasActiveEvent ? '#FCA5A5' : '#475569' }}>
                {hasActiveEvent ? 'Safety Alert Active' : 'Monitoring your route'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: scoreColor(journey.currentSafeScore) }}>
              {Math.round(journey.currentSafeScore)}
            </div>
            <StatusPill label={getRiskCategory(journey.currentSafeScore).label} variant={riskVariant(journey.currentSafeScore)} />
          </div>
        </div>

        {!hasActiveEvent && contactsCount > 0 && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 8, padding: '7px 12px',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.73rem', color: '#6EE7B7', fontWeight: 500,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399', flexShrink: 0 }} />
            {contactsCount} trusted contact{contactsCount > 1 ? 's' : ''} can see your journey
          </div>
        )}
      </div>

      {/* ── Reroute Offer Modal ── */}
      {rerouteOffer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
          <div className="animate-slide-in-bottom" style={{ width: '100%', background: '#111827', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: 24, paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(16,185,129,0.15)', padding: 8, borderRadius: '50%' }}>
                  <Shield size={22} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F1F5F9' }}>Safer Route Found</h3>
              </div>
              <button onClick={() => setRerouteOffer(null)} style={{ background: '#1A2332', border: 'none', color: '#475569', padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 18, lineHeight: 1.5 }}>{rerouteOffer.reason}</p>

            <div style={{ background: '#0B0F14', borderRadius: 10, padding: '14px 16px', marginBottom: 22, border: '1px solid #1E2733', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontSize: '0.83rem' }}>Added time</span>
                <span style={{ fontWeight: 700, color: '#F59E0B' }}>+{rerouteOffer.improvement.etaIncrease} mins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontSize: '0.83rem' }}>SafeScore gain</span>
                <span style={{ fontWeight: 800, color: '#34D399' }}>+{rerouteOffer.improvement.safeScoreGain} pts</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setRerouteOffer(null)} className="btn btn-ghost" style={{ flex: 1 }}>Ignore</button>
              <button onClick={acceptReroute} className="btn btn-primary" style={{ flex: 2 }}>Reroute Now</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          origin={{ lat: route.origin.latitude, lng: route.origin.longitude, address: route.origin.address }}
          destination={{ lat: route.destination.latitude, lng: route.destination.longitude, address: route.destination.address }}
          height="100%"
          routeType={route.routeType}
          currentPosition={{ lat: route.origin.latitude + 0.005, lng: route.origin.longitude + 0.005 }}
        />

        {/* Live alert overlay */}
        {latestEvent && latestEvent.active && (
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10 }} className="animate-slide-in-top">
            <div style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid #EF4444', borderRadius: 10, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#F1F5F9', marginBottom: 4 }}>Safety Alert</p>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4 }}>{latestEvent.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div style={{ background: '#111827', borderTop: '1px solid #1E2733', padding: '16px 20px', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: '#F1F5F9' }}>
              {formatEta(route.eta)}
            </p>
            <p style={{ fontSize: '0.83rem', color: '#475569', fontWeight: 500, marginTop: 4 }}>
              {formatDistance(route.distance)} · {route.destination.address.split(',')[0]}
            </p>
          </div>

          <button
            onClick={() => navigate('/emergency', { state: { journeyId: journey.id } })}
            style={{
              background: '#EF4444', color: 'white', border: 'none',
              padding: '12px 28px', borderRadius: 9999, fontSize: '1rem', fontWeight: 900,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(239,68,68,0.45)',
              letterSpacing: '0.08em',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            SOS
          </button>
        </div>

        <button
          onClick={endJourney}
          className="btn btn-ghost btn-full"
          style={{ color: '#334155', borderColor: '#1E2733' }}
        >
          End Journey
        </button>
      </div>

      <DemoControls onTriggerEvent={triggerEvent} />
    </div>
  );
}
