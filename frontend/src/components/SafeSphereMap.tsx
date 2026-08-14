import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RouteOptionData } from '../mock/delhiRouteData';
import type { EnvironmentalSafetyFeature } from '../services/overpassEnvironmentalData';
import type { UserReportedIncident } from '../services/incidentService';

interface SafeSphereMapProps {
  routes: RouteOptionData[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  environmentalFeatures?: EnvironmentalSafetyFeature[];
  reportedIncidents?: UserReportedIncident[];
  pois?: any[];
  showSafetyZones?: boolean;
  isNavigating?: boolean;
  userLocation?: { lat: number; lng: number; heading?: number } | null;
  traveledCoordinates?: [number, number][];
  remainingCoordinates?: [number, number][];
}

// Custom Origin Marker (Pulsing Purple Dot)
const originIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(99, 102, 241, 0.4); animation: pulse-ring 2s infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background: #6366f1; border: 3px solid #ffffff; box-shadow: 0 0 12px #6366f1;"></div>
    </div>
  `,
  className: 'origin-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom Destination Pin (Glowing Purple Pin)
const destinationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(129, 140, 248, 0.35); animation: pulse-ring 2s infinite;"></div>
      <div style="width: 18px; height: 18px; border-radius: 50%; background: #4f46e5; border: 3px solid #ffffff; box-shadow: 0 0 16px #4f46e5; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900;">
        ★
      </div>
    </div>
  `,
  className: 'destination-marker',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Google Maps Style Live Navigation Location Puck
function createUserLocationPuck(heading = 0) {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing radar glow -->
        <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(56, 189, 248, 0.3); animation: pulse-ring 1.8s infinite;"></div>
        <!-- Direction cone -->
        <div style="
          position: absolute;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 14px solid #38bdf8;
          top: -3px;
          transform: rotate(${heading}deg);
          transform-origin: center 21px;
          filter: drop-shadow(0 0 6px #38bdf8);
        "></div>
        <!-- Center location dot -->
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0284c7;
          border: 3.5px solid #ffffff;
          box-shadow: 0 0 16px #38bdf8, 0 4px 10px rgba(0,0,0,0.6);
          position: relative;
          z-index: 2;
        "></div>
      </div>
    `,
    className: 'live-user-puck-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Incident Warning Marker Icon
function createIncidentMarkerIcon(severity: string) {
  const color = severity === 'critical' || severity === 'high' ? '#ef4444' : '#f59e0b';
  return L.divIcon({
    html: `
      <div style="
        width: 26px; height: 26px; border-radius: 50%;
        background: #181119;
        border: 2px solid ${color};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 10px ${color}aa;
        font-size: 12px;
      ">
        ⚠️
      </div>
    `,
    className: 'incident-report-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// Real Environmental Feature Marker Icons
function createFeatureIcon(type: 'street_lamp' | 'police' | 'cctv' | 'hospital') {
  if (type === 'hospital') {
    return L.divIcon({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div style="
            width: 34px; height: 34px; border-radius: 50%;
            background: rgba(239,68,68,0.18);
            border: 2.5px solid #f87171;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 14px #f8717199;
            font-size: 15px;
          ">🏥</div>
          <div style="
            background: rgba(15,15,25,0.88);
            color:#f87171;font-size:9px;font-weight:700;
            padding:1px 5px;border-radius:4px;white-space:nowrap;
            border:1px solid rgba(248,113,113,0.4);
          ">Hospital</div>
        </div>
      `,
      className: 'environmental-feature-marker',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });
  }

  if (type === 'police') {
    return L.divIcon({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div style="
            width: 34px; height: 34px; border-radius: 50%;
            background: rgba(56,189,248,0.18);
            border: 2.5px solid #38bdf8;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 14px #38bdf899;
            font-size: 15px;
          ">👮</div>
          <div style="
            background: rgba(15,15,25,0.88);
            color:#38bdf8;font-size:9px;font-weight:700;
            padding:1px 5px;border-radius:4px;white-space:nowrap;
            border:1px solid rgba(56,189,248,0.4);
          ">Police</div>
        </div>
      `,
      className: 'environmental-feature-marker',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });
  }

  let borderColor = '#facc15';
  let char = '💡';
  if (type === 'cctv') { borderColor = '#a855f7'; char = '📹'; }

  return L.divIcon({
    html: `
      <div style="
        width: 22px; height: 22px; border-radius: 50%;
        background: #111522;
        border: 2px solid ${borderColor};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 7px ${borderColor}88;
        font-size: 10px;
      ">${char}</div>
    `,
    className: 'environmental-feature-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// Component to control map camera: zooms to street-level (zoom 18) on navigation start and smoothly follows user movement
function MapNavigationController({
  routes,
  selectedRouteId,
  isNavigating,
  userLocation,
}: {
  routes: RouteOptionData[];
  selectedRouteId: string;
  isNavigating?: boolean;
  userLocation?: { lat: number; lng: number; heading?: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating && userLocation) {
      // If just started navigation or currently at overview zoom (< 17), fly and zoom in deep to street level (18)
      if (map.getZoom() < 17) {
        map.flyTo([userLocation.lat, userLocation.lng], 18, {
          animate: true,
          duration: 1.2,
        });
      } else {
        // Continuous smooth camera tracking as user physically moves
        map.panTo([userLocation.lat, userLocation.lng], {
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25,
        });
      }
    } else if (!isNavigating) {
      // Fit bounds to entire route overview
      const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (activeRoute && activeRoute.coordinates.length > 0) {
        const bounds = L.latLngBounds(activeRoute.coordinates.map((c) => [c[0], c[1]]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    }
  }, [routes, selectedRouteId, isNavigating, userLocation?.lat, userLocation?.lng, map]);

  return null;
}

// In-Map Floating Re-center GPS Button
function RecenterButton({ userLocation }: { userLocation?: { lat: number; lng: number } | null }) {
  const map = useMap();
  if (!userLocation) return null;

  return (
    <button
      onClick={() => {
        map.flyTo([userLocation.lat, userLocation.lng], 18, { animate: true, duration: 0.8 });
      }}
      title="Re-center onto Live GPS"
      style={{
        position: 'absolute',
        bottom: 110,
        right: 24,
        zIndex: 1000,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#151928',
        border: '1.5px solid rgba(56, 189, 248, 0.5)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        color: '#38bdf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    </button>
  );
}

export default function SafeSphereMap({
  routes,
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
  environmentalFeatures = [],
  reportedIncidents = [],
  isNavigating = false,
  userLocation = null,
  traveledCoordinates = [],
  remainingCoordinates = [],
}: SafeSphereMapProps) {
  const initialCenter: [number, number] = [origin.lat, origin.lng];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', background: '#0B0D14' }}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ width: '100%', height: '100%', minHeight: '400px', background: '#0B0D14' }}
        zoomControl={false}
      >
        {/* CartoDB Dark OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <MapNavigationController
          routes={routes}
          selectedRouteId={selectedRouteId}
          isNavigating={isNavigating}
          userLocation={userLocation}
        />

        {/* 1. In standard mode: render alternative non-selected routes */}
        {!isNavigating &&
          routes
            .filter((r) => r.id !== selectedRouteId)
            .map((route) => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                eventHandlers={{
                  click: () => onSelectRoute(route.id),
                }}
                pathOptions={{
                  color: route.routeType === 'fastest' ? '#f87171' : '#64748b',
                  weight: 4,
                  opacity: 0.5,
                  dashArray: route.routeType === 'fastest' ? '6 6' : undefined,
                }}
              />
            ))}

        {/* 2. Render Active Selected Route / Remaining Path */}
        {!isNavigating &&
          routes
            .filter((r) => r.id === selectedRouteId)
            .map((route) => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                pathOptions={{
                  color: route.routeType === 'safest' ? '#818cf8' : route.routeType === 'balanced' ? '#38bdf8' : '#f87171',
                  weight: 6.5,
                  opacity: 1,
                }}
              />
            ))}

        {/* 3. In Navigation Mode: Render Traveled Trail vs Remaining Glow Path */}
        {isNavigating && traveledCoordinates.length > 1 && (
          <Polyline
            positions={traveledCoordinates}
            pathOptions={{
              color: '#64748b',
              weight: 5,
              opacity: 0.45,
            }}
          />
        )}

        {isNavigating && remainingCoordinates.length > 0 && (
          <Polyline
            positions={remainingCoordinates}
            pathOptions={{
              color: '#38bdf8',
              weight: 7,
              opacity: 1,
            }}
          />
        )}

        {/* 4. Live User Location Navigation Puck */}
        {isNavigating && userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationPuck(userLocation.heading || 0)}
            zIndexOffset={1000}
          >
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0284c7' }}>Live Location Tracing</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>Tracing path in real-time onto road corridor</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real Environmental Safety Feature Markers */}
        {environmentalFeatures.map((feat) => (
          <Marker
            key={feat.id}
            position={[feat.lat, feat.lng]}
            icon={createFeatureIcon(feat.type)}
          >
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{feat.name}</div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>{feat.description}</div>
                <div style={{ fontSize: '0.68rem', color: '#6366f1', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>
                  OSM Verified Entity ({feat.type.replace('_', ' ')})
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Real User-Reported Incident Markers */}
        {(reportedIncidents || []).map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.lat, inc.lng]}
            icon={createIncidentMarkerIcon(inc.severity)}
          >
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#dc2626' }}>
                  ⚠️ Reported Hazard: {inc.type}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>{inc.description}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4 }}>
                  Severity: <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{inc.severity}</span> • Reported within 30 days
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Origin Marker */}
        {!isNavigating && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>Origin Location</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{origin.address}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
          <Popup>
            <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>Target Destination</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{destination.address}</div>
            </div>
          </Popup>
        </Marker>
        {/* In-Map Re-center GPS Button when navigating */}
        {isNavigating && <RecenterButton userLocation={userLocation} />}
      </MapContainer>

      {/* Map Legend — fixed to bottom-left */}
      {!isNavigating && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '12px',
          zIndex: 1000,
          background: 'rgba(11,13,20,0.88)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          minWidth: '140px',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
            Map Legend
          </div>
          {[
            { emoji: '🏥', label: 'Hospital / Clinic', color: '#f87171' },
            { emoji: '👮', label: 'Police Station',    color: '#38bdf8' },
            { emoji: '📹', label: 'CCTV Camera',       color: '#a855f7' },
            { emoji: '💡', label: 'Street Lamp',       color: '#facc15' },
            { emoji: '⚠️', label: 'Reported Hazard',   color: '#ef4444' },
          ].map(({ emoji, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '14px',
                width: '20px', textAlign: 'center',
                filter: `drop-shadow(0 0 4px ${color}99)`,
              }}>{emoji}</span>
              <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
