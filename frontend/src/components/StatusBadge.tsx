import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Applied':
        return {
          container: 'bg-[#1f1f1f] text-[#c6c6c7] border-[#353535]',
          dot: 'bg-[#8e9192]',
        };
      case 'Interview':
        return {
          container: 'bg-white/10 text-white border-white/20',
          dot: 'bg-white animate-pulse',
        };
      case 'Offer':
        return {
          container: 'bg-white text-[#131313] border-white font-semibold',
          dot: 'bg-[#131313]',
        };
      case 'Reject':
        return {
          container: 'bg-[#93000a]/20 text-[#ffb4ab] border-[#93000a]/40',
          dot: 'bg-[#ffb4ab]',
        };
      default:
        return {
          container: 'bg-[#1f1f1f] text-[#c6c6c7] border-[#353535]',
          dot: 'bg-[#8e9192]',
        };
    }
  };

  const { container, dot } = getStyles();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider ${container} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};
