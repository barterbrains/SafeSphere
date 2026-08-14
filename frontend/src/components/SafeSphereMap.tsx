import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RouteOptionData, SafetyZonePOI } from '../mock/delhiRouteData';

interface SafeSphereMapProps {
  routes: RouteOptionData[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  pois?: SafetyZonePOI[];
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

// POI Icons matching SafeSphere branding
function createPoiIcon(type: string) {
  let color = '#2dd4bf';
  let char = '🛡';
  if (type === 'police') {
    color = '#818cf8';
    char = '👮';
  } else if (type === 'hospital') {
    color = '#f87171';
    char = '🏥';
  } else if (type === 'high_footfall') {
    color = '#60a5fa';
    char = '👥';
  } else if (type === 'incident') {
    color = '#f59e0b';
    char = '⚠️';
  }

  return L.divIcon({
    html: `
      <div style="
        width: 26px; height: 26px; border-radius: 50%;
        background: #121522;
        border: 2px solid ${color};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 8px ${color}88;
        font-size: 11px;
      ">
        ${char}
      </div>
    `,
    className: 'poi-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
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
  pois = [],
  showSafetyZones = true,
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

        {/* Safety Zone Visualizations (Subtle SafeScore Circles) */}
        {showSafetyZones && (
          <>
            {/* Safe Haven Corridor Circle (Green/Teal) */}
            <Circle
              center={[28.6230, 77.2205]}
              radius={400}
              pathOptions={{
                color: '#2dd4bf',
                fillColor: '#2dd4bf',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4 4',
              }}
            />
            {/* Caution/Reduced Illumination Area Circle (Amber) */}
            <Circle
              center={[28.6260, 77.2280]}
              radius={300}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.07,
                weight: 1.5,
                dashArray: '3 3',
              }}
            />
          </>
        )}

        {/* Render 3 Polylines (Unselected first, Selected on Top) */}
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
                weight: 3.5,
                opacity: 0.45,
                dashArray: route.routeType === 'fastest' ? '6 6' : undefined,
              }}
            />
          ))}

        {/* Selected Route Polyline (Highlighted, Thick, Glowing) */}
        {routes
          .filter((r) => r.id === selectedRouteId)
          .map((route) => (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{
                color: route.routeType === 'safest' ? '#818cf8' : route.routeType === 'balanced' ? '#94a3b8' : '#f87171',
                weight: 6.5,
                opacity: 1,
              }}
            />
          ))}

        {/* POI Markers */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={createPoiIcon(poi.type)}
          >
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{poi.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{poi.description}</div>
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
