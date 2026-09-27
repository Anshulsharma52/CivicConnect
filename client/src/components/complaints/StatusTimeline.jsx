import React from 'react';
import { Check, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { LIFECYCLE_STEPS, STATUS_MAP } from '../../utils/constants';
import { formatDateTime } from '../../utils/dateFormatter';

const StatusTimeline = ({ currentStatus, statusHistory = [], rejectionReason = '' }) => {
  if (currentStatus === 'REJECTED') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-rose-900 text-sm">Complaint Rejected</h4>
            <p className="text-xs text-rose-700 mt-1">
              {rejectionReason || 'This complaint has been rejected by the municipal administration.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_MAP[currentStatus]?.stepIndex ?? 0;

  // Build a map of dates from history for each status
  const historyMap = {};
  statusHistory.forEach((item) => {
    historyMap[item.status] = item.timestamp;
  });

  return (
    <div className="py-2">
      <div className="relative">
        {/* Progress connecting line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="hidden md:block absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, (currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100))}%`,
          }}
        />

        {/* Step icons and labels */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && currentStatus === 'CLOSED');
            const isCurrent = idx === currentStepIndex && currentStatus !== 'CLOSED';
            const timestamp = historyMap[step.key];

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-subtle-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-spin-slow" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2.5">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-indigo-600 font-bold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {timestamp && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
