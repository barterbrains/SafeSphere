import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import routeRoutes from './routes/routes';
import journeyRoutes from './routes/journeys';
import safeZoneRoutes from './routes/safeZones';
import institutionRoutes from './routes/institution';
import safetyEventsRoutes from './routes/safetyEvents';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

// CORS: allow localhost for dev + any Vercel deployment domain + explicit ALLOWED_ORIGIN override
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Vercel internal rewrites, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In production allow everything if ALLOW_ALL_ORIGINS is set
      if (process.env.ALLOW_ALL_ORIGINS === 'true') return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/safe-zones', safeZoneRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/safety-events', safetyEventsRoutes);

// Health check — also reports Supabase connection status for debugging
app.get('/api/health', (_req, res) => {
  const { isSupabaseConfigured, isUsingServiceRole } = require('./supabase');
  const rawUrl  = process.env.SUPABASE_URL || '';
  const rawKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConfigured() ? 'connected' : 'in-memory-fallback',
    supabaseRole: isSupabaseConfigured()
      ? (isUsingServiceRole() ? 'service_role (RLS bypassed ✅)' : 'anon (RLS active ⚠️)')
      : 'none',
    env: {
      hasSupabaseUrl:     !!rawUrl,
      supabaseUrlPrefix:  rawUrl  ? rawUrl.substring(0, 20)  + '...' : 'MISSING',
      hasSupabaseKey:     !!rawKey,
      supabaseKeyLength:  rawKey.length,
      supabaseKeyPrefix:  rawKey  ? rawKey.substring(0, 10) + '...' : 'MISSING',
      hasJwtSecret:       !!process.env.JWT_SECRET,
      nodeEnv:            process.env.NODE_ENV || 'development',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`SafeSphere API running on http://localhost:${PORT}`);
  });
}

export default app;
