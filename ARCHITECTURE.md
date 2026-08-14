# SafeSphere Architecture

SafeSphere relies on a modern, serverless architecture optimized for speed, reliability, and security.

## Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, Lucide React, Recharts.
- **Backend**: Node.js, Express, TypeScript.
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime, Row-Level Security).
- **External APIs**: OpenStreetMap Overpass API (for live safe zones, lighting, and isolation proxy data).

## Data Flow
1. **Client Request**: The frontend React app requests route options from the Express backend.
2. **Backend Processing**: The backend validates the request and orchestrates data fetching.
3. **Real-Data Fetching**: The `overpass.ts` service queries the OSM Overpass API for real-world environmental factors (lighting, crowd activity, safe zones) near the destination coordinates.
4. **SafeScore Calculation**: The `safescore.ts` engine combines the Overpass data with historical district metrics and applies risk penalties to compute a 0-100 score.
5. **Database Interaction**: Supabase stores user profiles, active journeys, SOS events, and institutional analytics. Row-Level Security (RLS) ensures data isolation.

## Security
- **Authentication**: Handled by Supabase Auth (JWT).
- **Authorization**: Row-Level Security (RLS) enforced at the database level.
- **Server-Side Trust**: Route scoring and SOS generation are processed on the backend to prevent client-side spoofing.
