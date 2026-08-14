// ── SafeSphere Overpass API Real Environmental Safety Data Client ──────────
// Service: Free public Overpass API (https://overpass-api.de/api/interpreter, no key required)
// Queries real OSM environmental safety features within bounding box / buffer:
// 1. Street Lighting: highway=street_lamp, lit=yes on roads
// 2. Police Stations: amenity=police
// 3. CCTV / Surveillance: man_made=surveillance
// 4. Hospitals: amenity=hospital
// Includes in-memory 15-minute response cache to respect public server limits.

export interface EnvironmentalSafetyFeature {
  id: string;
  type: 'street_lamp' | 'police' | 'cctv' | 'hospital';
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface EnvironmentalSafetySummary {
  streetLampsCount: number;
  policeStationsCount: number;
  cctvCount: number;
  hospitalsCount: number;
  features: EnvironmentalSafetyFeature[];
}

// In-memory 15-minute cache: key = rounded bbox string -> value = { data, timestamp }
const OVERPASS_CACHE = new Map<string, { data: EnvironmentalSafetySummary; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Calculates bounding box with ~150-200m buffer around route coordinates.
 */
function getBoundingBox(coordinates: [number, number][], bufferDegrees = 0.003): {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
} {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  coordinates.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return {
    minLat: minLat - bufferDegrees,
    minLng: minLng - bufferDegrees,
    maxLat: maxLat + bufferDegrees,
    maxLng: maxLng + bufferDegrees,
  };
}

/**
 * Queries the Overpass API for real OSM safety entities within the corridor bounding box.
 */
export async function fetchEnvironmentalSafetyData(
  routeCoordinates: [number, number][]
): Promise<EnvironmentalSafetySummary> {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    return { streetLampsCount: 0, policeStationsCount: 0, cctvCount: 0, hospitalsCount: 0, features: [] };
  }

  const bbox = getBoundingBox(routeCoordinates);
  // Round to ~3 decimal places for efficient cache hit rate
  const cacheKey = `${bbox.minLat.toFixed(3)},${bbox.minLng.toFixed(3)},${bbox.maxLat.toFixed(3)},${bbox.maxLng.toFixed(3)}`;

  // Check cache
  const cached = OVERPASS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Construct Overpass QL Query
  // [bbox:s,w,n,e]
  const bboxStr = `${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}`;
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["highway"="street_lamp"](${bboxStr});
      node["amenity"="police"](${bboxStr});
      way["amenity"="police"](${bboxStr});
      node["man_made"="surveillance"](${bboxStr});
      node["amenity"="hospital"](${bboxStr});
      way["amenity"="hospital"](${bboxStr});
    );
    out center 40;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Overpass API returned status ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const features: EnvironmentalSafetyFeature[] = [];
    let streetLamps = 0;
    let police = 0;
    let cctv = 0;
    let hospitals = 0;

    elements.forEach((el: any) => {
      const lat = el.lat || el.center?.lat;
      const lng = el.lon || el.center?.lon;
      if (!lat || !lng) return;

      const tags = el.tags || {};

      if (tags.highway === 'street_lamp' || tags.lit === 'yes') {
        streetLamps++;
        features.push({
          id: `osm-lamp-${el.id}`,
          type: 'street_lamp',
          name: tags.name || 'Street Illumination Lamp',
          lat,
          lng,
          description: 'Continuous street light point on pedestrian sidewalk',
        });
      } else if (tags.amenity === 'police') {
        police++;
        features.push({
          id: `osm-police-${el.id}`,
          type: 'police',
          name: tags.name || 'Police Station / Outpost',
          lat,
          lng,
          description: 'Verified law enforcement facility with active patrols',
        });
      } else if (tags.man_made === 'surveillance' || tags.surveillance === 'camera') {
        cctv++;
        features.push({
          id: `osm-cctv-${el.id}`,
          type: 'cctv',
          name: tags.name || 'CCTV Surveillance Camera',
          lat,
          lng,
          description: 'Public traffic & safety surveillance coverage',
        });
      } else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
        hospitals++;
        features.push({
          id: `osm-hospital-${el.id}`,
          type: 'hospital',
          name: tags.name || 'Medical Hospital / Trauma Center',
          lat,
          lng,
          description: 'Emergency healthcare & first response facility',
        });
      }
    });

    const summary: EnvironmentalSafetySummary = {
      streetLampsCount: streetLamps,
      policeStationsCount: police,
      cctvCount: cctv,
      hospitalsCount: hospitals,
      features,
    };

    // Store in cache
    OVERPASS_CACHE.set(cacheKey, { data: summary, timestamp: Date.now() });

    return summary;
  } catch (err: any) {
    console.warn('[SafeSphere Overpass] Environmental data fetch exception:', err.message);
    // Graceful fallback with 0 counts rather than breaking route view
    return {
      streetLampsCount: 0,
      policeStationsCount: 0,
      cctvCount: 0,
      hospitalsCount: 0,
      features: [],
    };
  }
}
