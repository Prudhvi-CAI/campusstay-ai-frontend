import React from 'react';
import { RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';
import { FreshnessInfo } from '../types';

interface FreshnessBadgeProps {
  freshness: FreshnessInfo;
  className?: string;
  showWarningText?: boolean;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  freshness,
  className = '',
  showWarningText = false,
}) => {
  const isFresh = freshness.status_level === 'fresh';
  const isWarning = freshness.status_level === 'warning';
  const isOutdated = freshness.status_level === 'outdated';

  const badgeStyle = isFresh
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    : isWarning
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
        title={freshness.warning_message || 'Owner verified availability recently'}
      >
        {isFresh && <RefreshCw size={12} className="text-emerald-500 animate-spin-slow" />}
        {isWarning && <AlertTriangle size={12} className="text-amber-500" />}
        {isOutdated && <AlertCircle size={12} className="text-rose-500" />}
        <span>Updated {freshness.formatted_time_ago}</span>
      </span>

      {showWarningText && freshness.warning_message && (
        <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} className="shrink-0" />
          <span>{freshness.warning_message}</span>
        </p>
      )}
    </div>
  );
};
