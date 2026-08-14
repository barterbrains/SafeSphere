import { getRiskCategory } from '../utils';

interface ScoreBreakdown {
  historicalSafety: number;
  lightingQuality: number;
  crowdActivity: number;
  routeAccessibility: number;
  proximityToSafeZones: number;
  incidentRisk: number;
  isolationRisk: number;
}

interface ScoreBreakdownChartProps {
  breakdown: ScoreBreakdown;
  safeScore: number;
}

const components = [
  { key: 'historicalSafety', label: 'Historical Safety', weight: '×0.20', positive: true },
  { key: 'lightingQuality', label: 'Lighting Quality', weight: '×0.20', positive: true },
  { key: 'crowdActivity', label: 'Crowd Activity', weight: '×0.15', positive: true },
  { key: 'routeAccessibility', label: 'Route Accessibility', weight: '×0.10', positive: true },
  { key: 'proximityToSafeZones', label: 'Safe Zone Proximity', weight: '×0.10', positive: true },
  { key: 'incidentRisk', label: 'Incident Risk', weight: '−×0.15', positive: false },
  { key: 'isolationRisk', label: 'Isolation Risk', weight: '−×0.10', positive: false },
] as const;

export default function ScoreBreakdownChart({ breakdown, safeScore }: ScoreBreakdownChartProps) {
  const category = getRiskCategory(safeScore);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          SafeScore™ is decision support, not a guarantee of safety.
        </span>
      </div>
      {components.map(({ key, label, weight, positive }) => {
        const value = breakdown[key];
        const barColor = positive
          ? value >= 70 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626'
          : value <= 30 ? '#16a34a' : value <= 50 ? '#d97706' : '#dc2626';

        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: positive ? '#4f46e5' : '#dc2626',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.83rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{weight}</span>
              </div>
              <span style={{ fontSize: '0.83rem', fontWeight: 700, color: barColor }}>
                {positive ? '' : '−'}{value}
              </span>
            </div>
            <div className="score-bar">
              <div
                className="score-bar-fill"
                style={{
                  width: `${value}%`,
                  background: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
