import { cn } from '@/lib/utils';

/**
 * Score Badge Component - Color-coded hygiene score badge
 * 
 * @param {number} score - The hygiene score (0-100)
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showLabel - Whether to show the text label (default: false)
 * @param {string} className - Additional CSS classes
 * 
 * Color scheme:
 * - Green (85-100): Excellent
 * - Yellow (70-84): Good
 * - Red (<70): Needs Improvement
 */
export function ScoreBadge({ score, size = 'md', showLabel = false, className }) {
  // Determine color scheme based on score
  const getColorClasses = () => {
    if (score >= 85) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (score >= 70) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Get label text based on score
  const getLabel = () => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-all',
        getColorClasses(),
        sizeClasses[size],
        className
      )}
    >
      <span>{score}/100</span>
      {showLabel && (
        <>
          <span className="mx-1.5">•</span>
          <span>{getLabel()}</span>
        </>
      )}
    </div>
  );
}
