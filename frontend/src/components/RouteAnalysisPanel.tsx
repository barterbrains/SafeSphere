import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Activity, BarChart2, Navigation, Settings,
  AlertTriangle, LogOut, Sparkles, Clock, ChevronRight,
  CheckCircle2, Compass, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import type { RouteOptionData } from '../mock/delhiRouteData';

// ── Circular SafeScore Gauge for Route Cards ──
function SafeScoreGauge({ score, size = 66 }: { score: number; size?: number }) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;
  const color = score >= 85 ? '#818cf8' : score >= 75 ? '#cbd5e1' : '#f87171';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4.5" />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={color} strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F1F5F9' }}>{score}</span>
      </div>
    </div>
  );
}

// ── Left Sidebar Navigation (Matching Reference Design) ──
interface SafeSphereSidebarProps {
  onTriggerEmergency?: () => void;
}

export function SafeSphereSidebar({ onTriggerEmergency }: SafeSphereSidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Command Center', icon: Activity, path: '/institution/overview', active: true },
    { label: 'Risk Analytics', icon: BarChart2, path: '/institution/analytics' },
    { label: 'Fleet Status', icon: Navigation, path: '/institution/heatmap' },
    { label: 'Safety Audits', icon: ShieldCheck, path: '/institution/incidents' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside style={{
      width: 220,
      background: '#121522',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      flexShrink: 0,
      height: '100%',
      minHeight: '100vh',
    }}>
      <div>
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #3b42a0 0%, #1e2246 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 0 16px rgba(79, 70, 229, 0.4)',
          }}>
            <Shield size={20} color="#818cf8" fill="#4f46e5" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>SafeSphere</h2>
            <p style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Institutional Command</p>
          </div>
        </div>

        {/* Nav Items */}
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
                background: item.active ? 'linear-gradient(135deg, #3730a3, #4338ca)' : 'transparent',
                color: item.active ? '#FFFFFF' : '#64748B',
                fontWeight: item.active ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                boxShadow: item.active ? '0 4px 16px rgba(67, 56, 202, 0.4)' : 'none',
              }}
            >
              <item.icon size={17} color={item.active ? '#FFFFFF' : '#64748B'} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Emergency Trigger & Switch */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={onTriggerEmergency || (() => navigate('/emergency'))}
          style={{
            background: '#b91c1c',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '12px',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(185, 28, 28, 0.4)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
          onMouseLeave={e => e.currentTarget.style.background = '#b91c1c'}
        >
          <AlertTriangle size={16} />
          <span>Emergency Response</span>
        </button>

        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#475569',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '4px',
            fontFamily: 'inherit',
          }}
        >
          <Compass size={14} />
          <span>Consumer Mode</span>
        </button>
      </div>
    </aside>
  );
}

// ── Right Route Analysis Panel ──
interface RouteAnalysisPanelProps {
  routes: RouteOptionData[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  destinationAddress: string;
  onInitiateRoute: () => void;
  isRerouting?: boolean;
}

export function RouteAnalysisPanel({
  routes,
  selectedRouteId,
  onSelectRoute,
  destinationAddress,
  onInitiateRoute,
  isRerouting = false,
}: RouteAnalysisPanelProps) {
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div style={{
      width: '100%',
      maxWidth: 380,
      background: 'rgba(18, 21, 34, 0.94)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 22,
      padding: '24px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 40px)',
    }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Route Analysis
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>
          {routes.length > 1
            ? `Comparing ${routes.length} pedestrian pathways to `
            : 'Optimal pedestrian route to '}
          <span style={{ color: '#94A3B8', fontWeight: 600 }}>{destinationAddress.split(',')[0]}</span>.
        </p>
      </div>

      {/* Dynamic Safety Alert if rerouting */}
      {isRerouting && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FCA5A5' }}>Elevated Risk Detected Ahead</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 2 }}>SafeSphere automatically recalculated the safest detour.</div>
          </div>
        </div>
      )}

      {/* Three Route Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isSafest = route.routeType === 'safest';
          const isFastest = route.routeType === 'fastest';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              style={{
                background: isSelected ? 'rgba(28, 32, 54, 0.98)' : 'rgba(21, 25, 40, 0.7)',
                border: `1.5px solid ${isSelected ? (isSafest ? '#4338ca' : isFastest ? '#ef4444' : '#64748b') : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: 16,
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {/* Recommended Badge on Top Right */}
              {route.recommended && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(79, 70, 229, 0.25)',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  color: '#818cf8',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Sparkles size={10} color="#818cf8" />
                  <span>★ Recommended</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  {/* Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {isSafest ? (
                      <Shield size={16} color="#818cf8" />
                    ) : isFastest ? (
                      <Zap size={16} color="#f87171" />
                    ) : (
                      <Navigation size={16} color="#cbd5e1" />
                    )}
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {route.name}
                    </h3>
                  </div>

                  {/* Duration & Distance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginBottom: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {route.duration} min
                    </span>
                    <span>•</span>
                    <span>{route.distance} km</span>
                  </div>

                  {/* Tag Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {route.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: tag.includes('Low') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${tag.includes('Low') ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.07)'}`,
                          color: tag.includes('Low') ? '#FCA5A5' : '#94A3B8',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 6,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Circular SafeScore Radial Progress */}
                <SafeScoreGauge score={route.safeScore} size={60} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Intelligence Breakdown Explanation */}
      {activeRoute && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: '0.78rem',
        }}>
          <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Why this route?</div>
          <p style={{ color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>{activeRoute.explanation}</p>
        </div>
      )}

      {/* Large Bottom Primary CTA */}
      <button
        onClick={onInitiateRoute}
        style={{
          background: 'linear-gradient(135deg, #3730a3, #4338ca)',
          border: '1px solid rgba(129, 140, 248, 0.4)',
          borderRadius: 12,
          padding: '15px',
          color: '#FFFFFF',
          fontSize: '0.95rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 8px 24px rgba(67, 56, 202, 0.45)',
          transition: 'all 0.15s',
          marginTop: 'auto',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #4338ca, #4f46e5)'}
        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #3730a3, #4338ca)'}
      >
        <span>Initiate {activeRoute?.name || 'Safest Route'}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
