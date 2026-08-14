import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RouteOptionData } from '../mock/delhiRouteData';
import type { EnvironmentalSafetyFeature } from '../services/overpassEnvironmentalData';

interface SafeSphereMapProps {
  routes: RouteOptionData[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  environmentalFeatures?: EnvironmentalSafetyFeature[];
  pois?: any[];
  showSafetyZones?: boolean;
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

// Real Environmental Feature Marker Icons (Police, Street Lamps, CCTV, Hospitals)
function createFeatureIcon(type: 'street_lamp' | 'police' | 'cctv' | 'hospital') {
  let borderColor = '#818cf8';
  let char = '💡';

  if (type === 'police') {
    borderColor = '#38bdf8';
    char = '👮';
  } else if (type === 'cctv') {
    borderColor = '#a855f7';
    char = '📹';
  } else if (type === 'hospital') {
    borderColor = '#f87171';
    char = '🏥';
  } else if (type === 'street_lamp') {
    borderColor = '#facc15';
    char = '💡';
  }

  return L.divIcon({
    html: `
      <div style="
        width: 24px; height: 24px; border-radius: 50%;
        background: #111522;
        border: 2px solid ${borderColor};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 8px ${borderColor}99;
        font-size: 11px;
      ">
        ${char}
      </div>
    `,
    className: 'environmental-feature-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Component to fit map bounds automatically around selected route
function MapBoundsUpdater({ routes, selectedRouteId }: { routes: RouteOptionData[]; selectedRouteId: string }) {
  const map = useMap();

  useEffect(() => {
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds(activeRoute.coordinates.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [routes, selectedRouteId, map]);

  return null;
}

export default function SafeSphereMap({
  routes,
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
  environmentalFeatures = [],
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
        {/* CartoDB Dark OpenStreetMap Tiles with Attribution */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <MapBoundsUpdater routes={routes} selectedRouteId={selectedRouteId} />

        {/* Render Non-Selected Route Polylines */}
        {routes
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

        {/* Render Selected Active Route Polyline (Thick, Radiant Indigo Glow) */}
        {routes
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

        {/* Real Environmental Safety Feature Markers from Overpass API (Street Lamps, Police, CCTV, Hospitals) */}
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

        {/* Origin Marker */}
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup>
            <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>Origin Location</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{origin.address}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
          <Popup>
            <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>Target Destination</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{destination.address}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
