// Dedicated seed/mock data for Command Center Demo Mode (New Delhi NCR)

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
  totalJourneys: 14280,
  totalJourneysTrend: '+6.4%',
  avgSafeScore: 92,
  activeAlerts: 3,
  activeAlertsPriority: 'High Priority',
  highRiskZones: 8,
  highRiskZonesTrend: '-3 from yesterday',
};

export const DEMO_SAFESCORE_TRENDS = [
  { day: 'Mon', score: 72 },
  { day: 'Tue', score: 78 },
  { day: 'Wed', score: 82 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 89 },
  { day: 'Sat', score: 91 },
  { day: 'Sun', score: 94, current: true },
];

export const DEMO_INCIDENTS: DemoIncident[] = [
  {
    id: '#INC-4029',
    location: 'Rajouri Garden Ring Road, West Delhi',
    type: 'Route Deviation',
    severity: 'HIGH',
    time: '2 mins ago',
    lat: 28.6473,
    lng: 77.1221,
  },
  {
    id: '#INC-4028',
    location: 'Rajiv Chowk Metro Gate 4, Connaught Place',
    type: 'Proximity Alert',
    severity: 'MEDIUM',
    time: '14 mins ago',
    lat: 28.6328,
    lng: 77.2195,
  },
  {
    id: '#INC-4027',
    location: 'Kasturba Gandhi Marg Corridor, New Delhi',
    type: 'Signal Lost',
    severity: 'LOW',
    time: '1 hr ago',
    lat: 28.6220,
    lng: 77.2240,
  },
  {
    id: '#INC-4026',
    location: 'India Gate C-Hexagon Outer Circle',
    type: 'Lighting Anomaly',
    severity: 'LOW',
    time: '2 hrs ago',
    lat: 28.6129,
    lng: 77.2295,
  },
  {
    id: '#INC-4025',
    location: 'Saket District Centre, South Delhi',
    type: 'Crowd Hazard',
    severity: 'MEDIUM',
    time: '3 hrs ago',
    lat: 28.5283,
    lng: 77.2185,
  },
];

export const DEMO_MAP_MARKERS: DemoMarker[] = [
  { id: 'm-1', lat: 28.6473, lng: 77.1221, type: 'incident', title: 'Route Deviation Alert', status: 'Active investigation', severity: 'HIGH' },
  { id: 'm-2', lat: 28.6328, lng: 77.2195, type: 'incident', title: 'Proximity Hazard', status: 'Warning broadcasted', severity: 'MEDIUM' },
  { id: 'm-3', lat: 28.6220, lng: 77.2240, type: 'incident', title: 'Telemetry Signal Dropout', status: 'Resolving', severity: 'LOW' },
  { id: 'm-4', lat: 28.6129, lng: 77.2295, type: 'safe_haven', title: 'India Gate 24/7 Security Booth', status: 'Delhi Police Monitored' },
  { id: 'm-5', lat: 28.6315, lng: 77.2167, type: 'safe_haven', title: 'Connaught Place Central Hub', status: 'Active personnel & CCTV' },
  { id: 'm-6', lat: 28.6275, lng: 77.2155, type: 'police', title: 'Parliament Street Police Station', status: 'PCR Vans on Patrol' },
  { id: 'm-7', lat: 28.6410, lng: 77.1410, type: 'high_risk', title: 'Subhash Nagar Unlit Cut-through', status: 'Low illumination' },
  { id: 'm-8', lat: 28.6350, lng: 77.2250, type: 'patrol', title: 'Delhi Police PCR Van Victor-9', status: 'Patrolling' },
  { id: 'm-9', lat: 28.5283, lng: 77.2185, type: 'safe_haven', title: 'Saket Select CityWalk Safe Haven', status: '24/7 Monitored' },
  { id: 'm-10', lat: 28.6190, lng: 77.2340, type: 'patrol', title: 'Central Vista Quick Response Team', status: 'On standby' },
  { id: 'm-11', lat: 28.6510, lng: 77.1180, type: 'high_risk', title: 'Tagore Garden Service Lane', status: 'Reduced footfall' },
  { id: 'm-12', lat: 28.6010, lng: 77.2260, type: 'safe_haven', title: 'Khan Market Assistance Desk', status: 'Guard stationed' },
];
