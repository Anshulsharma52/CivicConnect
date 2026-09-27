export const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Street Light',
  'Water',
  'Drainage',
  'Public Infrastructure',
  'Other',
];

export const PRIORITIES = [
  { value: 'LOW', label: 'Low', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'MEDIUM', label: 'Medium', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'HIGH', label: 'High', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export const STATUS_MAP = {
  PENDING: {
    label: 'Pending Verification',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    stepIndex: 0,
  },
  VERIFIED: {
    label: 'Verified',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-500',
    stepIndex: 1,
  },
  ASSIGNED: {
    label: 'Assigned',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
    stepIndex: 2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
    stepIndex: 3,
  },
  RESOLVED: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    stepIndex: 4,
  },
  CLOSED: {
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-500',
    stepIndex: 5,
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    stepIndex: -1,
  },
};

export const LIFECYCLE_STEPS = [
  { key: 'PENDING', label: 'Submitted' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];
