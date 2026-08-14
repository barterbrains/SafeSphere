import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, AlertTriangle, ShieldCheck, Activity, Users,
  ArrowLeft, Loader2, Navigation, Crosshair, ArrowUpDown, CheckCircle2,
  Compass, Sparkles, LocateFixed, CornerUpRight, CornerUpLeft, ArrowUp,
  X, Radio, Footprints, Target, Shield, Navigation2, Zap, ShieldAlert
} from 'lucide-react';
import SafeSphereMap from '../components/SafeSphereMap';
import { RouteAnalysisPanel } from '../components/RouteAnalysisPanel';
import { InstitutionNav } from './institution/InstitutionNav';
import { RiskAlertSafetyModal } from '../components/RiskAlertSafetyModal';
import { DELHI_DEMO_ROUTES, DELHI_SAFETY_POIS } from '../mock/delhiRouteData';
import type { RouteOptionData, NavigationStep } from '../mock/delhiRouteData';
import { apiFetch } from '../utils';
import { fetchOSRMRealRoutes } from '../services/osrmRouting';
import { searchGeocodingNominatim, reverseGeocodeNominatim, type GeocodingResult } from '../services/geocoding';
import { fetchEnvironmentalSafetyData, type EnvironmentalSafetyFeature, type EnvironmentalSafetySummary } from '../services/overpassEnvironmentalData';
import { fetchIncidentsAlongRoute, reportIncidentToSupabase, type UserReportedIncident } from '../services/incidentService';
import { calculateAllRouteSafetyMetrics } from '../services/safeScoreEngine';
import { useAuth } from '../context/AuthContext';

/**
 * Calculates geodesic distance in meters between two lat/lng points.
 */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180, p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Finds the closest index along the road polyline from user's current GPS location.
 */
function findClosestRouteCoordIndex(userLat: number, userLng: number, coords: [number, number][]): number {
  let minDistance = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const dist = haversineMeters(userLat, userLng, coords[i][0], coords[i][1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i;
    }
  }
  return closestIdx;
}

/**
 * Calculates bearing between two coordinates for live heading orientation.
 */
function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const phi1 = lat1 * (Math.PI / 180);
  const phi2 = lat2 * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export default function RoutesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const destAddressParam = searchParams.get('destAddress') || 'India Gate, New Delhi';
  const originAddressParam = searchParams.get('originAddress');

  // Origin & Destination coordinates
  const [origin, setOrigin] = useState({
    lat: 28.6315,
    lng: 77.2167,
    address: originAddressParam || 'Connaught Place, New Delhi',
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
  const [environmentalSummary, setEnvironmentalSummary] = useState<EnvironmentalSafetySummary>({
    streetLampsCount: 0,
    policeStationsCount: 0,
    cctvCount: 0,
    hospitalsCount: 0,
    features: [],
  });
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

  // ── Dual Origin & Destination Geocoding State ──
  const [originQuery, setOriginQuery] = useState(origin.address);
  const [isOriginSearchOpen, setIsOriginSearchOpen] = useState(false);
  const [isSearchingOriginGeocode, setIsSearchingOriginGeocode] = useState(false);
  const [originSearchResults, setOriginSearchResults] = useState<GeocodingResult[]>([]);

  const [destQuery, setDestQuery] = useState(destination.address);
  const [isDestSearchOpen, setIsDestSearchOpen] = useState(false);
  const [isSearchingDestGeocode, setIsSearchingDestGeocode] = useState(false);
  const [destSearchResults, setDestSearchResults] = useState<GeocodingResult[]>([]);

  // ── Live Geolocation / GPS State ──
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [isUsingLiveLocation, setIsUsingLiveLocation] = useState(false);

  // ── Simulated Risk Alert & Interactive Safety Check State ──
  const [isRiskAlertOpen, setIsRiskAlertOpen] = useState(false);
  const [riskAlertToast, setRiskAlertToast] = useState<string | null>(null);

  const handleSimulateRiskAlert = () => {
    setIsRiskAlertOpen(true);
  };

  const handleAutoRerouteSafe = () => {
    const otherRoutes = routes.filter(r => r.id !== selectedRouteId);
    const safestAlt = otherRoutes.length > 0
      ? otherRoutes.reduce((prev, curr) => curr.safeScore > prev.safeScore ? curr : prev, otherRoutes[0])
      : routes[0];

    if (safestAlt) {
      setSelectedRouteId(safestAlt.id);
      setNavCoordIndex(0);
      setRiskAlertToast(`✅ Safely rerouted via ${safestAlt.name}! Safety Score restored to ${safestAlt.safeScore}`);
      setTimeout(() => setRiskAlertToast(null), 5000);
    }
  };

  // ── Submit Incident Report to Supabase + Local Store ──
  const handleSubmitIncidentReport = async () => {
    setIsSubmittingReport(true);
    const reportLat = userNavLocation?.lat || origin.lat;
    const reportLng = userNavLocation?.lng || origin.lng;

    const result = await reportIncidentToSupabase({
      userId: user?.id || null,
      lat: reportLat,
      lng: reportLng,
      type: reportType,
      severity: reportSeverity,
      description: reportDescription || `Reported: ${reportType}`,
      address: destination.address,
    });

    if (result.data) {
      // Also add to local reportedIncidents for immediate map display
      setReportedIncidents(prev => [result.data!, ...prev]);

      setReportSuccessBanner(`✅ Incident "${reportType}" reported successfully and saved to analytics!`);
      setTimeout(() => setReportSuccessBanner(null), 5000);
      setIsReportModalOpen(false);
      setReportDescription('');
    } else {
      setReportSuccessBanner(`⚠️ ${result.error || 'Failed to submit report. Try again.'}`);
      setTimeout(() => setReportSuccessBanner(null), 5000);
    }

    setIsSubmittingReport(false);
  };

  // ── Pure Real-Time Turn-by-Turn GPS Tracking State ──
  const [isNavigating, setIsNavigating] = useState(false);
  const [userNavLocation, setUserNavLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [navCoordIndex, setNavCoordIndex] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [walkingSpeedKmh, setWalkingSpeedKmh] = useState<number | null>(null);

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
        setIsOSRMActive(true);

        // Fetch real Overpass environmental safety data for the primary route
        setIsLoadingOverpass(true);
        const [envSummary, incs] = await Promise.all([
          fetchEnvironmentalSafetyData(result.routes[0].coordinates),
          fetchIncidentsAlongRoute(result.routes[0].coordinates),
        ]);

        if (isMounted) {
          setEnvironmentalFeatures(envSummary.features);
          setEnvironmentalSummary(envSummary);
          setReportedIncidents(incs);
          setIsLoadingOverpass(false);

          // Score all routes together — required for relative comparisons
          const allMetrics = calculateAllRouteSafetyMetrics(result.routes, envSummary, incs);
          const enrichedRoutes: RouteOptionData[] = result.routes.map((r, idx) => ({
            ...r,
            safeScore:     allMetrics[idx].safeScore,
            tags:          allMetrics[idx].tags,
            explanation:   allMetrics[idx].explanation,
            safetyFactors: allMetrics[idx].safetyFactors,
          }));

          setRoutes(enrichedRoutes);
          setSelectedRouteId(enrichedRoutes[0].id);
        }
      } else {
        // Fallback demo corridor
        setRoutes(DELHI_DEMO_ROUTES);
        setSelectedRouteId(DELHI_DEMO_ROUTES[0].id);
        setIsOSRMActive(false);
        if (result.errorMessage) {
          setRoutingError('Public OSRM server rate-limited; showing offline road corridor.');
        }

        setIsLoadingOverpass(true);
        const [envSummary, incs] = await Promise.all([
          fetchEnvironmentalSafetyData(DELHI_DEMO_ROUTES[0].coordinates),
          fetchIncidentsAlongRoute(DELHI_DEMO_ROUTES[0].coordinates),
        ]);
        if (isMounted) {
          setEnvironmentalFeatures(envSummary.features);
          setEnvironmentalSummary(envSummary);
          setReportedIncidents(incs);
          setIsLoadingOverpass(false);
        }
      }
      setIsLoadingRoutes(false);
    }

    loadRoadRoutes();
    return () => { isMounted = false; };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // ── When active route changes, update Overpass features & recalculate SafeScores ──
  useEffect(() => {
    let isMounted = true;
    const active = routes.find(r => r.id === selectedRouteId);
    if (active && active.coordinates.length > 0) {
      Promise.all([
        fetchEnvironmentalSafetyData(active.coordinates),
        fetchIncidentsAlongRoute(active.coordinates),
      ]).then(([envSummary, incs]) => {
        if (!isMounted) return;
        setEnvironmentalFeatures(envSummary.features);
        setEnvironmentalSummary(envSummary);
        setReportedIncidents(incs);

        const allMetrics = calculateAllRouteSafetyMetrics(routes, envSummary, incs);
        setRoutes(prevRoutes =>
          prevRoutes.map((r, idx) => ({
            ...r,
            safeScore:     allMetrics[idx].safeScore,
            tags:          allMetrics[idx].tags,
            explanation:   allMetrics[idx].explanation,
            safetyFactors: allMetrics[idx].safetyFactors,
          }))
        );
      });
    }
    return () => { isMounted = false; };
  }, [selectedRouteId]);

  // ── Acquire User's Real Live GPS Location ──────────────────────────────
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ text: 'Geolocation is not supported by your browser.', type: 'error' });
      setTimeout(() => setGpsStatus(null), 4000);
      return;
    }

    setIsAcquiringGPS(true);
    setGpsStatus({ text: 'Acquiring GPS position from your device...', type: 'info' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const rev = await reverseGeocodeNominatim(lat, lng);
          const formattedName = rev.name ? `${rev.name} (My Location)` : 'My Current Location';
          
          setOrigin({
            lat,
            lng,
            address: formattedName,
          });
          setOriginQuery(formattedName);
          setIsUsingLiveLocation(true);
          setGpsStatus({ text: `📍 Located at ${rev.name || 'Current Position'}`, type: 'success' });
        } catch {
          setOrigin({
            lat,
            lng,
            address: 'My Current Location',
          });
          setOriginQuery('My Current Location');
          setIsUsingLiveLocation(true);
          setGpsStatus({ text: '📍 Live location acquired', type: 'success' });
        } finally {
          setIsAcquiringGPS(false);
          setTimeout(() => setGpsStatus(null), 4000);
        }
      },
      (err) => {
        console.warn('[SafeSphere] Geolocation error:', err);
        setIsAcquiringGPS(false);
        let errorMsg = 'Could not access GPS. Please type your starting location in the origin field.';
        if (err.code === 1) {
          errorMsg = 'Location permission denied. Type your starting point above or enable location access.';
        }
        setGpsStatus({ text: errorMsg, type: 'error' });
        setTimeout(() => setGpsStatus(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Auto-prompt / attempt live location on initial mount if not specified in search params
  useEffect(() => {
    if (!originAddressParam && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const rev = await reverseGeocodeNominatim(lat, lng);
            const formattedName = rev.name ? `${rev.name} (My Location)` : 'My Current Location';
            setOrigin({ lat, lng, address: formattedName });
            setOriginQuery(formattedName);
            setIsUsingLiveLocation(true);
          } catch {
            setOrigin({ lat, lng, address: 'My Current Location' });
            setOriginQuery('My Current Location');
            setIsUsingLiveLocation(true);
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [originAddressParam]);

  // ── Swap Origin and Destination ──────────────────────────────────────────
  const handleSwapLocations = () => {
    const prevOrigin = { ...origin };
    const prevDest = { ...destination };
    setOrigin(prevDest);
    setDestination(prevOrigin);
    setOriginQuery(prevDest.address);
    setDestQuery(prevOrigin.address);
    setIsUsingLiveLocation(false);
  };

  // ── High-Speed Geocoding for Origin (280ms Debounce) ─────────────────
  useEffect(() => {
    if (!originQuery.trim() || originQuery.trim().length < 2) {
      setOriginSearchResults([]);
      setIsSearchingOriginGeocode(false);
      return;
    }

    setIsSearchingOriginGeocode(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGeocodingNominatim(originQuery.trim());
        setOriginSearchResults(results);
      } catch (err) {
        console.error('Origin geocoding failed:', err);
      } finally {
        setIsSearchingOriginGeocode(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [originQuery]);

  // ── High-Speed Geocoding for Destination (280ms Debounce) ────────────
  useEffect(() => {
    if (!destQuery.trim() || destQuery.trim().length < 2) {
      setDestSearchResults([]);
      setIsSearchingDestGeocode(false);
      return;
    }

    setIsSearchingDestGeocode(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGeocodingNominatim(destQuery.trim());
        setDestSearchResults(results);
      } catch (err) {
        console.error('Destination geocoding failed:', err);
      } finally {
        setIsSearchingDestGeocode(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [destQuery]);

  const handleSelectOrigin = (origItem: GeocodingResult) => {
    setOrigin({
      lat: origItem.lat,
      lng: origItem.lng,
      address: origItem.name || origItem.address.split(',')[0],
    });
    setOriginQuery(origItem.name || origItem.address.split(',')[0]);
    setIsOriginSearchOpen(false);
    setIsUsingLiveLocation(false);
  };

  const handleSelectDestination = (destItem: GeocodingResult) => {
    setDestination({
      lat: destItem.lat,
      lng: destItem.lng,
      address: destItem.name || destItem.address.split(',')[0],
    });
    setDestQuery(destItem.name || destItem.address.split(',')[0]);
    setIsDestSearchOpen(false);
  };

  // ── Initiate Route → Switch directly into Live Turn-by-Turn GPS Tracking Mode ──
  const handleInitiateRoute = () => {
    const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      setIsNavigating(true);
      setHasArrived(false);

      // Record journey to local storage & Supabase so Command Center reflects it immediately
      const journeyRecord = {
        id: `jrn-${Date.now()}`,
        origin_name: origin.address,
        destination_name: destination.address,
        route_name: activeRoute.name,
        distance_km: activeRoute.distance,
        duration_min: activeRoute.duration,
        current_safe_score: activeRoute.safeScore,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      const userJourneysKey = `safesphere_user_journeys_${user?.id || (isDemo ? 'demo' : 'guest')}`;
      try {
        const raw = localStorage.getItem(userJourneysKey);
        const list = raw ? JSON.parse(raw) : [];
        localStorage.setItem(userJourneysKey, JSON.stringify([journeyRecord, ...list]));
      } catch {}

      if (user?.id) {
        supabase.from('journeys').insert({
          user_id: user.id,
          origin_name: origin.address,
          destination_name: destination.address,
          current_safe_score: activeRoute.safeScore,
          distance: activeRoute.distance,
          status: 'active',
        }).then(() => {}).catch(() => {});
      }

      // Immediately query high-accuracy device location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGpsAccuracy(Math.round(pos.coords.accuracy || 10));
            const closest = findClosestRouteCoordIndex(lat, lng, activeRoute.coordinates);
            setNavCoordIndex(closest);
            setUserNavLocation({
              lat,
              lng,
              heading: pos.coords.heading || 0,
            });
          },
          () => {
            // If initial GPS lock is pending, start at route origin
            setNavCoordIndex(0);
            setUserNavLocation({
              lat: activeRoute.coordinates[0][0],
              lng: activeRoute.coordinates[0][1],
              heading: 0,
            });
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setNavCoordIndex(0);
        setUserNavLocation({
          lat: activeRoute.coordinates[0][0],
          lng: activeRoute.coordinates[0][1],
          heading: 0,
        });
      }
    }
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setUserNavLocation(null);
    setNavCoordIndex(0);
    setHasArrived(false);

    // Update local journey status to completed for this specific user
    const userJourneysKey = `safesphere_user_journeys_${user?.id || (isDemo ? 'demo' : 'guest')}`;
    try {
      const raw = localStorage.getItem(userJourneysKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (list.length > 0) {
          list[0].status = 'completed';
          localStorage.setItem(userJourneysKey, JSON.stringify(list));
        }
      }
    } catch {}
  };

  // ── Hardware GPS Location Watcher: Traces Actual User Physical Movement (No synthetic timer) ──
  useEffect(() => {
    if (!isNavigating || !navigator.geolocation) return;

    let lastLat: number | null = null;
    let lastLng: number | null = null;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6 * 10) / 10 : null; // m/s to km/h
        setWalkingSpeedKmh(speed);
        setGpsAccuracy(Math.round(pos.coords.accuracy || 10));

        let heading = pos.coords.heading;
        if ((heading === null || heading === undefined || Number.isNaN(heading)) && lastLat !== null && lastLng !== null) {
          const dist = haversineMeters(lastLat, lastLng, lat, lng);
          if (dist > 1.5) {
            heading = calculateHeading(lastLat, lastLng, lat, lng);
          }
        }

        lastLat = lat;
        lastLng = lng;

        const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
        const coords = activeRoute.coordinates;
        if (coords && coords.length > 0) {
          const closest = findClosestRouteCoordIndex(lat, lng, coords);
          setNavCoordIndex(closest);

          // Check arrival at destination (within 35m)
          const distToDestination = haversineMeters(lat, lng, destination.lat, destination.lng);
          if (distToDestination < 35 || closest >= coords.length - 1) {
            setHasArrived(true);
          }
        }

        setUserNavLocation({
          lat,
          lng,
          heading: heading || 0,
        });
      },
      (err) => {
        console.warn('[SafeSphere GPS Navigation] Watch error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isNavigating, selectedRouteId, routes, destination.lat, destination.lng]);

  // Derived Navigation Metrics based on User's Actual GPS Progress
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const totalCoordsCount = activeRoute.coordinates.length || 1;
  const progressRatio = Math.min(1, navCoordIndex / (totalCoordsCount - 1 || 1));
  const remainingDistanceKm = Math.max(0, Math.round((activeRoute.distance * (1 - progressRatio)) * 10) / 10);
  const remainingMinutes = Math.max(0, Math.round(activeRoute.duration * (1 - progressRatio)));

  const traveledCoordinates: [number, number][] = isNavigating
    ? activeRoute.coordinates.slice(0, navCoordIndex + 1)
    : [];
  const remainingCoordinates: [number, number][] = isNavigating
    ? activeRoute.coordinates.slice(navCoordIndex)
    : activeRoute.coordinates;

  // Active step calculation
  const currentStep = (activeRoute.steps && activeRoute.steps.length > 0)
    ? activeRoute.steps[Math.min(activeRoute.steps.length - 1, Math.floor(progressRatio * activeRoute.steps.length))]
    : {
        instruction: `Follow path towards ${destination.address.split(',')[0]}`,
        roadName: destination.address.split(',')[0],
        distanceMeters: Math.round(remainingDistanceKm * 1000),
        durationSeconds: remainingMinutes * 60,
        maneuverType: 'continue',
        lat: destination.lat,
        lng: destination.lng,
      };

  const nextStep = (activeRoute.steps && activeRoute.steps.length > 1)
    ? activeRoute.steps[Math.min(activeRoute.steps.length - 1, Math.floor(progressRatio * activeRoute.steps.length) + 1)]
    : null;

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
        
        {/* ── 1. Standard Top Search Controls (Hidden when in Active Navigation mode) ── */}
        {!isNavigating && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: 24,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 'calc(100vw - 440px)',
          }}>
            {/* Dual Origin & Destination Route Planner Bar */}
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              {/* Origin Input */}
              <div style={{ position: 'relative', width: 280 }}>
                <div style={{
                  background: 'rgba(18, 21, 34, 0.94)',
                  border: isUsingLiveLocation ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isUsingLiveLocation ? '0 0 16px rgba(16, 185, 129, 0.2)' : '0 8px 30px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(14px)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: isUsingLiveLocation ? '#10b981' : '#818cf8',
                    boxShadow: isUsingLiveLocation ? '0 0 8px #10b981' : '0 0 8px #818cf8',
                    flexShrink: 0,
                  }} />
                  <input
                    type="text"
                    placeholder="Starting point / Current location..."
                    value={originQuery}
                    onFocus={() => setIsOriginSearchOpen(true)}
                    onChange={e => {
                      setOriginQuery(e.target.value);
                      setIsOriginSearchOpen(true);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      outline: 'none',
                      fontFamily: 'inherit',
                      width: '100%',
                    }}
                  />
                  {isSearchingOriginGeocode ? (
                    <Loader2 size={14} className="animate-spin text-indigo-400 shrink-0" />
                  ) : (
                    <button
                      onClick={handleUseLiveLocation}
                      title="Detect Current GPS Location"
                      style={{
                        background: isUsingLiveLocation ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                        border: 'none',
                        borderRadius: 6,
                        padding: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isUsingLiveLocation ? '#10b981' : '#818cf8',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAcquiringGPS ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <LocateFixed size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Origin Autocomplete Dropdown */}
                {isOriginSearchOpen && originSearchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 46,
                    left: 0,
                    right: 0,
                    background: '#151928',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    zIndex: 1002,
                    maxHeight: 260,
                    overflowY: 'auto',
                  }}>
                    <div
                      onClick={() => {
                        handleUseLiveLocation();
                        setIsOriginSearchOpen(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#34d399',
                      }}
                    >
                      <LocateFixed size={15} color="#10b981" />
                      <span>Use My Exact Live GPS Location</span>
                    </div>

                    {originSearchResults.map((res, i) => (
                      <div
                        key={res.id || i}
                        onClick={() => handleSelectOrigin(res)}
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          borderBottom: i < originSearchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                          fontSize: '0.8rem',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <MapPin size={14} color="#818cf8" className="shrink-0" />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {res.name}
                          </div>
                          <div style={{ color: '#64748B', fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {res.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwapLocations}
                title="Swap Origin and Destination"
                style={{
                  background: 'rgba(18, 21, 34, 0.92)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '9px 10px',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.15s',
                }}
              >
                <ArrowUpDown size={15} />
              </button>

              {/* Destination Input */}
              <div style={{ position: 'relative', width: 280 }}>
                <div style={{
                  background: 'rgba(18, 21, 34, 0.94)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(14px)',
                }}>
                  <MapPin size={15} color="#f87171" className="shrink-0" />
                  <input
                    type="text"
                    placeholder="Where to? (Destination)..."
                    value={destQuery}
                    onFocus={() => setIsDestSearchOpen(true)}
                    onChange={e => {
                      setDestQuery(e.target.value);
                      setIsDestSearchOpen(true);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      outline: 'none',
                      fontFamily: 'inherit',
                      width: '100%',
                    }}
                  />
                  {isSearchingDestGeocode && (
                    <Loader2 size={14} className="animate-spin text-indigo-400 shrink-0" />
                  )}
                </div>

                {/* Destination Dropdown */}
                {isDestSearchOpen && destSearchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 46,
                    left: 0,
                    right: 0,
                    background: '#151928',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    zIndex: 1002,
                    maxHeight: 260,
                    overflowY: 'auto',
                  }}>
                    {destSearchResults.map((res, i) => (
                      <div
                        key={res.id || i}
                        onClick={() => handleSelectDestination(res)}
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          borderBottom: i < destSearchResults.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                          fontSize: '0.8rem',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <MapPin size={14} color="#f87171" className="shrink-0" />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {res.name}
                          </div>
                          <div style={{ color: '#64748B', fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {res.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Live GPS Button */}
              <button
                onClick={handleUseLiveLocation}
                disabled={isAcquiringGPS}
                style={{
                  background: isUsingLiveLocation ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.18)',
                  border: isUsingLiveLocation ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(129, 140, 248, 0.35)',
                  color: isUsingLiveLocation ? '#6ee7b7' : '#c7d2fe',
                  padding: '9px 12px',
                  borderRadius: 12,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.15s',
                }}
              >
                {isAcquiringGPS ? (
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                ) : (
                  <LocateFixed size={14} color={isUsingLiveLocation ? '#10b981' : '#818cf8'} />
                )}
                <span>{isUsingLiveLocation ? 'Live GPS Active' : 'Use Current Location'}</span>
              </button>

              {/* Quick Simulate Risk Alert Trigger */}
              <button
                onClick={handleSimulateRiskAlert}
                title="Simulate Path Risk Anomaly & Safety Check"
                style={{
                  background: 'rgba(245, 158, 11, 0.16)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  color: '#FBBF24',
                  padding: '9px 13px',
                  borderRadius: 12,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.15s',
                }}
              >
                <Zap size={14} color="#FBBF24" />
                <span>Simulate Risk Alert</span>
              </button>
            </div>

            {/* GPS Status Toast */}
            {gpsStatus && (
              <div style={{
                background: gpsStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : gpsStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                border: gpsStatus.type === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : gpsStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(129, 140, 248, 0.4)',
                color: gpsStatus.type === 'error' ? '#FCA5A5' : gpsStatus.type === 'success' ? '#6ee7b7' : '#c7d2fe',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(8px)',
                alignSelf: 'flex-start',
              }}>
                {gpsStatus.type === 'error' ? <AlertTriangle size={13} /> : gpsStatus.type === 'success' ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="animate-spin" />}
                <span>{gpsStatus.text}</span>
              </div>
            )}
          </div>
        )}

        {/* ── 2. Active Turn-by-Turn Real GPS Navigation Header ── */}
        {isNavigating && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '92%',
            maxWidth: 580,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {/* Main Navigation Maneuver Bar */}
            <div style={{
              background: '#0d1527',
              border: '1.5px solid #10b981',
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 0 24px rgba(16, 185, 129, 0.2)',
              backdropFilter: 'blur(16px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Big Maneuver Icon */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  flexShrink: 0,
                }}>
                  {hasArrived ? (
                    <Target size={28} color="#FFFFFF" />
                  ) : currentStep.modifier?.includes('right') ? (
                    <CornerUpRight size={28} color="#FFFFFF" />
                  ) : currentStep.modifier?.includes('left') ? (
                    <CornerUpLeft size={28} color="#FFFFFF" />
                  ) : (
                    <ArrowUp size={28} color="#FFFFFF" />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    {hasArrived ? 'You have arrived!' : currentStep.instruction}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94A3B8', marginTop: 3 }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      {hasArrived ? 'Target Reached' : `In ${Math.round(currentStep.distanceMeters || 80)} m`}
                    </span>
                    {nextStep && (
                      <>
                        <span>•</span>
                        <span>Then {nextStep.roadName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* End Navigation Action */}
              <button
                onClick={handleExitNavigation}
                title="Exit Navigation"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#FCA5A5',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <X size={15} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 3. Active Real GPS Navigation Bottom HUD ── */}
        {isNavigating && (
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '92%',
            maxWidth: 680,
            background: 'rgba(15, 18, 30, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '16px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}>
            {/* Left: ETA & Remaining Distance */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399', letterSpacing: '-0.02em' }}>
                  {remainingMinutes} min
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}>
                  ({remainingDistanceKm} km remaining)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Radio size={12} color="#10b981" className="animate-pulse" />
                <span>
                  {walkingSpeedKmh !== null && walkingSpeedKmh > 0
                    ? `Walking Speed: ${walkingSpeedKmh} km/h`
                    : 'Real GPS Live Tracking Active (Moves with you)'}
                </span>
              </div>
            </div>

            {/* Middle: GPS Accuracy & Simulate Risk Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.75rem',
                color: '#6ee7b7',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span>GPS Fix {gpsAccuracy ? `±${gpsAccuracy}m` : 'Active'}</span>
              </div>

              <button
                onClick={handleSimulateRiskAlert}
                title="Simulate Route Risk Anomaly & Safety Check"
                style={{
                  background: 'rgba(245, 158, 11, 0.18)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  color: '#FBBF24',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s',
                }}
              >
                <AlertTriangle size={13} color="#FBBF24" />
                <span>Simulate Path Risk</span>
              </button>
            </div>

            {/* Right: Real-Time SafeScore Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              paddingLeft: 16,
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                  Safety Score
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#818cf8' }}>
                  {activeRoute.safeScore}
                </div>
              </div>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.2)',
                border: '1.5px solid #818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(129, 140, 248, 0.4)',
              }}>
                <Shield size={18} color="#818cf8" />
              </div>
            </div>
          </div>
        )}

        {/* ── Main Map Component ── */}
        <SafeSphereMap
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={id => setSelectedRouteId(id)}
          origin={origin}
          destination={destination}
          environmentalFeatures={environmentalFeatures}
          reportedIncidents={reportedIncidents}
          isNavigating={isNavigating}
          userLocation={userNavLocation}
          traveledCoordinates={traveledCoordinates}
          remainingCoordinates={remainingCoordinates}
        />

        {/* ── Right Floating Route Analysis Panel (Visible only when not actively navigating) ── */}
        {!isNavigating && (
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
              onSimulateRiskAlert={handleSimulateRiskAlert}
              onReportIncident={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {/* Risk Alert Notification Toast */}
        {riskAlertToast && (
          <div style={{
            position: 'fixed',
            bottom: isNavigating ? 110 : 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(16,185,129,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.86rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
          }}>
            <CheckCircle2 size={18} />
            <span>{riskAlertToast}</span>
          </div>
        )}

        {/* Risk Alert & Interactive Safety Check Modal */}
        <RiskAlertSafetyModal
          isOpen={isRiskAlertOpen}
          onClose={() => setIsRiskAlertOpen(false)}
          currentRouteName={activeRoute.name}
          currentLocation={{
            lat: userNavLocation?.lat || origin.lat,
            lng: userNavLocation?.lng || origin.lng,
            address: destination.address,
          }}
          onRerouteSafe={handleAutoRerouteSafe}
        />

        {/* ── Floating Report Incident Button ── */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          title="Report a Safety Hazard"
          style={{
            position: 'fixed',
            bottom: isNavigating ? 120 : 30,
            right: 30,
            zIndex: 9000,
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            border: 'none',
            color: '#FFFFFF',
            width: 52,
            height: 52,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
            transition: 'all 0.15s',
            fontSize: '1.3rem',
          }}
        >
          <AlertTriangle size={22} />
        </button>

        {/* ── Report Incident Modal ── */}
        {isReportModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            background: 'rgba(5, 7, 14, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}>
            <div style={{
              background: '#0F1322',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 24,
              width: '100%',
              maxWidth: 480,
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    Report Safety Hazard
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 0' }}>
                    Pin a real-time community safety report at your current location.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#FFF', display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Hazard Type */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  Hazard Type
                </label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    color: '#F1F5F9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Poor / Broken Street Lighting">🌑 Poor / Broken Street Lighting</option>
                  <option value="Suspicious Activity / Persons">⚠️ Suspicious Activity / Persons</option>
                  <option value="Road Obstruction / Construction">🚧 Road Obstruction / Construction</option>
                  <option value="Harassment / Eve-Teasing">🚨 Harassment / Eve-Teasing</option>
                  <option value="Stray Animals / Dogs">🐕 Stray Animals / Dogs</option>
                  <option value="Waterlogging / Flooding">🌊 Waterlogging / Flooding</option>
                  <option value="No Police Visibility">👮 No Police Visibility in Area</option>
                  <option value="Other Safety Concern">📋 Other Safety Concern</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  Severity Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(['low', 'medium', 'high', 'critical'] as const).map(s => {
                    const colors: Record<string, { bg: string; border: string; text: string }> = {
                      low: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#6ee7b7' },
                      medium: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
                      high: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#fca5a5' },
                      critical: { bg: 'rgba(220,38,38,0.25)', border: 'rgba(220,38,38,0.6)', text: '#f87171' },
                    };
                    const c = colors[s];
                    const isSelected = reportSeverity === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setReportSeverity(s)}
                        style={{
                          background: isSelected ? c.bg : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${isSelected ? c.border : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 10,
                          padding: '8px 4px',
                          color: isSelected ? c.text : '#64748B',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.78rem',
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  Description (Optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="Describe the safety hazard in detail..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    color: '#F1F5F9',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Location Preview */}
              <div style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <MapPin size={14} />
                <span>
                  Pinning at: {(userNavLocation?.lat || origin.lat).toFixed(5)}, {(userNavLocation?.lng || origin.lng).toFixed(5)} · {destination.address.split(',')[0]}
                </span>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitIncidentReport}
                disabled={isSubmittingReport}
                style={{
                  background: isSubmittingReport ? '#64748B' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: isSubmittingReport ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                }}
              >
                {isSubmittingReport ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><AlertTriangle size={16} /> Submit Incident Report</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Report Success / Error Toast Banner */}
        {reportSuccessBanner && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: reportSuccessBanner.startsWith('⚠️') ? 'rgba(245, 158, 11, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.86rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
          }}>
            <CheckCircle2 size={18} />
            <span>{reportSuccessBanner}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0.1; }
          100% { transform: scale(2.0); opacity: 0; }
        }
        @media (max-width: 1024px) {
          .routes-sidebar-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
