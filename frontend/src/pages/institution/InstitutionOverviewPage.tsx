import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, Bell, BarChart2,
  LogOut, Activity, Search, Navigation, Settings,
  HelpCircle, Database
} from 'lucide-react';
import { apiFetch, clearAuth, getUser } from '../../utils';
import CommandMap from '../../components/CommandMap';
import {
  DEMO_METRICS,
  DEMO_SAFESCORE_TRENDS,
  DEMO_INCIDENTS,
  DEMO_MAP_MARKERS
} from '../../mock/demoCommandCenterData';

// ── Mini Circular SafeScore Gauge ──
function SafeScoreRingMini({ score = 94, size = 48 }: { score?: number; size?: number }) {
  const radius = size / 2 - 5;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke="#818cf8" strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ filter: 'drop-shadow(0 0 5px #818cf8)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>{score}</span>
      </div>
    </div>
  );
}

// ── Sidebar Component ──
export function InstitutionNav() {
  const navigate = useNavigate();

  const navItems = [
    { path: '/institution/overview', icon: Activity, label: 'Command Center', active: true },
    { path: '/institution/analytics', icon: BarChart2, label: 'Risk Analytics' },
    { path: '/institution/heatmap', icon: Navigation, label: 'Fleet Status' },
    { path: '/institution/incidents', icon: Shield, label: 'Safety Audits' },
    { path: '/institution/alerts', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside style={{
      width: 220,
      background: '#85888f',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      flexShrink: 0,
      minHeight: '100vh',
      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    }}>
      <div>
        {/* Brand header */}
        <div style={{ padding: '0 8px', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>SafeSphere</h2>
          <p style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: 1 }}>Institutional Command</p>
        </div>

        {/* Main Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: 'none',
                background: item.active ? '#3438b4' : 'transparent',
                color: item.active ? '#FFFFFF' : '#334155',
                fontWeight: item.active ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                boxShadow: item.active ? '0 4px 14px rgba(52, 56, 180, 0.4)' : 'none',
              }}
            >
              <item.icon size={17} color={item.active ? '#FFFFFF' : '#334155'} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Bottom: Emergency Button, Help, Sign out */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate('/institution/alerts')}
          style={{
            background: '#2b2360',
            border: 'none',
            borderRadius: 10,
            padding: '12px 14px',
            color: '#a5b4fc',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <AlertTriangle size={15} />
          <span>Emergency Response</span>
        </button>

        <button
          onClick={() => alert('SafeSphere Operations Support Desk')}
          style={{
            background: 'none',
            border: 'none',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <HelpCircle size={15} />
          <span>Help</span>
        </button>

        <button
          onClick={() => { clearAuth(); navigate('/login'); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ── Main Page ──
export default function InstitutionOverviewPage() {
  const navigate = useNavigate();
  const user = getUser();

  // Check if current user is demo account
  const isDemo = !user || user.id?.startsWith('demo') || user.email?.includes('demo') || user.role === 'consumer' || user.role === 'institution';

  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    // If not demo or if live querying desired, query backend
    if (!isDemo) {
      setLoading(true);
      apiFetch('/institution/dashboard')
        .then(setRealData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isDemo]);

  // Sourcing data: sample data for demo, database metrics for real accounts
  const metrics = isDemo ? DEMO_METRICS : {
    totalJourneys: realData?.overview?.totalJourneys || 0,
    totalJourneysTrend: '+0.0%',
    avgSafeScore: realData?.overview?.avgSafeScore || 0,
    activeAlerts: realData?.overview?.activeAlerts || 0,
    activeAlertsPriority: 'Normal',
    highRiskZones: realData?.overview?.openIncidents || 0,
    highRiskZonesTrend: '0 today',
  };

  const trends = isDemo ? DEMO_SAFESCORE_TRENDS : (realData?.trends || DEMO_SAFESCORE_TRENDS);
  const incidents = isDemo ? DEMO_INCIDENTS : (realData?.recentIncidents || []);
  const mapMarkers = isDemo ? DEMO_MAP_MARKERS : (realData?.mapMarkers || []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: "'Inter', sans-serif",
    }}>
      <InstitutionNav />

      {/* ── Main Operations Workspace ── */}
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#FFFFFF' }}>
        
        {/* Top Header Row with Search & Notification */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em' }}>
                Command Center
              </h1>
              {isDemo && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: '#4f46e5',
                  padding: '3px 8px',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  <Database size={11} /> Demo Data
                </span>
              )}
            </div>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: 3 }}>
              Real-time safety intelligence & operational overview.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search Input */}
            <div style={{
              background: '#2b2d35',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: 240,
            }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search operations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              />
            </div>

            {/* Notification Bell */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#2b2d35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <Bell size={17} color="#FFFFFF" />
              <div style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef4444',
              }} />
            </div>
          </div>
        </div>

        {/* ── Stats Row (4 Cards Matching Reference) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}>
          {/* Total Journeys */}
          <div style={{
            background: '#85888f',
            borderRadius: 14,
            padding: '18px 20px',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>Total Journeys</span>
              <Activity size={15} color="#e2e8f0" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
                {metrics.totalJourneys.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a5f3fc', fontWeight: 700 }}>
                ↗ {metrics.totalJourneysTrend}
              </span>
            </div>
          </div>

          {/* Avg SafeScore */}
          <div style={{
            background: '#85888f',
            borderRadius: 14,
            padding: '18px 20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div>
              <span style={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>Avg SafeScore</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 10 }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {metrics.avgSafeScore}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>/100</span>
              </div>
            </div>
            <SafeScoreRingMini score={metrics.avgSafeScore} size={46} />
          </div>

          {/* Active Alerts */}
          <div style={{
            background: '#85888f',
            borderRadius: 14,
            padding: '18px 20px',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>Active Alerts</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fca5a5' }}>
                {metrics.activeAlerts}
              </span>
              <span style={{
                background: '#2b2d35',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>
                {metrics.activeAlertsPriority}
              </span>
            </div>
          </div>

          {/* High-Risk Zones */}
          <div style={{
            background: '#85888f',
            borderRadius: 14,
            padding: '18px 20px',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>High-Risk Zones</span>
              <AlertTriangle size={15} color="#e2e8f0" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
                {metrics.highRiskZones}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>
                {metrics.highRiskZonesTrend}
              </span>
            </div>
          </div>
        </div>

        {/* ── Mid Row: Interactive Leaflet Map & SafeScore Trends Bar Chart ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}>
          {/* Leaflet CartoDB Dark Map Container */}
          <div style={{
            background: '#85888f',
            borderRadius: 16,
            padding: '10px',
            position: 'relative',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            {/* Live Heatmap Badge */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 1000,
              background: 'rgba(30, 33, 45, 0.85)',
              color: '#FFFFFF',
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />
              <span>Live Heatmap</span>
            </div>

            {/* Map Component with Leaflet & CartoDB tiles */}
            <div style={{ height: 280, width: '100%', borderRadius: 12, overflow: 'hidden' }}>
              <CommandMap
                markers={mapMarkers}
                center={[41.8781, -87.6298]}
                zoom={12}
                showHeatmap={showHeatmap}
              />
            </div>
          </div>

          {/* SafeScore Trends Bar Chart Card (Matching Reference Visual) */}
          <div style={{
            background: '#85888f',
            borderRadius: 16,
            padding: '20px',
            color: '#FFFFFF',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>SafeScore Trends</h3>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 2 }}>7-Day regional aggregate</p>
            </div>

            {/* Bar Grid Visual */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 160,
              padding: '10px 6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              position: 'relative',
            }}>
              {/* Horizontal background grid lines */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                <div style={{ borderTop: '1px dashed #FFFFFF', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #FFFFFF', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #FFFFFF', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #FFFFFF', width: '100%' }} />
              </div>

              {trends.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                  {t.current && (
                    <span style={{ background: '#3438b4', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 800, padding: '2px 5px', borderRadius: 4 }}>
                      {t.score}
                    </span>
                  )}
                  <div style={{
                    width: 20,
                    height: `${(t.score / 100) * 120}px`,
                    background: t.current ? '#3438b4' : 'rgba(255, 255, 255, 0.25)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#cbd5e1', fontWeight: 600 }}>{t.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Section: Recent Incidents Table (Matching Reference) ── */}
        <div style={{
          background: '#85888f',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>Recent Incidents</h3>
            <button
              onClick={() => navigate('/institution/incidents')}
              style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              View All
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: '#cbd5e1', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem' }}>ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem' }}>Location</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem' }}>Type</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem' }}>Severity</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem', textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc: any) => {
                  let sevBg = '#2b2d35';
                  let sevColor = '#FFFFFF';
                  if (inc.severity === 'HIGH') {
                    sevBg = 'rgba(239, 68, 68, 0.25)';
                    sevColor = '#fee2e2';
                  } else if (inc.severity === 'MEDIUM') {
                    sevBg = 'rgba(245, 158, 11, 0.25)';
                    sevColor = '#fef3c7';
                  } else {
                    sevBg = '#2b2d35';
                    sevColor = '#e2e8f0';
                  }

                  return (
                    <tr key={inc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <td style={{ padding: '12px 10px', color: '#e2e8f0', fontWeight: 700 }}>{inc.id}</td>
                      <td style={{ padding: '12px 10px', color: '#FFFFFF', fontWeight: 600 }}>{inc.location}</td>
                      <td style={{ padding: '12px 10px', color: '#e2e8f0' }}>{inc.type}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          background: sevBg,
                          color: sevColor,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                        }}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#cbd5e1', textAlign: 'right' }}>{inc.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
