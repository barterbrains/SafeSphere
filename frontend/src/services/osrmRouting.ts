// ── SafeSphere OSRM Real Road Foot Routing Client ──────────────────────────
// Profile: 'foot' (pedestrian road network)
// Service: Free public OSRM demo server (rate-limited, demonstration usage)
// Note: In high-scale production, this can be swapped with self-hosted OSRM or OpenRouteService.

import type { RouteOptionData } from '../mock/delhiRouteData';

export interface OSRMCoordinate {
  lat: number;
  lng: number;
}

export interface FetchRoutesResult {
  routes: RouteOptionData[];
  isFallback: boolean;
  errorMessage?: string;
}

/**
 * Queries the public OSRM pedestrian foot-routing service for road-following geometries.
 * Returns 2-3 real turn-by-turn alternatives between start and destination coordinates.
 */
export async function fetchOSRMRealRoutes(
  origin: OSRMCoordinate,
  destination: OSRMCoordinate
): Promise<FetchRoutesResult> {
  // Format: {lng},{lat};{lng},{lat} for OSRM API
  const coordString = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/foot/${coordString}?alternatives=true&geometries=geojson&overview=full&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout guard

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM server returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No walkable road network routes found between these locations.');
    }

    // Map OSRM alternatives into SafeSphere RouteOptionData objects
    const mappedRoutes: RouteOptionData[] = data.routes.map((route: any, index: number) => {
      // OSRM coordinates are in [lng, lat] GeoJSON format -> convert to Leaflet [lat, lng]
      const leafletCoords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );

      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMins = Math.round(route.duration / 60);

      // Label based on alternative index
      let routeType: 'safest' | 'balanced' | 'fastest' = 'safest';
      let name = 'Safest Pedestrian Route';
      let color = '#818cf8';
      let recommended = false;

      if (index === 0) {
        routeType = 'safest';
        name = 'Primary Safe Corridor';
        color = '#818cf8'; // Indigo/Purple primary
        recommended = true;
      } else if (index === 1) {
        routeType = 'balanced';
        name = 'Alternative Walkway';
        color = '#38bdf8'; // Sky blue
        recommended = false;
      } else {
        routeType = 'fastest';
        name = 'Direct Street Route';
        color = '#f59e0b'; // Amber
        recommended = false;
      }

      return {
        id: `osrm-route-${index}-${Date.now()}`,
        name,
        routeType,
        duration: durationMins,
        distance: distanceKm,
        safeScore: 85, // Will be computed dynamically via Phase 2/4 Overpass & Incident data
        recommended,
        color,
        tags: ['OSRM Foot Network', 'Road-Following', `${distanceKm} km`],
        safetyFactors: {
          lighting: 85,
          footfall: 80,
          policePresence: 75,
          incidentDensity: 90,
          safeZones: 80,
        },
        explanation: `Road-following pedestrian path via OSM walking network (${distanceKm} km, ~${durationMins} mins walk).`,
        coordinates: leafletCoords,
      };
    });

    return {
      routes: mappedRoutes,
      isFallback: false,
    };
  } catch (error: any) {
    console.warn('[SafeSphere] OSRM Route fetch failed, using fallback:', error.message);
    return {
      routes: [],
      isFallback: true,
      errorMessage: error.message || 'OSRM routing service unavailable.',
    };
  }
}
