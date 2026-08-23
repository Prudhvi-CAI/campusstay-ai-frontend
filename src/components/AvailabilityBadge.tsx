import React from 'react';
import { BedDouble, CheckCircle2, XCircle } from 'lucide-react';

interface AvailabilityBadgeProps {
  availableBeds: number;
  className?: string;
  roomType?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availableBeds,
  className = '',
  roomType,
}) => {
  if (availableBeds > 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <BedDouble size={13} />
        <span>
          {availableBeds} bed{availableBeds > 1 ? 's' : ''} available
          {roomType ? ` (${roomType})` : ''}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${className}`}
    >
      <XCircle size={13} />
      <span>Currently Full (0 Beds)</span>
    </span>
  );
};
