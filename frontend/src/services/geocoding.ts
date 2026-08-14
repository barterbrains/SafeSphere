// ── SafeSphere High-Speed Global Geocoding & Reverse Geocoding Service ──────
// Primary: Photon OpenStreetMap Geocoding API by Komoot (Ultra-fast, zero rate limiting, global OSM data)
// Secondary: OpenStreetMap Nominatim API with compliant User-Agent header fallback

export interface GeocodingResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  zone?: string;
}

/**
 * Searches for global addresses, cities, and landmarks worldwide using Photon OSM + Nominatim.
 */
export async function searchGeocodingNominatim(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. Try Photon Komoot API (Primary - high throughput, 0 rate limit)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(photonUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const features = data.features || [];

      if (features.length > 0) {
        return features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = props.name || props.street || props.locality || props.city || trimmed;
          
          const parts = [
            props.name !== name ? props.name : null,
            props.street,
            props.locality,
            props.district || props.city,
            props.state,
            props.country,
          ].filter(Boolean);

          const fullAddress = parts.length > 0 ? parts.join(', ') : name;
          const zone = [props.district || props.city, props.state].filter(Boolean).join(', ') || props.country || 'Region';

          return {
            id: `photon-${props.osm_id || idx}`,
            name,
            address: fullAddress,
            lat: coords[1], // GeoJSON is [lng, lat]
            lng: coords[0],
            zone,
          };
        });
      }
    }
  } catch (err: any) {
    console.warn('[SafeSphere Geocoding] Photon lookup fallback to Nominatim:', err.message);
  }

  // 2. Secondary Fallback: OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=8&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(nomUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SafeSphere-Pedestrian-Safety-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
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
            zone: area || 'Region',
          };
        });
      }
    }
  } catch (err: any) {
    console.warn('[SafeSphere Geocoding] Nominatim lookup failed:', err.message);
  }

  return [];
}

/**
 * Reverse geocodes [lat, lng] coordinates into a human-readable address.
 */
export async function reverseGeocodeNominatim(
  lat: number,
  lng: number
): Promise<{ name: string; fullAddress: string }> {
  // 1. Try Photon Reverse
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const feat = data.features?.[0];
      if (feat && feat.properties) {
        const p = feat.properties;
        const name = p.name || p.street || p.locality || p.district || p.city || 'Current Location';
        const address = [p.name, p.street, p.locality, p.district || p.city, p.state, p.country].filter(Boolean).join(', ');
        return {
          name,
          fullAddress: address || name,
        };
      }
    }
  } catch (err: any) {
    console.warn('[SafeSphere Geocoding] Photon reverse failed, falling back:', err.message);
  }

  // 2. Fallback to Nominatim Reverse
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(nomUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SafeSphere-Pedestrian-Safety-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const primaryName =
        addr.neighbourhood ||
        addr.suburb ||
        addr.road ||
        addr.amenity ||
        addr.building ||
        data.name ||
        data.display_name?.split(',')[0];

      const locality = [primaryName, addr.city_district || addr.city || addr.state].filter(Boolean).join(', ');

      return {
        name: primaryName || 'Current Location',
        fullAddress: locality || data.display_name || 'Current Location',
      };
    }
  } catch {
    // Silent
  }

  return {
    name: 'Current Location',
    fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
  };
}
