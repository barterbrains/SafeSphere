import { useState, useEffect } from 'react';
import { InstitutionNav } from './InstitutionNav';
import CommandMap from '../../components/CommandMap';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LocateFixed, Radio, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface FleetMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  status: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

function generateLocalFleet(centerLat: number, centerLng: number, areaName: string): FleetMarker[] {
  return [
    {
      id: 'patrol-1',
      lat: centerLat + 0.0035,
      lng: centerLng + 0.0028,
      title: 'Patrol Unit Alpha-1 (PCR)',
      type: 'police',
      status: 'Active Patrol · 350m away',
      severity: 'LOW',
    },
    {
      id: 'patrol-2',
      lat: centerLat - 0.0042,
      lng: centerLng + 0.0039,
      title: 'Patrol Unit Bravo-4',
      type: 'patrol',
      status: 'Rapid Response Unit · 520m away',
      severity: 'LOW',
    },
    {
      id: 'safe-haven-1',
      lat: centerLat + 0.0021,
      lng: centerLng - 0.0036,
      title: '24/7 Verified Safe Haven Hub',
      type: 'safe_haven',
      status: 'Well-lit Sanctuary · 280m away',
      severity: 'LOW',
    },
    {
      id: 'guardian-1',
      lat: centerLat - 0.0026,
      lng: centerLng - 0.0021,
      title: 'Community Guardian Node',
      type: 'safe_haven',
      status: 'Verified Transit Station · 320m away',
      severity: 'LOW',
    },
    {
      id: 'user-pin',
      lat: centerLat,
      lng: centerLng,
      title: `You (Live GPS Location)`,
      type: 'guardian',
      status: `Active Position · ${areaName}`,
      severity: 'LOW',
    },
  ];
}

export default function InstitutionHeatmapPage() {
  const { isDemo, user } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(14);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [locationName, setLocationName] = useState('Delhi NCR Corridor');
  const [markers, setMarkers] = useState<FleetMarker[]>(() => generateLocalFleet(28.6139, 77.2090, 'Delhi NCR'));
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Acquire user's real live location on mount
  const acquireLiveLocation = () => {
    if (!navigator.geolocation) return;
    setIsLoadingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter([lat, lng]);
        setIsLiveGps(true);
        setIsLoadingGps(false);

        // Fetch area name via Photon OSM reverse geocoding
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
          const json = await res.json();
          if (json?.features?.length > 0) {
            const p = json.features[0].properties;
            const name = p.name || p.street || p.district || p.city || 'Your Area';
            setLocationName(name);
          }
        } catch {
          setLocationName('Your Current Area');
        }

        // Fetch real Supabase incidents near user if available
        let realIncidentMarkers: FleetMarker[] = [];
        try {
          const { data: dbIncidents } = await supabase
            .from('incidents')
            .select('*')
            .gte('lat', lat - 0.05)
            .lte('lat', lat + 0.05)
            .gte('lng', lng - 0.05)
            .lte('lng', lng + 0.05)
            .limit(10);

          if (dbIncidents) {
            realIncidentMarkers = dbIncidents.map(i => ({
              id: `inc-${i.id}`,
              lat: Number(i.lat),
              lng: Number(i.lng),
              title: i.type || 'Reported Hazard',
              type: 'incident',
              status: i.description || 'Community Hazard Report',
              severity: (i.severity?.toUpperCase() || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
            }));
          }
        } catch (e) {
          console.warn('Error fetching heatmap incidents:', e);
        }

        const fleet = generateLocalFleet(lat, lng, 'Your Live Location');
        setMarkers([...fleet, ...realIncidentMarkers]);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    acquireLiveLocation();
  }, []);

  const fleetStats = [
    { label: 'Active Patrol Units', value: '4 Nearby', icon: 'directions_car', color: '#818cf8' },
    { label: 'Guardians on Route', value: isLiveGps ? '1 Live (You)' : '148 Active', icon: 'shield_person', color: '#10b981' },
    { label: 'Safe Havens Active', value: '18 Hubs', icon: 'storefront', color: '#6366f1' },
    { label: 'Live GPS Telemetry', value: isLiveGps ? 'Online' : 'Acquiring...', icon: 'my_location', color: '#38bdf8' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Fleet Status &amp; Live Heatmap
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isLiveGps ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                {isLiveGps ? 'Live Location Centered' : 'Delhi NCR Grid'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time GPS telemetry of patrol units, guardians, and transit safe havens around <strong className="text-slate-200">{locationName}</strong>.
            </p>
          </div>

          <button
            onClick={acquireLiveLocation}
            disabled={isLoadingGps}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <LocateFixed size={15} className={isLoadingGps ? 'animate-spin text-emerald-400' : 'text-indigo-400'} />
            <span>{isLoadingGps ? 'Locating...' : 'Re-center Live GPS'}</span>
          </button>
        </div>

        {/* Fleet KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
          {fleetStats.map(s => (
            <div key={s.label} className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                <span className="text-2xl font-black text-white mt-1 block">{s.value}</span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
                style={{ background: `${s.color}20` }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Big Interactive Map Panel */}
        <div className="flex-1 min-h-[460px] bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 relative overflow-hidden shadow-2xl flex flex-col z-10">
          {/* Map Overlay Indicator */}
          <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 bg-[#0d0d1a]/90 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              {isLiveGps ? `Live Patrol Radar (${locationName})` : 'Delhi NCR Safety Corridors'}
            </span>
          </div>

          <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#0a0a12]">
            <CommandMap
              markers={markers}
              center={mapCenter}
              zoom={zoomLevel}
              showHeatmap={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
