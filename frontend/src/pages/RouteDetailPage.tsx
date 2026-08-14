import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Shield, AlertTriangle, Lightbulb, Users } from 'lucide-react';
import { apiFetch, getRiskCategory, formatEta, formatDistance } from '../utils';
import MapView from '../components/MapView';
import SafeScoreRing from '../components/SafeScoreRing';
import ScoreBreakdownChart from '../components/ScoreBreakdownChart';

export default function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/routes/${id}`).then(setRoute).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)' }} />
    </div>
  );

  if (!route) return <div style={{ padding: 24 }}>Route not found.</div>;

  const handleStart = async () => {
    try {
      const data = await apiFetch('/journeys/start', { method: 'POST', body: JSON.stringify({ routeId: route.id }) });
      navigate(`/journey/${data.journey.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 110, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'white', padding: '16px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)} aria-label="Go Back" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft size={24} color="var(--text-primary)" />
          </button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Route Details</h1>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <MapView origin={{ lat: route.origin.latitude, lng: route.origin.longitude, address: route.origin.address }}
                 destination={{ lat: route.destination.latitude, lng: route.destination.longitude, address: route.destination.address }}
                 height="250px" routeType={route.routeType} />

        <div style={{ padding: '24px 16px', marginTop: -20, position: 'relative', zIndex: 10, background: 'var(--bg-primary)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{route.routeType} ROUTE</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{formatEta(route.eta)}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{formatDistance(route.distance)}</p>
            </div>
            <SafeScoreRing score={route.safeScore} size={80} strokeWidth={8} showLabel={false} />
          </div>

          {route.warnings.length > 0 && (
            <div className="alert-banner alert-warning" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9a3412', marginBottom: 4 }}>Safety Advisories</p>
                  <ul style={{ paddingLeft: 16, fontSize: '0.8rem', color: '#9a3412', margin: 0 }}>
                    {route.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16 }}>SafeScore™ Breakdown</h3>
            <ScoreBreakdownChart breakdown={route.scoreBreakdown} safeScore={route.safeScore} />
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16 }}>Route Segments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {route.segments.map((s: any, idx: number) => (
                <div key={s.id} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: getRiskCategory(s.safetyScore).color, zIndex: 2 }} />
                    {idx < route.segments.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: idx < route.segments.length - 1 ? 16 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.distance} km</p>
                      </div>
                      <span className={`badge ${getRiskCategory(s.safetyScore).badgeClass}`}>{Math.round(s.safetyScore)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', boxShadow: '0 -10px 30px rgba(0,0,0,0.05)', zIndex: 100 }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <button onClick={handleStart} className="btn btn-primary btn-full btn-lg">
            <Navigation size={20} />
            Start Journey
          </button>
        </div>
      </div>
    </div>
  );
}
