import React from 'react';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'rejected' | 'flagged';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (status === 'verified') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]} ${className}`}
        title="Verified Property — Identity & Campus Inspection Audited"
      >
        <ShieldCheck size={iconSizes[size]} className="text-emerald-500 shrink-0" />
        <span>Verified Listing</span>
      </span>
    );
  }

  if (status === 'flagged' || status === 'rejected') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${sizeClasses[size]} ${className}`}
      >
        <ShieldAlert size={iconSizes[size]} className="text-rose-500 shrink-0" />
        <span>Under Review</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30 ${sizeClasses[size]} ${className}`}
    >
      <Clock size={iconSizes[size]} className="text-slate-400 shrink-0" />
      <span>Pending Verification</span>
    </span>
  );
};
