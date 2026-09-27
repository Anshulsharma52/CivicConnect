import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResolutionModal from '../../components/complaints/ResolutionModal';
import { formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentComplaints(res.data.recentComplaints || []);
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartWork = async (complaintId) => {
    try {
      setUpdating(true);
      const res = await complaintService.updateStatus(complaintId, { status: 'IN_PROGRESS' });
      if (res.success) {
        toast.success('Status updated to IN_PROGRESS. Citizen notified.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenResolutionModal = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setResolutionModalOpen(true);
  };

  const handleResolutionSubmit = async (formData) => {
    try {
      setUpdating(true);
      const res = await complaintService.updateStatus(selectedComplaintId, formData);
      if (res.success) {
        toast.success('Complaint marked as RESOLVED! Proof uploaded and citizen notified.');
        setResolutionModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resolution');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading staff dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <Wrench className="w-3.5 h-3.5" />
            Field Staff Dispatch Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            {user?.department?.name
              ? `Department: ${user.department.name}. `
              : ''}
            Review complaints assigned to you, update work progression in real time, and upload resolution proof photos.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assigned</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.totalAssigned || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Action</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats?.pendingAction || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{stats?.inProgress || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{stats?.resolved || 0}</p>
        </div>
      </div>

      {/* Assigned Complaints Table / Card List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Assigned Complaints</h2>
            <p className="text-xs text-slate-500">Tasks requiring your attention and resolution</p>
          </div>
          <Link
            to="/staff/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all tasks
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            title="No complaints assigned yet"
            description="You are all caught up! New tasks assigned by municipal admins will show up here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentComplaints.map((c) => (
              <div
                key={c._id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors"
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

                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{c.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location?.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/complaints/${c._id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </Link>

                  <div className="flex items-center gap-2">
                    {c.status === 'ASSIGNED' && (
                      <button
                        type="button"
                        disabled={updating}
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
                        disabled={updating}
                        onClick={() => handleOpenResolutionModal(c._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve Issue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proof of Resolution Modal */}
      <ResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onSubmit={handleResolutionSubmit}
        submitting={updating}
      />
    </div>
  );
};

export default StaffDashboard;
