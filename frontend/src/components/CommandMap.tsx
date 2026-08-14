import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  status: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CommandMapProps {
  markers: MapMarkerData[];
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
}

// Custom DivIcon generator to match dark navy & teal / purple / red aesthetic
function createCustomIcon(marker: MapMarkerData) {
  let bgColor = '#818cf8';
  let pulseColor = 'rgba(129, 140, 248, 0.4)';
  let borderColor = '#4338ca';

  if (marker.type === 'incident') {
    if (marker.severity === 'HIGH') {
      bgColor = '#ef4444';
      pulseColor = 'rgba(239, 68, 68, 0.5)';
      borderColor = '#b91c1c';
    } else if (marker.severity === 'MEDIUM') {
      bgColor = '#f59e0b';
      pulseColor = 'rgba(245, 158, 11, 0.4)';
      borderColor = '#d97706';
    } else {
      bgColor = '#94a3b8';
      pulseColor = 'rgba(148, 163, 184, 0.3)';
      borderColor = '#64748b';
    }
  } else if (marker.type === 'safe_haven') {
    bgColor = '#2dd4bf';
    pulseColor = 'rgba(45, 212, 191, 0.4)';
    borderColor = '#0f766e';
  } else if (marker.type === 'police' || marker.type === 'patrol') {
    bgColor = '#60a5fa';
    pulseColor = 'rgba(96, 165, 250, 0.4)';
    borderColor = '#2563eb';
  } else if (marker.type === 'high_risk') {
    bgColor = '#f43f5e';
    pulseColor = 'rgba(244, 63, 94, 0.5)';
    borderColor = '#be123c';
  }

  const html = `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${pulseColor};
        animation: pulse-ring 2s ease-out infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${bgColor};
        border: 2px solid ${borderColor};
        box-shadow: 0 0 10px ${bgColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function CommandMap({
  markers,
  center = [41.8781, -87.6298],
  zoom = 12,
  showHeatmap = false,
}: CommandMapProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#0B0D14' }}
        zoomControl={false}
      >
        {/* CartoDB Free Dark Basemap Tile Layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <MapRecenter center={center} />

        {/* Render Markers */}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={createCustomIcon(m)}
          >
            <Popup>
              <div style={{ color: '#0B0D14', padding: '4px 2px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{m.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{m.status}</div>
                {m.severity && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: m.severity === 'HIGH' ? '#fee2e2' : '#fef3c7',
                    color: m.severity === 'HIGH' ? '#b91c1c' : '#92400e',
                  }}>
                    {m.severity} SEVERITY
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
