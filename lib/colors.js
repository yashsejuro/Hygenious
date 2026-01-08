export const healthColors = {
  primary: {
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  slate: {
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  status: {
    excellent: '#22c55e',
    good: '#84cc16',
    fair: '#eab308',
    poor: '#f97316',
    critical: '#ef4444'
  },
};

export function getScoreColor(score) {
  if (score >= 85) return healthColors.status.excellent;
  if (score >= 70) return healthColors.status.good;
  if (score >= 60) return healthColors.status.fair;
  if (score >= 40) return healthColors.status.poor;
  return healthColors.status.critical;
}

export function getScoreTextClass(score) {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-lime-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBadgeClass(score) {
  if (score >= 85) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 70) return 'bg-lime-50 text-lime-700 border-lime-200';
  if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (score >= 40) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}
