// ── SafeSphere Global Real Environmental Safety Data Client ──────────
// Multi-Tiered Global OpenStreetMap Ingestion Engine:
// 1. Overpass API: Street lamps, CCTV, Police stations, Hospitals, Clinics, Fire stations
// 2. Nominatim Global Amenity API: Real-time police & hospital search across ANY global city/place
// 3. In-memory 15-minute response cache to respect public server limits.

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
 * Calculates bounding box with buffer around route coordinates.
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
 * Queries OpenStreetMap Nominatim for real verified amenities (police, hospital, clinic, fire_station)
 * within any bounding box across the world (Mumbai, Bengaluru, London, New York, Delhi, etc.).
 */
async function fetchGlobalNominatimAmenities(bbox: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}): Promise<EnvironmentalSafetyFeature[]> {
  // viewbox format for Nominatim: left,top,right,bottom (minLng, maxLat, maxLng, minLat)
  const viewbox = `${bbox.minLng.toFixed(4)},${bbox.maxLat.toFixed(4)},${bbox.maxLng.toFixed(4)},${bbox.minLat.toFixed(4)}`;

  const amenityQueries = [
    { type: 'police' as const, amenity: 'police' },
    { type: 'hospital' as const, amenity: 'hospital' },
    { type: 'hospital' as const, amenity: 'clinic' },
    { type: 'police' as const, amenity: 'fire_station' },
  ];

  const results: EnvironmentalSafetyFeature[] = [];

  const promises = amenityQueries.map(async ({ type, amenity }) => {
    const url = `https://nominatim.openstreetmap.org/search?amenity=${amenity}&viewbox=${viewbox}&bounded=1&format=json&limit=15&addressdetails=1`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SafeSphere-Pedestrian-Safety-App/1.0',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const items = await res.json();
      if (!Array.isArray(items)) return [];

      return items.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const addr = item.address || {};
        const primaryName =
          addr.amenity ||
          addr.building ||
          item.name ||
          item.display_name.split(',')[0];

        const isHospital = type === 'hospital';

        return {
          id: `nom-amenity-${item.place_id || `${lat.toFixed(4)}-${lng.toFixed(4)}`}`,
          type,
          name: primaryName || (isHospital ? 'Medical Hospital / Clinic' : 'Police Station / Security Post'),
          lat,
          lng,
          description: isHospital
            ? 'Emergency healthcare & trauma response facility'
            : 'Law enforcement facility with active patrols',
        };
      });
    } catch {
      return [];
    }
  });

  const settled = await Promise.all(promises);
  settled.forEach(list => results.push(...list));
  return results;
}

/**
 * Queries Overpass API + Global Nominatim Amenity engine for safety entities across ANY selected place.
 */
export async function fetchEnvironmentalSafetyData(
  routeCoordinates: [number, number][]
): Promise<EnvironmentalSafetySummary> {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    return { streetLampsCount: 0, policeStationsCount: 0, cctvCount: 0, hospitalsCount: 0, features: [] };
  }

  // Tight buffer (0.003° ≈ 300m) for lamps & CCTV — route-hugging details
  const tightBbox = getBoundingBox(routeCoordinates, 0.003);
  // Wide buffer (0.015° ≈ 1.6 km) for police & hospitals — always visible across the corridor
  const wideBbox  = getBoundingBox(routeCoordinates, 0.015);

  // Round for cache key
  const cacheKey = `${wideBbox.minLat.toFixed(3)},${wideBbox.minLng.toFixed(3)},${wideBbox.maxLat.toFixed(3)},${wideBbox.maxLng.toFixed(3)}`;

  // Check cache
  const cached = OVERPASS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const tightBboxStr = `${tightBbox.minLat},${tightBbox.minLng},${tightBbox.maxLat},${tightBbox.maxLng}`;
  const wideBboxStr  = `${wideBbox.minLat},${wideBbox.minLng},${wideBbox.maxLat},${wideBbox.maxLng}`;

  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["highway"="street_lamp"](${tightBboxStr});
      node["man_made"="surveillance"](${tightBboxStr});
      node["amenity"="police"](${wideBboxStr});
      way["amenity"="police"](${wideBboxStr});
      relation["amenity"="police"](${wideBboxStr});
      node["amenity"="hospital"](${wideBboxStr});
      way["amenity"="hospital"](${wideBboxStr});
      relation["amenity"="hospital"](${wideBboxStr});
      node["amenity"="clinic"](${wideBboxStr});
      node["amenity"="fire_station"](${wideBboxStr});
    );
    out center 80;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

  const features: EnvironmentalSafetyFeature[] = [];
  let streetLamps = 0;
  let police = 0;
  let cctv = 0;
  let hospitals = 0;

  try {
    // Parallel execution: Try Overpass for rich street features AND Global Nominatim for guaranteed police/hospitals
    const [overpassData, nominatimPOIs] = await Promise.all([
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SafeSphere-WalkingSafetyApp/1.0',
            },
          });
          clearTimeout(timeoutId);
          if (!response.ok) return [];
          const json = await response.json();
          return json.elements || [];
        } catch {
          return [];
        }
      })(),
      fetchGlobalNominatimAmenities(wideBbox),
    ]);

    // 1. Process Overpass Elements
    overpassData.forEach((el: any) => {
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
          description: 'Continuous street light on pedestrian sidewalk',
        });
      } else if (tags.amenity === 'police') {
        police++;
        features.push({
          id: `osm-police-${el.id}`,
          type: 'police',
          name: tags.name || 'Police Station / Outpost',
          lat,
          lng,
          description: 'Law enforcement facility with active patrols',
        });
      } else if (tags.amenity === 'fire_station') {
        police++;
        features.push({
          id: `osm-fire-${el.id}`,
          type: 'police',
          name: tags.name || 'Fire & Emergency Station',
          lat,
          lng,
          description: 'Fire & emergency response facility',
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
          name: tags.name || (tags.amenity === 'clinic' ? 'Medical Clinic' : 'Hospital / Trauma Center'),
          lat,
          lng,
          description: tags.amenity === 'clinic'
            ? 'Medical clinic / primary healthcare facility'
            : 'Emergency hospital & trauma response center',
        });
      }
    });

    // 2. Merge in Global Nominatim Amenities (Deduplicating against existing Overpass features)
    nominatimPOIs.forEach(nomFeat => {
      const isDuplicate = features.some(existing => {
        const dLat = Math.abs(existing.lat - nomFeat.lat);
        const dLng = Math.abs(existing.lng - nomFeat.lng);
        return dLat < 0.0015 && dLng < 0.0015; // Within ~150m
      });

      if (!isDuplicate) {
        features.push(nomFeat);
        if (nomFeat.type === 'police') police++;
        else if (nomFeat.type === 'hospital') hospitals++;
      }
    });

    const summary: EnvironmentalSafetySummary = {
      streetLampsCount: streetLamps,
      policeStationsCount: police,
      cctvCount: cctv,
      hospitalsCount: hospitals,
      features,
    };

    console.log(`[SafeSphere Global Safety] Located ${features.length} safety entities (${police} police, ${hospitals} hospitals, ${streetLamps} lamps, ${cctv} CCTV) for selected region.`);

    // Cache
    OVERPASS_CACHE.set(cacheKey, { data: summary, timestamp: Date.now() });

    return summary;
  } catch (err: any) {
    console.warn('[SafeSphere Global Safety] Fetch exception:', err.message);

    // Fallback: Global Nominatim search alone
    const fallbackNominatim = await fetchGlobalNominatimAmenities(wideBbox);
    const fallbackPolice = fallbackNominatim.filter(f => f.type === 'police').length;
    const fallbackHospitals = fallbackNominatim.filter(f => f.type === 'hospital').length;

    return {
      streetLampsCount: 0,
      policeStationsCount: fallbackPolice,
      cctvCount: 0,
      hospitalsCount: fallbackHospitals,
      features: fallbackNominatim,
    };
  }
}
