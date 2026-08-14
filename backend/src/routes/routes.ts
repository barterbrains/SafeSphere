import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { calculateSafeScore } from '../safescore';
import { getAreaSafetyData } from '../services/overpass';

const router = Router();

// Delhi/NCR destination database
const DESTINATIONS = [
  { id: 'loc-1', address: 'Connaught Place, New Delhi', latitude: 28.6338, longitude: 77.2195, zone: 'Central Delhi' },
  { id: 'loc-2', address: 'India Gate, New Delhi', latitude: 28.6129, longitude: 77.2295, zone: 'Central Delhi' },
  { id: 'loc-3', address: 'Rajouri Garden, New Delhi', latitude: 28.6469, longitude: 77.0892, zone: 'West Delhi' },
  { id: 'loc-4', address: 'Gurugram Cyber City', latitude: 28.4951, longitude: 77.0878, zone: 'Gurugram' },
  { id: 'loc-5', address: 'New Delhi Railway Station', latitude: 28.6424, longitude: 77.2195, zone: 'Central Delhi' },
  { id: 'loc-6', address: 'GTBIT Campus, Rohini Sec-7', latitude: 28.6890, longitude: 77.1540, zone: 'North Delhi' },
  { id: 'loc-7', address: 'Hauz Khas Village', latitude: 28.5434, longitude: 77.2066, zone: 'South Delhi' },
  { id: 'loc-8', address: 'Lajpat Nagar Market', latitude: 28.5673, longitude: 77.2429, zone: 'South Delhi' },
  { id: 'loc-9', address: 'Saket Select CityWalk', latitude: 28.5270, longitude: 77.2190, zone: 'South Delhi' },
  { id: 'loc-10', address: 'Chandni Chowk, Old Delhi', latitude: 28.6505, longitude: 77.2303, zone: 'Old Delhi' },
  { id: 'loc-11', address: 'Karol Bagh Market', latitude: 28.6518, longitude: 77.1900, zone: 'West Delhi' },
  { id: 'loc-12', address: 'Dwarka Sec-10 Metro', latitude: 28.5840, longitude: 77.0512, zone: 'West Delhi' },
  { id: 'loc-13', address: 'Noida Sector 18', latitude: 28.5706, longitude: 77.3219, zone: 'Noida' },
  { id: 'loc-14', address: 'IGI Airport Terminal 3', latitude: 28.5562, longitude: 77.1000, zone: 'Delhi Airport' },
  { id: 'loc-15', address: 'Paharganj Main Bazar', latitude: 28.6445, longitude: 77.2105, zone: 'Central Delhi' },
  { id: 'loc-16', address: 'Lodi Garden', latitude: 28.5931, longitude: 77.2200, zone: 'South Central Delhi' },
  { id: 'loc-17', address: 'Mayur Vihar Phase 1', latitude: 28.5665, longitude: 77.3211, zone: 'East Delhi' },
  { id: 'loc-18', address: 'Rohini Sector 11', latitude: 28.7050, longitude: 77.1400, zone: 'North Delhi' },
];

// User's simulated current location
const CURRENT_LOCATION = {
  id: 'loc-current',
  address: 'GTBIT Campus, Rohini Sec-7, New Delhi',
  latitude: 28.6890,
  longitude: 77.1540,
  zone: 'North Delhi',
};

// Route segment templates for different areas
async function generateRouteSegments(routeType: string, originZone: string, destZone: string, realData: any) {
  const segments = [];
  const segmentCount = 3;

  const profiles: Record<string, any> = {
    fastest: {
      names: ['Main Arterial Road', 'Under-construction Bypass', 'Industrial Area Shortcut'],
      lighting: [75, 40, 35],
      crowd: [65, 30, 25],
      incident: [25, 55, 60],
      isolation: [20, 65, 70],
    },
    safest: {
      names: ['Market Road (Well-lit)', 'Metro Feeder Road', 'Main Market Stretch'],
      lighting: [90, 85, 88],
      crowd: [85, 80, 82],
      incident: [10, 15, 12],
      isolation: [10, 12, 10],
    },
    balanced: {
      names: ['Inner Road (Moderate)', 'Residential Street', 'Market Approach'],
      lighting: [80, 72, 78],
      crowd: [72, 65, 70],
      incident: [18, 28, 20],
      isolation: [18, 30, 22],
    },
  };

  const profile = profiles[routeType] || profiles.balanced;

  for (let i = 0; i < segmentCount; i++) {
    const historical = routeType === 'safest' ? 85 : routeType === 'fastest' ? 55 : 75;
    const lighting = realData.success ? realData.lightingQuality : profile.lighting[i];
    const crowd = realData.success ? realData.crowdActivity : profile.crowd[i];
    const incidentRisk = profile.incident[i];
    const isolationRisk = realData.success ? realData.isolationRisk : profile.isolation[i];

    const segScore = calculateSafeScore({
      historicalSafety: historical,
      lightingQuality: lighting,
      crowdActivity: crowd,
      routeAccessibility: 75,
      proximityToSafeZones: realData.success ? realData.proximityToSafeZones : 65,
      incidentRisk,
      isolationRisk,
    });

    segments.push({
      id: `seg-${uuidv4()}`,
      routeId: '',
      name: profile.names[i],
      distance: Math.round(0.8 + Math.random() * 1.5 * 10) / 10,
      safetyScore: segScore,
      lightingScore: lighting,
      crowdScore: crowd,
      incidentRisk,
      isolationRisk,
    });
  }

  return segments;
}

async function generateRoute(
  origin: any,
  destination: any,
  routeType: 'fastest' | 'safest' | 'balanced'
): Promise<any> {
  const baseDist = Math.sqrt(
    Math.pow(destination.latitude - origin.latitude, 2) +
    Math.pow(destination.longitude - origin.longitude, 2)
  ) * 111; // rough km

  const distances: Record<string, number> = {
    fastest: Math.round(baseDist * 10) / 10,
    safest: Math.round(baseDist * 1.3 * 10) / 10,
    balanced: Math.round(baseDist * 1.15 * 10) / 10,
  };

  const etas: Record<string, number> = {
    fastest: Math.round(baseDist * 4),
    safest: Math.round(baseDist * 6),
    balanced: Math.round(baseDist * 5),
  };

    fastest: { historical: 55, accessibility: 80, incident: 45 },
    safest:  { historical: 88, accessibility: 85, incident: 8 },
    balanced:{ historical: 75, accessibility: 78, incident: 22 },
  };

  const c = components[routeType];
  const realData = await getAreaSafetyData(destination.latitude, destination.longitude);

  const score = calculateSafeScore({
    historicalSafety: c.historical,
    lightingQuality: realData.success ? realData.lightingQuality : (routeType === 'safest' ? 88 : 60),
    crowdActivity: realData.success ? realData.crowdActivity : (routeType === 'safest' ? 82 : 60),
    routeAccessibility: c.accessibility,
    proximityToSafeZones: realData.success ? realData.proximityToSafeZones : 70,
    incidentRisk: c.incident,
    isolationRisk: realData.success ? realData.isolationRisk : (routeType === 'safest' ? 10 : 30),
  });

  const segments = await generateRouteSegments(routeType, origin.zone, destination.zone, realData);
  const routeId = `route-${uuidv4()}`;
  segments.forEach(s => (s.routeId = routeId));

  const explanations: Record<string, string> = {
    fastest: 'Quickest route via main roads, but passes some less-lit stretches.',
    safest: `+${etas.safest - etas.fastest} min slower — uses well-lit market roads and avoids isolated areas.`,
    balanced: `+${etas.balanced - etas.fastest} min — good trade-off between speed and safety.`,
  };

  const warningsByType: Record<string, string[]> = {
    fastest: ['Passes through poorly-lit stretch near industrial area', 'Lower pedestrian activity after 9 PM', 'Incident history in area'],
    safest: ['Slightly longer route', 'May have more traffic near market hours'],
    balanced: ['One moderately lit stretch — stay alert'],
  };

  const incidentsByType: Record<string, number> = { fastest: 3, safest: 0, balanced: 1 };

  return {
    id: routeId,
    origin: { id: origin.id, latitude: origin.latitude, longitude: origin.longitude, address: origin.address, zone: origin.zone },
    destination: { id: destination.id, latitude: destination.latitude, longitude: destination.longitude, address: destination.address, zone: destination.zone },
    distance: distances[routeType],
    eta: Math.max(etas[routeType], 5),
    routeType,
    safeScore: score,
    segments,
    incidents: incidentsByType[routeType],
    lightingQuality: c.lighting,
    crowdLevel: c.crowd,
    explanation: explanations[routeType],
    warnings: warningsByType[routeType],
    scoreBreakdown: {
      historicalSafety: c.historical,
      lightingQuality: realData.success ? realData.lightingQuality : (routeType === 'safest' ? 88 : 60),
      crowdActivity: realData.success ? realData.crowdActivity : (routeType === 'safest' ? 82 : 60),
      routeAccessibility: c.accessibility,
      proximityToSafeZones: realData.success ? realData.proximityToSafeZones : 70,
      incidentRisk: c.incident,
      isolationRisk: realData.success ? realData.isolationRisk : (routeType === 'safest' ? 10 : 30),
    },
  };
}

// In-memory route cache
const routeCache: Map<string, any> = new Map();

// GET /routes/search?q=query — autocomplete destinations
router.get('/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase();
  const results = DESTINATIONS.filter(d =>
    d.address.toLowerCase().includes(q) || d.zone.toLowerCase().includes(q)
  ).slice(0, 8);
  return res.json(results);
});

// POST /routes/calculate — generate fastest/safest/balanced routes
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { originId, destinationId, originAddress } = req.body;

    let origin = DESTINATIONS.find(d => d.id === originId) || CURRENT_LOCATION;
    if (originAddress) {
      const found = DESTINATIONS.find(d => d.address.toLowerCase().includes(originAddress.toLowerCase()));
      if (found) origin = found;
    }

    const destination = DESTINATIONS.find(d => d.id === destinationId);
    if (!destination) return res.status(404).json({ error: 'Destination not found' });

    const routes = await Promise.all([
      generateRoute(origin, destination, 'fastest'),
      generateRoute(origin, destination, 'safest'),
      generateRoute(origin, destination, 'balanced'),
    ]);

    // Cache routes for later retrieval
    routes.forEach(r => routeCache.set(r.id, r));

    return res.json({ routes, origin, destination });
  } catch (err) {
    return res.status(500).json({ error: 'Route calculation failed' });
  }
});

// GET /routes/:id
router.get('/:id', (req: Request, res: Response) => {
  const route = routeCache.get(req.params.id as string);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  return res.json(route);
});

export { routeCache };
export default router;
