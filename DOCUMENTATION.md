# SafeSphere Documentation

## Product Vision
Make personal safety a live, explainable input to everyday navigation, and give institutions the aggregated intelligence to act on it — computed from real data where real data exists, and honestly simulated where it doesn't.

## The SafeScore Engine
The SafeScore is a transparent 0-100 metric calculated dynamically.

**Positive Weights (+):**
- Historical Safety Factor (20%) - Real NCRB data
- Lighting Quality (20%) - Real OSM tag data
- Crowd / Activity Level (15%) - Real OSM POI density
- Route Accessibility (10%)
- Proximity to Safe Zones (10%) - Real OSM amenity data

**Risk Penalties (-):**
- Incident Risk (15%)
- Isolation Risk (10%) - Inverse of OSM crowd proxy
- Active Safety Event Penalty (up to 25%)

## User Flows
### Consumer (Traveler)
1. Register/Login or use Demo Account.
2. Search Destination.
3. Compare Routes (Fastest vs. Safest vs. Balanced).
4. Review SafeScore breakdown.
5. Start Journey & Activate Journey Guardian.
6. Trigger SOS if necessary.

### Institution (Security/Admin)
1. Login with Institutional Credentials.
2. View Command Center Overview (KPIs, Heatmap).
3. Analyze SafeScore trends and incident tables.
4. Monitor Fleet Status.

## Simulated Fallbacks
To guarantee continuous operation during demos or API outages, SafeSphere implements a robust fallback mechanism. If the Overpass API times out (after 8s) or fails, the backend automatically substitutes neutral middle-ground sub-scores (50/100) for lighting, crowd, and isolation metrics, ensuring the application never crashes.
