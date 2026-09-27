import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, Eye, MapPin, Calendar } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintFilter from '../../components/complaints/ComplaintFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResolutionModal from '../../components/complaints/ResolutionModal';
import { formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalComplaints: 0 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssigned = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        ...filters,
      };
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });

      const res = await complaintService.getComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        setPagination({
          currentPage: res.currentPage,
          totalPages: res.totalPages,
          totalComplaints: res.totalComplaints,
        });
      }
    } catch (err) {
      console.error('Failed to load assigned tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned(1);
  }, [filters.status, filters.category, filters.priority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssigned(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleStartWork = async (complaintId) => {
    try {
      setSubmitting(true);
      const res = await complaintService.updateStatus(complaintId, { status: 'IN_PROGRESS' });
      if (res.success) {
        toast.success('Work marked as started! Citizen notified.');
        fetchAssigned(pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResolutionModal = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setResolutionModalOpen(true);
  };

  const handleResolutionSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await complaintService.updateStatus(selectedComplaintId, formData);
      if (res.success) {
        toast.success('Complaint marked as RESOLVED! Proof uploaded and citizen notified.');
        setResolutionModalOpen(false);
        fetchAssigned(pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resolution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Assigned Field Tasks</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          All complaints assigned to you for inspection and on-site resolution
        </p>
      </div>

      <ComplaintFilter
        filters={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onReset={() => setFilters({ search: '', status: '', category: '', priority: '' })}
      />

      {loading ? (
        <LoadingSpinner size="lg" text="Loading assigned tasks..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No assigned tasks found"
          description="You currently have no tasks matching this filter criteria."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-200 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                      {c.complaintId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mt-1">{c.title}</h3>
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location?.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/complaints/${c._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {c.status === 'ASSIGNED' && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleStartWork(c._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Start Work
                      </button>
                    )}

                    {c.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleOpenResolutionModal(c._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalComplaints}
            itemsPerPage={9}
            onPageChange={(p) => fetchAssigned(p)}
          />
        </>
      )}

      {/* Resolution modal */}
      <ResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onSubmit={handleResolutionSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default AssignedComplaints;
