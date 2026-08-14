import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function sanitizeEnv(val?: string): string {
  if (!val) return '';
  // Strip bullet points (U+2022), zero-width spaces, BOM, and surrounding whitespace/quotes
  return val.replace(/[\u2022\u200B\uFEFF]/g, '').trim().replace(/^["']|["']$/g, '');
}

function getEnvVars() {
  const url = sanitizeEnv(process.env.SUPABASE_URL);
  const serviceKey = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const key = serviceKey
    || sanitizeEnv(process.env.SUPABASE_KEY)
    || sanitizeEnv(process.env.SUPABASE_ANON_KEY);
  return { url, key, serviceKey };
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getEnvVars();
  return Boolean(url && key && url.startsWith('http'));
};

export const isUsingServiceRole = (): boolean => {
  const { serviceKey } = getEnvVars();
  return Boolean(serviceKey);
};

// ── Lazy singleton ──────────────────────────────────────────────────────────
// Created on first access so that env vars are read AFTER Vercel injects them,
// not at module-load time (which can happen before env vars are available in
// some bundled/serverless contexts).

let _client: SupabaseClient | null | undefined = undefined;

function getClient(): SupabaseClient | null {
  if (_client !== undefined) return _client;

  const { url, key, serviceKey } = getEnvVars();

  if (!url || !key || !url.startsWith('http')) {
    console.warn(
      '⚠️  Supabase credentials missing or invalid after sanitization. ' +
      `SUPABASE_URL present=${Boolean(process.env.SUPABASE_URL)}, ` +
      `SERVICE_ROLE_KEY present=${Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}. ` +
      'Falling back to in-memory store.'
    );
    _client = null;
    return null;
  }

  try {
    _client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (serviceKey) {
      console.log('✅ Supabase initialised with Service Role Key — RLS bypass active.');
    } else {
      console.warn('⚠️  Supabase initialised with ANON key — backend DB writes may be blocked by RLS!');
    }
  } catch (err) {
    console.error('❌ Supabase createClient threw:', err);
    _client = null;
  }

  return _client;
}

// Export a Proxy so all existing `supabase.from(...)` call-sites work unchanged.
// The proxy resolves the lazy client on every property access.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = getClient();
    if (!client) return undefined;
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  apply(_target, _thisArg, args) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialised');
    return (client as any)(...args);
  },
});
