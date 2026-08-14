import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string | null;
  role: 'consumer' | 'institution';
  institution_id: string | null;
  phone?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  medical_conditions?: string | null;
  home_address?: string | null;
  work_safe_zone?: string | null;
  onboarded?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role?: 'consumer' | 'institution') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setDemoMode: () => void;
  refreshProfile: () => Promise<Profile | null>;
  completeOnboarding: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(
    () => localStorage.getItem('safesphere_demo') === 'true'
  );

  // Fetch profile row from public.profiles
  async function fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[SafeSphere] Profile fetch error:', error.message);
        return null;
      }
      return (data as Profile) || null;
    } catch (err: any) {
      console.warn('[SafeSphere] Profile fetch exception:', err);
      return null;
    }
  }

  async function refreshProfile(): Promise<Profile | null> {
    if (!user) return null;
    const p = await fetchProfile(user.id);
    if (p) {
      setProfile(p);
      localStorage.setItem('safesphere_user', JSON.stringify({ id: p.id, name: p.name, email: user.email, role: p.role }));
    }
    return p;
  }

  // Initialise on mount: restore session from storage
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const p = await fetchProfile(s.user.id);
        setProfile(p);
        if (p) {
          localStorage.setItem('safesphere_token', s.access_token);
          localStorage.setItem('safesphere_user', JSON.stringify({ id: p.id, name: p.name, email: s.user.email, role: p.role }));
        }
      }
      setLoading(false);
    });

    // Listen for auth changes (sign in / sign out / token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const p = await fetchProfile(s.user.id);
        setProfile(p);
        if (p) {
          localStorage.setItem('safesphere_token', s.access_token);
          localStorage.setItem('safesphere_user', JSON.stringify({ id: p.id, name: p.name, email: s.user.email, role: p.role }));
        }
      } else {
        setProfile(null);
        localStorage.removeItem('safesphere_token');
        localStorage.removeItem('safesphere_user');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────
  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    setLoading(true);
    // Explicitly reset demo flag when performing a real login
    localStorage.removeItem('safesphere_demo');
    setIsDemo(false);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    if (data.user) {
      const p = await fetchProfile(data.user.id);
      setProfile(p);
      if (p) {
        localStorage.setItem('safesphere_user', JSON.stringify({ id: p.id, name: p.name, email: data.user.email, role: p.role }));
      }
    }
    setLoading(false);
    return { error: null };
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    role: 'consumer' | 'institution' = 'consumer'
  ): Promise<{ error: string | null }> {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    setLoading(false);
    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        role,
        onboarded: false,
      });
    }
    return { error: null };
  }

  async function completeOnboarding(data: Partial<Profile>): Promise<{ error: string | null }> {
    if (!user) return { error: 'No active session.' };
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        onboarded: true,
      })
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    await refreshProfile();
    return { error: null };
  }

  async function signOut() {
    // Clear user specific keys if user id is known
    if (user?.id) {
      localStorage.removeItem(`safesphere_latest_sos_${user.id}`);
      localStorage.removeItem(`safesphere_user_reported_incidents_${user.id}`);
      localStorage.removeItem(`safesphere_user_journeys_${user.id}`);
    }
    localStorage.removeItem('safesphere_demo');
    localStorage.removeItem('safesphere_token');
    localStorage.removeItem('safesphere_user');
    localStorage.removeItem('safesphere_latest_sos');
    localStorage.removeItem('safesphere_user_reported_incidents');
    localStorage.removeItem('safesphere_user_journeys');
    localStorage.removeItem('safesphere_active_sos_alerts');
    setIsDemo(false);
    await supabase.auth.signOut();
  }

  function setDemoMode() {
    localStorage.setItem('safesphere_demo', 'true');
    localStorage.setItem('safesphere_token', 'demo-token-xyz');
    localStorage.setItem('safesphere_user', JSON.stringify({
      id: 'demo-user-123',
      name: 'Command Agent',
      email: 'demo@safesphere.in',
      role: 'institution',
    }));
    setIsDemo(true);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isDemo, signIn, signUp, signOut, setDemoMode, refreshProfile, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
