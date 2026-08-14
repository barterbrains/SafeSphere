import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Navigation, AlertTriangle, ShieldCheck, Route as RouteIcon } from 'lucide-react';
import { apiFetch, getRiskCategory, formatEta, formatDistance } from '../utils';
import MapView from '../components/MapView';
import StatusPill from '../components/ui/StatusPill';

/* Map risk score → StatusPill variant */
const riskVariant = (score: number) =>
  score >= 80 ? 'safe' : score >= 65 ? 'moderate' : score >= 50 ? 'elevated' : 'danger';

const scoreColor = (score: number) =>
  score >= 80 ? '#34D399' : score >= 65 ? '#FCD34D' : score >= 50 ? '#FB923C' : '#FCA5A5';

export default function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('destinationId');
  const destAddress = searchParams.get('destAddress');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destId && !destAddress) { navigate('/search'); return; }
    apiFetch('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({ destinationId: destId, originAddress: destAddress }),
    }).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [destId, destAddress, navigate]);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B0F14' }}>
      <div className="spinner" style={{ borderTopColor: '#10B981', borderColor: '#1E2733', width: 36, height: 36, borderWidth: 3, marginBottom: 20 }} />
      <p style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Calculating safe routes...</p>
    </div>
  );

  /* ── Error ── */
  if (!data || !data.routes) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0B0F14' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#111827', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={26} color="#EF4444" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: '#F1F5F9' }}>Unable to Calculate Routes</h3>
        <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5 }}>
          We could not calculate safety scores for this route. Please check your destination and try again.
        </p>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/search')}>
          <ArrowLeft size={16} /> Try Another Search
        </button>
      </div>
    </div>
  );

  const { origin, destination, routes } = data;

  const routeCards = [
    { type: 'safest',   icon: ShieldCheck, title: 'Safest Route',   r: routes.find((r: any) => r.routeType === 'safest') },
    { type: 'balanced', icon: RouteIcon,   title: 'Balanced Route', r: routes.find((r: any) => r.routeType === 'balanced'), recommended: true },
    { type: 'fastest',  icon: Clock,       title: 'Fastest Route',  r: routes.find((r: any) => r.routeType === 'fastest') },
  ].filter(x => x.r);

  const iconBgMap: Record<string, string> = {
    safest:   'rgba(16,185,129,0.12)',
    balanced: 'rgba(59,130,246,0.12)',
    fastest:  'rgba(245,158,11,0.12)',
  };
  const iconColorMap: Record<string, string> = {
    safest: '#34D399', balanced: '#93C5FD', fastest: '#FCD34D',
  };

  return (
    <div style={{ background: '#0B0F14', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Sticky header */}
      <div style={{ background: '#0B0F14', padding: '16px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #1E2733' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} aria-label="Go Back" style={{ background: '#131A24', border: '1px solid #1E2733', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0, boxShadow: '0 0 6px #10B981' }} />
              <p style={{ fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{origin.address}</p>
            </div>
            <div style={{ borderLeft: '2px dotted #1E2733', height: 8, margin: '2px 0 2px 3px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{destination.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '16px' }}>
        <MapView
          origin={{ lat: origin.latitude, lng: origin.longitude, address: origin.address }}
          destination={{ lat: destination.latitude, lng: destination.longitude, address: destination.address }}
          height="200px"
          showAlternate={true}
        />
      </div>

      {/* Route cards */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px 32px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, paddingLeft: 2 }}>
          Recommended Routes
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routeCards.map(({ type, icon: Icon, title, r, recommended }) => (
            <div
              key={type}
              onClick={() => navigate(`/route/${r.id}`)}
              style={{
                background: '#111827',
                border: `1px solid ${recommended ? 'rgba(16,185,129,0.35)' : '#1E2733'}`,
                borderRadius: 14, padding: 18,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#131A24'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#111827'; }}
            >
              {recommended && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#10B981', color: 'white',
                  fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em',
                  padding: '4px 14px', borderBottomLeftRadius: 10,
                }}>
                  RECOMMENDED
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: iconBgMap[type], padding: 10, borderRadius: 10 }}>
                    <Icon size={20} color={iconColorMap[type]} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: '#F1F5F9' }}>{title}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: 2 }}>
                      {formatEta(r.eta)} · {formatDistance(r.distance)}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor(r.safeScore), lineHeight: 1 }}>
                      {Math.round(r.safeScore)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600 }}>/100</span>
                  </div>
                  <StatusPill label={getRiskCategory(r.safeScore).label} variant={riskVariant(r.safeScore)} style={{ marginTop: 5 }} />
                </div>
              </div>

              <div style={{ background: '#0B0F14', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, border: '1px solid #1E2733' }}>
                {r.explanation}
              </div>

              {r.warnings.length > 0 && type !== 'safest' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: '#FB923C', fontSize: '0.75rem', fontWeight: 600 }}>
                  <AlertTriangle size={13} />
                  <span>{r.warnings[0]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
