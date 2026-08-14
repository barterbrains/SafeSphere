// ── SafeSphere Real Incident Service (Crowd-Sourced Supabase Reports) ───────
// Manages real community safety hazard and incident reporting:
// 1. Report Incident: User logs hazard with pin location, category, severity, description.
// 2. Query Route Incidents: Fetches active incidents within buffer from last 30 days.
// 3. Recency & Severity Weighting calculation.

import { supabase } from '../lib/supabase';

export interface UserReportedIncident {
  id: string;
  user_id?: string | null;
  lat: number;
  lng: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  address?: string;
  created_at: string;
}

/**
 * Inserts a new user incident report into Supabase.
 */
export async function reportIncidentToSupabase(payload: {
  userId?: string | null;
  lat: number;
  lng: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  address?: string;
}): Promise<{ data: UserReportedIncident | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        user_id: payload.userId || null,
        lat: payload.lat,
        lng: payload.lng,
        type: payload.type,
        severity: payload.severity,
        description: payload.description,
        address: payload.address || 'Delhi NCR Region',
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.warn('[SafeSphere Incidents] Supabase insert warning:', error.message);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to submit incident report.' };
  }
}

/**
 * Queries incidents within bounding box of the route coordinates from the last 30 days.
 */
export async function fetchIncidentsAlongRoute(
  coordinates: [number, number][],
  bufferDegrees = 0.004 // ~250m buffer
): Promise<UserReportedIncident[]> {
  if (!coordinates || coordinates.length === 0) return [];

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  coordinates.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .gte('lat', minLat - bufferDegrees)
      .lte('lat', maxLat + bufferDegrees)
      .gte('lng', minLng - bufferDegrees)
      .lte('lng', maxLng + bufferDegrees)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('active', true);

    if (error || !data) {
      return [];
    }

    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      lat: Number(item.lat),
      lng: Number(item.lng),
      type: item.type,
      severity: item.severity || 'medium',
      description: item.description,
      address: item.address,
      created_at: item.created_at,
    }));
  } catch (err) {
    console.warn('[SafeSphere Incidents] Fetch error:', err);
    return [];
  }
}
