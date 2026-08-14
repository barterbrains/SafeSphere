// SafeScore config (mirrors backend) for frontend display
export const SAFESCORE_CONFIG = {
  weights: {
    historicalSafety: 0.20,
    lightingQuality: 0.20,
    crowdActivity: 0.15,
    routeAccessibility: 0.10,
    proximityToSafeZones: 0.10,
    incidentRisk: -0.15,
    isolationRisk: -0.10,
  },
  riskCategories: [
    { min: 80, max: 100, label: 'Very Safe', color: '#16a34a', badgeClass: 'badge-safe', bgColor: '#dcfce7' },
    { min: 65, max: 79,  label: 'Relatively Safe', color: '#65a30d', badgeClass: 'badge-good', bgColor: '#ecfccb' },
    { min: 50, max: 64,  label: 'Moderate', color: '#d97706', badgeClass: 'badge-moderate', bgColor: '#fef3c7' },
    { min: 30, max: 49,  label: 'Elevated Risk', color: '#ea580c', badgeClass: 'badge-elevated', bgColor: '#ffedd5' },
    { min: 0,  max: 29,  label: 'High Risk', color: '#dc2626', badgeClass: 'badge-high', bgColor: '#fee2e2' },
  ],
};

export function getRiskCategory(score: number) {
  return SAFESCORE_CONFIG.riskCategories.find(c => score >= c.min && score <= c.max)
    || SAFESCORE_CONFIG.riskCategories[SAFESCORE_CONFIG.riskCategories.length - 1];
}

export function getScoreColor(score: number): string {
  const cat = getRiskCategory(score);
  return cat.color;
}

export function getRiskBadgeClass(score: number): string {
  const cat = getRiskCategory(score);
  return cat.badgeClass;
}

export function formatScore(score: number): string {
  return String(Math.round(score));
}

// API base URL
export const API_BASE = '/api';

// Auth helpers
export function getToken(): string | null {
  return localStorage.getItem('safesphere_token');
}

export function getUser(): any {
  const u = localStorage.getItem('safesphere_user');
  return u ? JSON.parse(u) : null;
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('safesphere_token', token);
  localStorage.setItem('safesphere_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('safesphere_token');
  localStorage.removeItem('safesphere_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// API fetch helper
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return response.json();
}

// Format time helpers
export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
