import { useEffect, useRef } from 'react';
import { getRiskCategory, getScoreColor } from '../utils';

interface SafeScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export default function SafeScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  animated = true,
}: SafeScoreRingProps) {
  const category = getRiskCategory(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Score fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={category.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: animated ? 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' : 'none' }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span className="font-black leading-none" style={{ fontSize: size * 0.25, color: category.color }}>
            {Math.round(score)}
          </span>
          <span style={{ fontSize: size * 0.1, color: '#9ca3af', fontWeight: 500 }}>/ 100</span>
        </div>
      </div>
      {showLabel && (
        <span className={`badge ${category.badgeClass}`}>{category.label}</span>
      )}
    </div>
  );
}
