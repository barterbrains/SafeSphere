import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, ShieldCheck, Activity, Users, ArrowLeft } from 'lucide-react';
import SafeSphereMap from '../components/SafeSphereMap';
import { SafeSphereSidebar, RouteAnalysisPanel } from '../components/RouteAnalysisPanel';
import { DELHI_DEMO_ROUTES, DELHI_SAFETY_POIS } from '../mock/delhiRouteData';
import type { RouteOptionData } from '../mock/delhiRouteData';
import { apiFetch } from '../utils';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destAddressParam = searchParams.get('destAddress') || 'India Gate, New Delhi';
  const originAddressParam = searchParams.get('originAddress') || 'Connaught Place, New Delhi';

  // Origin & Destination coordinates
  const [origin, setOrigin] = useState({
    lat: 28.6315,
    lng: 77.2167,
    address: originAddressParam,
  });

  const [destination, setDestination] = useState({
    lat: 28.6129,
    lng: 77.2295,
    address: destAddressParam,
  });

  const [routes, setRoutes] = useState<RouteOptionData[]>(DELHI_DEMO_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest-delhi');
  const [isRerouting, setIsRerouting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(destination.address);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search autocomplete
  const handleSelectDestination = (destItem: any) => {
    setDestination({
      lat: destItem.latitude || destItem.lat || 28.6129,
      lng: destItem.longitude || destItem.lng || 77.2295,
      address: destItem.address || destItem.name,
    });
    setSearchQuery(destItem.address || destItem.name);
    setIsSearchOpen(false);
  };

  // Initiate Route → Journey Guardian Flow
  const handleInitiateRoute = async () => {
    const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    try {
      const res = await apiFetch('/journeys', {
        method: 'POST',
        body: JSON.stringify({
          routeId: activeRoute.id,
          origin,
          destination,
          routeType: activeRoute.routeType,
          initialSafeScore: activeRoute.safeScore,
          eta: activeRoute.duration,
          distance: activeRoute.distance,
        }),
      });
      navigate(`/journey/${res.journey.id}`);
    } catch {
      navigate(`/journey/demo-journey-123`);
    }
  };

  // Simulated Safety Alert Event demo trigger
  const handleSimulateIncident = () => {
    setIsRerouting(true);
    setRoutes(prev => prev.map(r => {
      if (r.id === selectedRouteId) {
        return {
          ...r,
          safeScore: Math.max(50, r.safeScore - 26),
          tags: ['Elevated Risk Detected Ahead', ...r.tags],
        };
      }
      return r;
    }));
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#0B0D14',
      fontFamily: "'Inter', sans-serif",
      color: '#F1F5F9',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* ── Left Fixed Sidebar (Desktop) ── */}
      <div className="routes-sidebar-wrapper">
        <SafeSphereSidebar onTriggerEmergency={() => navigate('/emergency')} />
      </div>

      {/* ── Center / Main Map Space ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Top Floating Search & Telemetry Controls */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 24,
          zIndex: 1000,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          {/* Quick Destination Search Box */}
          <div style={{ position: 'relative', width: 320 }}>
            <div style={{
              background: 'rgba(18, 21, 34, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
            }}>
              <Search size={16} color="#818cf8" />
              <input
                type="text"
                placeholder="Search Delhi destination..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
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

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div style={{
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                background: '#151928',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                zIndex: 1001,
              }}>
                {[
                  { id: 'loc-1', address: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
                  { id: 'loc-2', address: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
                  { id: 'loc-3', address: 'Rajouri Garden, New Delhi', lat: 28.6473, lng: 77.1221 },
                  { id: 'loc-4', address: 'Saket Select CityWalk, New Delhi', lat: 28.5283, lng: 77.2185 },
                ].map((res, i) => (
                  <div
                    key={res.id || i}
                    onClick={() => handleSelectDestination(res)}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MapPin size={14} color="#818cf8" />
                    <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{res.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulate Safety Alert */}
          <button
            onClick={handleSimulateIncident}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(12px)',
            }}
          >
            <AlertTriangle size={14} />
            <span>Simulate Risk Alert</span>
          </button>
        </div>

        {/* The Leaflet OpenStreetMap Container */}
        <div style={{ flex: 1, width: '100%', height: '100%' }}>
          <SafeSphereMap
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={id => setSelectedRouteId(id)}
            origin={origin}
            destination={destination}
            pois={DELHI_SAFETY_POIS}
            showSafetyZones={true}
          />
        </div>

        {/* ── Right Floating Route Analysis Panel ── */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 24,
          bottom: 20,
          zIndex: 1000,
          display: 'flex',
        }}>
          <RouteAnalysisPanel
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={id => setSelectedRouteId(id)}
            destinationAddress={destination.address}
            onInitiateRoute={handleInitiateRoute}
            isRerouting={isRerouting}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .routes-sidebar-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
