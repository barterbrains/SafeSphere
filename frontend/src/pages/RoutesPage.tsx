import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, ShieldCheck, Activity, Users, ArrowLeft, Loader2, Navigation } from 'lucide-react';
import SafeSphereMap from '../components/SafeSphereMap';
import { RouteAnalysisPanel } from '../components/RouteAnalysisPanel';
import { InstitutionNav } from './institution/InstitutionNav';
import { DELHI_DEMO_ROUTES, DELHI_SAFETY_POIS } from '../mock/delhiRouteData';
import type { RouteOptionData } from '../mock/delhiRouteData';
import { apiFetch } from '../utils';
import { fetchOSRMRealRoutes } from '../services/osrmRouting';
import { searchGeocodingNominatim, type GeocodingResult } from '../services/geocoding';
import { fetchEnvironmentalSafetyData, type EnvironmentalSafetyFeature } from '../services/overpassEnvironmentalData';
import { fetchIncidentsAlongRoute, reportIncidentToSupabase, type UserReportedIncident } from '../services/incidentService';
import { useAuth } from '../context/AuthContext';

export default function RoutesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isOSRMActive, setIsOSRMActive] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Environmental Safety Features from Overpass API
  const [environmentalFeatures, setEnvironmentalFeatures] = useState<EnvironmentalSafetyFeature[]>([]);
  const [isLoadingOverpass, setIsLoadingOverpass] = useState(false);

  // Real User Reported Incidents from Supabase
  const [reportedIncidents, setReportedIncidents] = useState<UserReportedIncident[]>([]);

  // Report Incident Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('Poor / Broken Street Lighting');
  const [reportSeverity, setReportSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessBanner, setReportSuccessBanner] = useState<string | null>(null);

  const [isRerouting, setIsRerouting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(destination.address);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);

  // ── Fetch Real Turn-by-Turn Road Routes via OSRM ─────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadRoadRoutes() {
      setIsLoadingRoutes(true);
      setRoutingError(null);

      const result = await fetchOSRMRealRoutes(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng }
      );

      if (!isMounted) return;

      if (!result.isFallback && result.routes.length > 0) {
        setRoutes(result.routes);
        setSelectedRouteId(result.routes[0].id);
        setIsOSRMActive(true);

        // Fetch real Overpass environmental safety data for the active route
        setIsLoadingOverpass(true);
        fetchEnvironmentalSafetyData(result.routes[0].coordinates)
          .then(summary => {
            if (isMounted) {
              setEnvironmentalFeatures(summary.features);
            }
          })
          .finally(() => {
            if (isMounted) setIsLoadingOverpass(false);
          });

        // Fetch real incidents within route buffer from Supabase
        fetchIncidentsAlongRoute(result.routes[0].coordinates).then(incidents => {
          if (isMounted) {
            setReportedIncidents(incidents);
          }
        });
      } else {
        // Graceful fallback to static demo corridor if OSRM is unreachable
        console.log('[SafeSphere] Using cached road network fallback');
        setRoutes(DELHI_DEMO_ROUTES);
        setSelectedRouteId(DELHI_DEMO_ROUTES[0].id);
        setIsOSRMActive(false);
        if (result.errorMessage) {
          setRoutingError('Public OSRM server rate-limited; showing offline road corridor.');
        }
      }
      setIsLoadingRoutes(false);
    }

    loadRoadRoutes();
    return () => { isMounted = false; };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // ── When active route changes, update Overpass features & Incidents ───────
  useEffect(() => {
    const active = routes.find(r => r.id === selectedRouteId);
    if (active && active.coordinates.length > 0) {
      fetchEnvironmentalSafetyData(active.coordinates).then(summary => {
        setEnvironmentalFeatures(summary.features);
      });
      fetchIncidentsAlongRoute(active.coordinates).then(incidents => {
        setReportedIncidents(incidents);
      });
    }
  }, [selectedRouteId, routes]);

  // ── Handle Incident Submission ───────────────────────────────────────────
  const handleSubmitIncidentReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    setIsSubmittingReport(true);
    // Pin at active route mid-point or origin
    const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    const midIndex = Math.floor(activeRoute.coordinates.length / 2);
    const pinCoord = activeRoute.coordinates[midIndex] || [origin.lat, origin.lng];

    const { data, error } = await reportIncidentToSupabase({
      userId: user?.id,
      lat: pinCoord[0],
      lng: pinCoord[1],
      type: reportType,
      severity: reportSeverity,
      description: reportDescription,
      address: destination.address,
    });

    setIsSubmittingReport(false);

    if (data) {
      setReportedIncidents(prev => [data, ...prev]);
      setReportSuccessBanner('Incident reported successfully! The community corridor map has been updated.');
      setIsReportModalOpen(false);
      setReportDescription('');
      setTimeout(() => setReportSuccessBanner(null), 5000);
    } else {
      // Optimistic local add
      const fallbackReport: UserReportedIncident = {
        id: `local-inc-${Date.now()}`,
        lat: pinCoord[0],
        lng: pinCoord[1],
        type: reportType,
        severity: reportSeverity,
        description: reportDescription,
        address: destination.address,
        created_at: new Date().toISOString(),
      };
      setReportedIncidents(prev => [fallbackReport, ...prev]);
      setReportSuccessBanner('Incident logged locally. Thank you for keeping the corridor safe!');
      setIsReportModalOpen(false);
      setReportDescription('');
      setTimeout(() => setReportSuccessBanner(null), 5000);
    }
  };

  // ── Real Nominatim Geocoding with 450ms Debounce ─────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery === destination.address) {
      setSearchResults([]);
      setIsSearchingGeocode(false);
      return;
    }

    setIsSearchingGeocode(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGeocodingNominatim(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Nominatim search failed:', err);
      } finally {
        setIsSearchingGeocode(false);
      }
    }, 450); // 450ms compliant rate-limit debounce

    return () => clearTimeout(timer);
  }, [searchQuery, destination.address]);

  const handleSelectDestination = (destItem: GeocodingResult) => {
    setDestination({
      lat: destItem.lat,
      lng: destItem.lng,
      address: destItem.name || destItem.address.split(',')[0],
    });
    setSearchQuery(destItem.name || destItem.address.split(',')[0]);
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
      // Fallback demo mock journey
      navigate(`/journey/demo-journey-123`);
    }
  };

  // Simulated Safety Alert Event demo trigger
  const handleSimulateIncident = () => {
    setIsRerouting(true);
    // Lower score of current selected route and auto-switch to a safer detour
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
      <InstitutionNav />

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
              {isSearchingGeocode ? (
                <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
              ) : (
                <Search size={16} color="#818cf8" className="shrink-0" />
              )}
              <input
                type="text"
                placeholder="Search any destination in Delhi NCR..."
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

            {/* Nominatim Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
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
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {searchResults.map((res, i) => (
                  <div
                    key={res.id || i}
                    onClick={() => handleSelectDestination(res)}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      fontSize: '0.82rem',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MapPin size={16} color="#818cf8" className="shrink-0" />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#FFFFFF', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {res.name}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {res.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OSRM Routing Live Badge & Fallback Warning */}
          <div style={{
            background: isOSRMActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: isOSRMActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: 12,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}>
            {isLoadingRoutes ? (
              <>
                <Loader2 size={15} className="animate-spin text-indigo-400" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8' }}>
                  Calculating OSRM Road Routes...
                </span>
              </>
            ) : (
              <>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isOSRMActive ? '#10b981' : '#818cf8',
                  boxShadow: isOSRMActive ? '0 0 10px #10b981' : '0 0 8px #818cf8',
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isOSRMActive ? '#6ee7b7' : '#c7d2fe' }}>
                  {isOSRMActive ? 'Live OSRM Turn-by-Turn Foot Routes' : 'Road Network Corridor'}
                </span>
              </>
            )}
          </div>

          {/* Report an Incident Action Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
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
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <AlertTriangle size={14} color="#EF4444" />
            <span>Report Incident</span>
          </button>

          {/* Simulate Safety Alert (Interactive Demo Button) */}
          <button
            onClick={handleSimulateIncident}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#c7d2fe',
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
            <Activity size={14} />
            <span>Simulate Risk Alert</span>
          </button>
        </div>

        {/* Report Success Feedback Toast */}
        {reportSuccessBanner && (
          <div style={{
            position: 'absolute',
            top: 76,
            left: 24,
            zIndex: 1001,
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <ShieldCheck size={16} />
            <span>{reportSuccessBanner}</span>
          </div>
        )}

        {/* The Leaflet OpenStreetMap Container */}
        <div style={{ flex: 1, width: '100%', height: '100%' }}>
          <SafeSphereMap
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={id => setSelectedRouteId(id)}
            origin={origin}
            destination={destination}
            environmentalFeatures={environmentalFeatures}
            reportedIncidents={reportedIncidents}
          />
        </div>

        {/* ── Report Incident Community Modal ── */}
        {isReportModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}>
            <div style={{
              background: '#121522',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                }}>
                  <AlertTriangle size={18} color="#EF4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF' }}>Report a Safety Incident / Hazard</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Your report updates the live safety score for fellow pedestrians.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitIncidentReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>
                    Hazard / Incident Category
                  </label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1a1f33',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      padding: '10px 12px',
                      borderRadius: 10,
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Poor / Broken Street Lighting">Poor / Broken Street Lighting</option>
                    <option value="Harassment / Unsafe Gathering">Harassment / Unsafe Gathering</option>
                    <option value="Isolated / Blind Spot">Isolated Stretch / Blind Spot</option>
                    <option value="Aggressive Stray Animals">Aggressive Stray Animals</option>
                    <option value="Road Construction Obstruction">Road Construction Obstruction</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>
                    Severity Level
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {(['low', 'medium', 'high', 'critical'] as const).map(sev => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setReportSeverity(sev)}
                        style={{
                          background: reportSeverity === sev ? (sev === 'critical' || sev === 'high' ? '#ef4444' : '#6366f1') : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${reportSeverity === sev ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: '#FFFFFF',
                          padding: '8px 0',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>
                    Description & Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the hazard (e.g. 3 street lamps broken near bus stop, dark stretch)..."
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#1a1f33',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      padding: '10px 12px',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94A3B8',
                      padding: '10px 0',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport || !reportDescription.trim()}
                    style={{
                      flex: 1,
                      background: '#ef4444',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '10px 0',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: isSubmittingReport ? 'not-allowed' : 'pointer',
                      opacity: isSubmittingReport || !reportDescription.trim() ? 0.6 : 1,
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Right Floating Route Analysis Panel (Matching Reference) ── */}
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
