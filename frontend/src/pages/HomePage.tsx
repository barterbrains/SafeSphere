import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, ShieldCheck, Activity, Users, ArrowLeft } from 'lucide-react';
import SafeSphereMap from '../components/SafeSphereMap';
import { SafeSphereSidebar, RouteAnalysisPanel } from '../components/RouteAnalysisPanel';
import { RiskAlertSafetyModal } from '../components/RiskAlertSafetyModal';
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
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Search autocomplete
  const handleSelectDestination = (destItem: any) => {
    setDestination({
      lat: destItem.latitude || destItem.lat || 28.6129,
      lng: destItem.longitude || destItem.lng || 77.2295,
      address: destItem.formattedAddress || destItem.address || destItem.name,
    });
    setSearchQuery(destItem.formattedAddress || destItem.address || destItem.name);
    setIsSearchOpen(false);
  };

  // Start Journey Flow
  const handleInitiateRoute = async () => {
    const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    try {
      const res = await apiFetch('/journeys', {
        method: 'POST',
        body: JSON.stringify({
          routeId: activeRoute.id,
          originName: origin.address,
          destinationName: destination.address,
          safeScore: activeRoute.safeScore,
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
    setIsRiskModalOpen(true);
  };

  const handleRerouteSafe = () => {
    const otherRoutes = routes.filter(r => r.id !== selectedRouteId);
    const safestAlt = otherRoutes.length > 0
      ? otherRoutes.reduce((prev, curr) => curr.safeScore > prev.safeScore ? curr : prev, otherRoutes[0])
      : routes[0];

    if (safestAlt) {
      setSelectedRouteId(safestAlt.id);
      setIsRerouting(true);
    }
  };

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

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
          maxWidth: 'calc(100vw - 440px)',
        }}>
          {/* Destination Search Box */}
          <div style={{ position: 'relative', width: 340 }}>
            <div style={{
              background: 'rgba(18, 21, 34, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
            }}>
              <Search size={17} color="#818cf8" />
              <input
                type="text"
                placeholder="Search destination in Delhi..."
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
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              />
            </div>

            {/* Autocomplete dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                background: '#121522',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                zIndex: 1002,
              }}>
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectDestination(res)}
                    style={{
                      padding: '10px 14px',
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
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#FBBF24',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.78rem',
              fontWeight: 800,
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
            onSimulateRiskAlert={handleSimulateIncident}
          />
        </div>
      </div>

      {/* Risk Alert & Safety Check Modal */}
      <RiskAlertSafetyModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        currentRouteName={activeRoute.name}
        currentLocation={{ lat: origin.lat, lng: origin.lng, address: destination.address }}
        onRerouteSafe={handleRerouteSafe}
      />

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
