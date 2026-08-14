import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string | null;
  role: 'consumer' | 'institution';
  institution_id: string | null;
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
  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, institution_id')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('[SafeSphere] Profile fetch failed:', error.message);
      return null;
    }
    return data as Profile;
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
        // Keep legacy localStorage helpers in sync
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return { error: error.message };
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

    // If email confirmation is disabled, upsert profile immediately
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        role,
      });
    }
    return { error: null };
  }

  async function signOut() {
    // Clear demo flag too
    localStorage.removeItem('safesphere_demo');
    localStorage.removeItem('safesphere_token');
    localStorage.removeItem('safesphere_user');
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
    <AuthContext.Provider value={{ session, user, profile, loading, isDemo, signIn, signUp, signOut, setDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}
