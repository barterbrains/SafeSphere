import https from 'https';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function fetchOverpass(query: string, timeoutMs = 8000): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = new TextEncoder().encode(query);

    const req = https.request(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      },
      timeout: timeoutMs
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (e) {
            reject(new Error('Invalid JSON response from Overpass'));
          }
        } else {
          reject(new Error(`Overpass API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Overpass API timeout'));
    });

    req.write(data);
    req.end();
  });
}

// Convert real data to 0-100 scores
export async function getAreaSafetyData(lat: number, lon: number) {
  try {
    const [safeZonesRes, lightingRes, crowdRes] = await Promise.all([
      fetchOverpass(`[out:json][timeout:5];(node["amenity"="police"](around:500,${lat},${lon});node["amenity"="hospital"](around:500,${lat},${lon});node["railway"="station"](around:500,${lat},${lon}););out body;`, 8000),
      fetchOverpass(`[out:json][timeout:5];way["highway"]["lit"](around:50,${lat},${lon});out tags;`, 8000),
      fetchOverpass(`[out:json][timeout:5];(way["highway"](around:200,${lat},${lon});node["shop"](around:200,${lat},${lon});node["amenity"](around:200,${lat},${lon}););out body;`, 8000)
    ]);

    const safeZoneCount = safeZonesRes.elements?.length || 0;
    const lightingCount = lightingRes.elements?.length || 0;
    const crowdCount = crowdRes.elements?.length || 0;

    // Normalize counts to a 0-100 score
    const proximityToSafeZones = Math.min(100, (safeZoneCount / 2) * 100) || 50; // max out at 2 safe zones
    const lightingQuality = Math.min(100, (lightingCount / 1) * 100) || 50; // just need some lit ways
    const crowdActivity = Math.min(100, (crowdCount / 20) * 100) || 50; // 20 POIs is max crowd score
    const isolationRisk = Math.max(0, 100 - crowdActivity); // isolation is inverse of crowd proxy

    return {
      success: true,
      proximityToSafeZones,
      lightingQuality,
      crowdActivity,
      isolationRisk
    };

  } catch (error) {
    console.warn(`Overpass API failed or timed out, using fallback values:`, error);
    // Mandatory fallback logic (neutral middle scores)
    return {
      success: false,
      proximityToSafeZones: 50,
      lightingQuality: 50,
      crowdActivity: 50,
      isolationRisk: 50
    };
  }
}
