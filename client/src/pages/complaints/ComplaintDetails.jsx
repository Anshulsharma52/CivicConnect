import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Building,
  User,
  ShieldCheck,
  CheckCircle,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusTimeline from '../../components/complaints/StatusTimeline';
import ComplaintMapView from '../../components/maps/ComplaintMapView';
import ImageGallery from '../../components/complaints/ImageGallery';
import ResolutionModal from '../../components/complaints/ResolutionModal';
import AssignModal from '../../components/complaints/AssignModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Actions
  const handleVerify = async () => {
    if (!window.confirm('Verify this complaint and approve it for department assignment?')) return;
    try {
      setActionLoading(true);
      const res = await complaintService.verifyComplaint(complaint._id);
      if (res.success) {
        toast.success('Complaint verified! Citizen notified in real time.');
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please enter the reason for rejecting this complaint:');
    if (!reason || !reason.trim()) return;

    try {
      setActionLoading(true);
      const res = await complaintService.rejectComplaint(complaint._id, reason.trim());
      if (res.success) {
        toast.info('Complaint rejected. Citizen notified with reason.');
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (data) => {
    try {
      setActionLoading(true);
      const res = await complaintService.assignComplaint(complaint._id, data);
      if (res.success) {
        toast.success('Assigned to department and staff member! Real-time notifications dispatched.');
        setAssignModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const res = await complaintService.updateStatus(complaint._id, { status: 'IN_PROGRESS' });
      if (res.success) {
        toast.success('Status updated to IN_PROGRESS. Work started on site.');
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolutionSubmit = async (formData) => {
    try {
      setActionLoading(true);
      const res = await complaintService.updateStatus(complaint._id, formData);
      if (res.success) {
        toast.success('Complaint marked as RESOLVED! Resolution proof uploaded.');
        setResolutionModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseComplaint = async () => {
    if (!window.confirm('Are you sure you want to close this resolved complaint?')) return;
    try {
      setActionLoading(true);
      const res = await complaintService.updateStatus(complaint._id, {
        status: 'CLOSED',
        note: user.role === 'citizen' ? 'Confirmed satisfactory resolution by citizen.' : 'Closed by admin.',
      });
      if (res.success) {
        toast.success('Complaint officially CLOSED.');
        fetchComplaintDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint record?')) return;
    try {
      setActionLoading(true);
      const res = await complaintService.deleteComplaint(complaint._id);
      if (res.success) {
        toast.success('Complaint removed.');
        navigate('/admin/complaints');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading complaint details..." />;
  }

  if (!complaint) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          This record may have been removed or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isCitizenOwner = user?.role === 'citizen' && complaint.citizenId?._id?.toString() === user?.id;
  const isAssignedStaff = user?.role === 'staff' && complaint.assignedStaffId?._id?.toString() === user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & ID header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black px-3 py-1 bg-slate-900 text-white rounded-xl shadow-sm">
            {complaint.complaintId}
          </span>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} size="lg" />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Title and metadata */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <Tag className="w-3 h-3" />
              {complaint.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Reported on {formatDateTime(complaint.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {complaint.title}
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Visual Lifecycle Timeline */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Complaint Progress Timeline
          </h3>
          <StatusTimeline
            currentStatus={complaint.status}
            statusHistory={complaint.statusHistory}
            rejectionReason={complaint.rejectionReason}
          />
        </div>

        {/* Map and Location info */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Incident Location
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {complaint.location?.latitude?.toFixed(4)}, {complaint.location?.longitude?.toFixed(4)}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {complaint.location?.address}
          </p>

          <ComplaintMapView
            latitude={complaint.location?.latitude}
            longitude={complaint.location?.longitude}
            address={complaint.location?.address}
            title={complaint.title}
            height="h-72"
          />
        </div>

        {/* Citizen Photos */}
        {complaint.images && complaint.images.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <ImageGallery images={complaint.images} title="Submitted Incident Photos" />
          </div>
        )}

        {/* Resolution Section (If Resolved or Closed) */}
        {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
          <div className="pt-4 border-t border-slate-100 space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolution Summary & Completion Proof
              </h3>
              {complaint.resolvedAt && (
                <span className="text-xs text-emerald-700 font-medium">
                  Resolved on {formatDateTime(complaint.resolvedAt)}
                </span>
              )}
            </div>

            {complaint.resolutionNote && (
              <p className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                {complaint.resolutionNote}
              </p>
            )}

            {complaint.resolutionImages && complaint.resolutionImages.length > 0 && (
              <ImageGallery
                images={complaint.resolutionImages}
                title="Municipal Field Completion Proof"
              />
            )}
          </div>
        )}

        {/* Stakeholder Details Grid */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Citizen Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Filing Citizen
            </span>
            <p className="font-bold text-slate-800 text-sm">{complaint.citizenId?.name || 'Citizen'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{complaint.citizenId?.email}</p>
            {complaint.citizenId?.phone && (
              <p className="text-xs text-slate-500">{complaint.citizenId.phone}</p>
            )}
          </div>

          {/* Department Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Assigned Department
            </span>
            <p className="font-bold text-slate-800 text-sm">
              {complaint.departmentId?.name || 'Not yet assigned'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {complaint.departmentId?.contactEmail || 'Awaiting municipal routing'}
            </p>
          </div>

          {/* Assigned Staff Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Field Staff Lead
            </span>
            <p className="font-bold text-slate-800 text-sm">
              {complaint.assignedStaffId?.name || 'Unassigned'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {complaint.assignedStaffId?.email || 'Field officer unassigned'}
            </p>
          </div>
        </div>

        {/* Status History Audit Log */}
        {complaint.statusHistory && complaint.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Status Change Audit Log
            </h3>
            <div className="space-y-2">
              {complaint.statusHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between text-xs p-3 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">{item.status}</span>
                    <span className="text-slate-400 ml-2">by {item.changedBy?.name || 'System'}</span>
                    {item.note && <p className="text-slate-600 mt-0.5">{item.note}</p>}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDateTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Last modified: {formatDateTime(complaint.updatedAt)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Citizen Actions */}
            {isCitizenOwner && complaint.status === 'RESOLVED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCloseComplaint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Satisfaction & Close Complaint
              </button>
            )}

            {/* Staff Actions */}
            {(isAssignedStaff || isAdmin) && complaint.status === 'ASSIGNED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStartWork}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Work On-Site
              </button>
            )}

            {(isAssignedStaff || isAdmin) && complaint.status === 'IN_PROGRESS' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setResolutionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Resolution & Photos
              </button>
            )}

            {/* Admin Actions */}
            {isAdmin && complaint.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleVerify}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify Complaint
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}

            {isAdmin && (complaint.status === 'VERIFIED' || complaint.status === 'ASSIGNED') && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setAssignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Building className="w-4 h-4" />
                {complaint.status === 'ASSIGNED' ? 'Reassign Department/Staff' : 'Assign Department & Staff'}
              </button>
            )}

            {isAdmin && complaint.status === 'RESOLVED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCloseComplaint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                Close Complaint
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDelete}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onSubmit={handleResolutionSubmit}
        submitting={actionLoading}
      />

      {/* Assign Modal */}
      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssignSubmit}
        initialPriority={complaint.priority}
        submitting={actionLoading}
      />
    </div>
  );
};

export default ComplaintDetails;
