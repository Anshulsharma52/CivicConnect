import React from 'react';
import { PRIORITIES } from '../../utils/constants';

const PriorityBadge = ({ priority }) => {
  const meta = PRIORITIES.find((p) => p.value === priority) || {
    label: priority || 'Medium',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${meta.badgeClass}`}
    >
      {meta.label}
    </span>
  );
};

export default PriorityBadge;
