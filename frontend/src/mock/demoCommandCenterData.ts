// Dedicated seed/mock data for Command Center Demo Mode

export interface DemoIncident {
  id: string;
  location: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  time: string;
  lat: number;
  lng: number;
}

export interface DemoMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'incident' | 'police' | 'safe_haven' | 'high_risk' | 'patrol';
  title: string;
  status: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const DEMO_METRICS = {
  totalJourneys: 12482,
  totalJourneysTrend: '+4.2%',
  avgSafeScore: 94,
  activeAlerts: 3,
  activeAlertsPriority: 'High Priority',
  highRiskZones: 14,
  highRiskZonesTrend: '-2 from yesterday',
};

export const DEMO_SAFESCORE_TRENDS = [
  { day: 'Mon', score: 70 },
  { day: 'Tue', score: 76 },
  { day: 'Wed', score: 82 },
  { day: 'Thu', score: 79 },
  { day: 'Fri', score: 88 },
  { day: 'Sat', score: 91 },
  { day: 'Sun', score: 94, current: true },
];

export const DEMO_INCIDENTS: DemoIncident[] = [
  {
    id: '#INC-4029',
    location: 'Sector 7G, West District',
    type: 'Route Deviation',
    severity: 'HIGH',
    time: '2 mins ago',
    lat: 41.8850,
    lng: -87.6400,
  },
  {
    id: '#INC-4028',
    location: 'North Station Transit',
    type: 'Proximity Alert',
    severity: 'MEDIUM',
    time: '14 mins ago',
    lat: 41.8980,
    lng: -87.6250,
  },
  {
    id: '#INC-4027',
    location: 'Downtown Core',
    type: 'Signal Lost',
    severity: 'LOW',
    time: '1 hr ago',
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: '#INC-4026',
    location: 'River North Corridor',
    type: 'Lighting Anomaly',
    severity: 'LOW',
    time: '2 hrs ago',
    lat: 41.8924,
    lng: -87.6340,
  },
  {
    id: '#INC-4025',
    location: 'South Loop Intersection',
    type: 'Crowd Hazard',
    severity: 'MEDIUM',
    time: '3 hrs ago',
    lat: 41.8680,
    lng: -87.6240,
  },
];

export const DEMO_MAP_MARKERS: DemoMarker[] = [
  { id: 'm-1', lat: 41.8850, lng: -87.6400, type: 'incident', title: 'Route Deviation', status: 'Active investigation', severity: 'HIGH' },
  { id: 'm-2', lat: 41.8980, lng: -87.6250, type: 'incident', title: 'Proximity Alert', status: 'Warning broadcasted', severity: 'MEDIUM' },
  { id: 'm-3', lat: 41.8781, lng: -87.6298, type: 'incident', title: 'Signal Lost', status: 'Resolving', severity: 'LOW' },
  { id: 'm-4', lat: 41.8902, lng: -87.6189, type: 'safe_haven', title: 'Navy Pier Safety Point', status: '24/7 Monitored' },
  { id: 'm-5', lat: 41.8663, lng: -87.6170, type: 'safe_haven', title: 'Museum Campus Kiosk', status: 'Active personnel' },
  { id: 'm-6', lat: 41.8827, lng: -87.6233, type: 'police', title: 'Millennium Park Station', status: 'Patrol on duty' },
  { id: 'm-7', lat: 41.8756, lng: -87.6500, type: 'high_risk', title: 'West Loop Construction Zone', status: 'Low illumination' },
  { id: 'm-8', lat: 41.9050, lng: -87.6420, type: 'patrol', title: 'Mobile Unit Alpha-4', status: 'En route' },
  { id: 'm-9', lat: 41.8590, lng: -87.6320, type: 'safe_haven', title: 'Chinatown Central Hub', status: 'Active surveillance' },
  { id: 'm-10', lat: 41.8940, lng: -87.6120, type: 'patrol', title: 'Harbor Patrol Unit', status: 'On standby' },
  { id: 'm-11', lat: 41.8710, lng: -87.6380, type: 'high_risk', title: 'Financial Corridor Alley', status: 'Signal degradation' },
  { id: 'm-12', lat: 41.8890, lng: -87.6520, type: 'safe_haven', title: 'Fulton Market Post', status: 'Guard stationed' },
];
