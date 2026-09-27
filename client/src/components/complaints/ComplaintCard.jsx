import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Tag } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate } from '../../utils/dateFormatter';

const ComplaintCard = ({ complaint }) => {
  const thumbnail = complaint.images && complaint.images.length > 0 ? complaint.images[0].url : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Header with image or category accent */}
        {thumbnail ? (
          <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
            <img
              src={thumbnail}
              alt={complaint.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute top-3 left-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-900/80 text-white rounded-lg backdrop-blur-sm shadow-sm">
                {complaint.complaintId}
              </span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {complaint.complaintId}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Tag className="w-3 h-3" />
              {complaint.category}
            </span>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
            {complaint.title}
          </h3>

          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{complaint.location?.address || 'Location provided'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(complaint.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <Link
          to={`/complaints/${complaint._id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-slate-200/80 hover:border-indigo-600"
        >
          View Complaint Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
