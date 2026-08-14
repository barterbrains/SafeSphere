// Delhi NCR Realistic Coordinate Pathways & Safety Data for Route Analysis

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface NavigationStep {
  instruction: string;
  roadName: string;
  distanceMeters: number;
  durationSeconds: number;
  maneuverType: string;
  modifier?: string;
  lat: number;
  lng: number;
}

export interface RouteOptionData {
  id: string;
  name: string;
  routeType: 'safest' | 'balanced' | 'fastest';
  duration: number; // in mins
  distance: number; // in km
  safeScore: number;
  recommended: boolean;
  color: string;
  tags: string[];
  safetyFactors: {
    lighting: number;
    footfall: number;
    policePresence: number;
    incidentDensity: number;
    safeZones: number;
  };
  explanation: string;
  coordinates: [number, number][];
  steps?: NavigationStep[];
}

export interface SafetyZonePOI {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'safe_haven' | 'high_footfall' | 'incident';
  lat: number;
  lng: number;
  description: string;
}

// Origin: Connaught Place, New Delhi [28.6315, 77.2167]
// Destination: India Gate, New Delhi [28.6129, 77.2295]
export const DELHI_DEMO_ROUTES: RouteOptionData[] = [
  {
    id: 'route-safest-delhi',
    name: 'Safest Route',
    routeType: 'safest',
    duration: 41,
    distance: 7.2,
    safeScore: 94,
    recommended: true,
    color: '#818cf8', // Purple / Indigo brand tone
    tags: ['Well-lit', 'High footfall', 'Active police zone', 'CCTV Corridor'],
    safetyFactors: {
      lighting: 95,
      footfall: 92,
      policePresence: 96,
      incidentDensity: 90,
      safeZones: 96,
    },
    explanation: 'Follows Janpath & Rajpath corridors with 24/7 street illumination, high pedestrian presence, and 3 active police checkposts.',
    coordinates: [
      [28.6315, 77.2167], // Connaught Place Inner Circle
      [28.6285, 77.2195], // Janpath Road North
      [28.6230, 77.2205], // Janpath Central Market
      [28.6180, 77.2215], // National Museum area
      [28.6145, 77.2230], // Rajpath crossing
      [28.6135, 77.2260], // Kartavya Path
      [28.6129, 77.2295], // India Gate Central Hexagon
    ],
  },
  {
    id: 'route-balanced-delhi',
    name: 'Balanced',
    routeType: 'balanced',
    duration: 34,
    distance: 6.4,
    safeScore: 84,
    recommended: false,
    color: '#cbd5e1', // Light Indigo / Neutral
    tags: ['Efficient flow', 'Moderate surveillance', 'Transit hub proximity'],
    safetyFactors: {
      lighting: 86,
      footfall: 84,
      policePresence: 82,
      incidentDensity: 85,
      safeZones: 83,
    },
    explanation: 'Utilizes Kasturba Gandhi Marg. Balances speed with good ambient visibility and major metro connectivity.',
    coordinates: [
      [28.6315, 77.2167], // Connaught Place
      [28.6290, 77.2220], // KG Marg North
      [28.6240, 77.2245], // KG Marg Central
      [28.6190, 77.2270], // Copernicus Marg
      [28.6150, 77.2285], // Hexagon entry
      [28.6129, 77.2295], // India Gate
    ],
  },
  {
    id: 'route-fastest-delhi',
    name: 'Fastest',
    routeType: 'fastest',
    duration: 27,
    distance: 5.8,
    safeScore: 72,
    recommended: false,
    color: '#f87171', // Warm orange/red alert tone
    tags: ['Low visibility zones', 'Highway dominant', 'Isolated service lanes'],
    safetyFactors: {
      lighting: 68,
      footfall: 70,
      policePresence: 65,
      incidentDensity: 74,
      safeZones: 72,
    },
    explanation: 'Takes direct Barakhamba bypass. Faster transit but passes through 2 unlit service stretches after 8 PM.',
    coordinates: [
      [28.6315, 77.2167], // Connaught Place
      [28.6300, 77.2250], // Barakhamba Road
      [28.6250, 77.2290], // Mandi House flyover bypass
      [28.6200, 77.2310], // Tilak Marg shortcut
      [28.6150, 77.2305], // Outer Hexagon
      [28.6129, 77.2295], // India Gate
    ],
  },
];

export const DELHI_SAFETY_POIS: SafetyZonePOI[] = [
  { id: 'poi-1', name: 'Connaught Place Police Station', type: 'police', lat: 28.6325, lng: 77.2185, description: '24/7 Command Unit' },
  { id: 'poi-2', name: 'Dr. RML Hospital Emergency', type: 'hospital', lat: 28.6245, lng: 77.2025, description: 'Level 1 Trauma Center' },
  { id: 'poi-3', name: 'Janpath Safe Haven & Kiosk', type: 'safe_haven', lat: 28.6225, lng: 77.2198, description: 'Safe Corridor Staffed Post' },
  { id: 'poi-4', name: 'Rajiv Chowk Metro High Footfall Area', type: 'high_footfall', lat: 28.6328, lng: 77.2190, description: 'Dense Pedestrian Transit' },
  { id: 'poi-5', name: 'Tilak Marg Police Post', type: 'police', lat: 28.6185, lng: 77.2320, description: 'Highway Patrol Station' },
  { id: 'poi-6', name: 'National Museum Safe Haven', type: 'safe_haven', lat: 28.6118, lng: 77.2190, description: 'Security Stationed Area' },
  { id: 'poi-7', name: 'Construction Warning Area', type: 'incident', lat: 28.6260, lng: 77.2280, description: 'Reduced Illumination Stretch' },
];
