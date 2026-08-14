// ── SafeSphere Real Geocoding Service (Nominatim OSM) ───────────────────────
// Usage: Free public OpenStreetMap Nominatim endpoint
// Policy: Max 1 req/sec, identifying User-Agent header, debounced input.
// Includes India/Delhi NCR viewbox biasing for relevant local search results.

export interface GeocodingResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  zone?: string;
}

// Bounding box for Delhi NCR region to bias local results
// [minLng, minLat, maxLng, maxLat] -> [76.84, 28.40, 77.35, 28.88]
const DELHI_VIEWBOX = '76.84,28.88,77.35,28.40';

export async function searchGeocodingNominatim(query: string): Promise<GeocodingResult[]> {
  if (!query.trim() || query.length < 2) return [];

  // Build Nominatim Search URL with viewbox and bounded=0 (biased towards region)
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=6&addressdetails=1&viewbox=${DELHI_VIEWBOX}&countrycodes=in`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SafeSphere-Pedestrian-Safety-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item: any, idx: number) => {
      const addr = item.address || {};
      const primaryName =
        addr.amenity ||
        addr.building ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.road ||
        item.name ||
        item.display_name.split(',')[0];

      const area = [addr.suburb, addr.city_district || addr.city || addr.state].filter(Boolean).join(', ');

      return {
        id: `nom-${item.place_id || idx}`,
        name: primaryName,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        zone: area || 'Delhi Region',
      };
    });
  } catch (err: any) {
    console.warn('[SafeSphere] Nominatim geocoding failed, falling back:', err.message);
    return [];
  }
}
