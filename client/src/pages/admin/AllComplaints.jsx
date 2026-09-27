import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle,
  UserCheck,
  Trash2,
  Eye,
  Building,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssignModal from '../../components/complaints/AssignModal';
import { CATEGORIES, PRIORITIES, STATUS_MAP } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalComplaints: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    departmentId: '',
  });

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
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
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load departments for filter dropdown
    departmentService.getDepartments().then((res) => {
      if (res.success) setDepartments(res.departments || []);
    });
  }, []);

  useEffect(() => {
    fetchComplaints(1);
  }, [filters.status, filters.category, filters.priority, filters.departmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '', category: '', priority: '', departmentId: '' });
  };

  const handleVerify = async (complaintId) => {
    if (!window.confirm('Verify this complaint and approve it for municipal dispatch?')) return;
    try {
      const res = await complaintService.verifyComplaint(complaintId);
      if (res.success) {
        toast.success('Complaint verified! Citizen has been notified.');
        fetchComplaints(pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleOpenAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (data) => {
    try {
      setAssigning(true);
      const res = await complaintService.assignComplaint(selectedComplaint._id, data);
      if (res.success) {
        toast.success('Complaint assigned to department & staff member!');
        setAssignModalOpen(false);
        fetchComplaints(pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;
    try {
      const res = await complaintService.deleteComplaint(complaintId);
      if (res.success) {
        toast.success('Complaint deleted successfully.');
        fetchComplaints(pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Municipal Complaints Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review citizen reports, execute status transitions, and dispatch municipal departments
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Complaint ID (e.g. CC10001) or title..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_MAP).map((k) => (
                <option key={k} value={k}>
                  {STATUS_MAP[k].label}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Department */}
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleResetFilters}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Fetching complaints database..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints match current filters"
          description="Adjust your search criteria or reset filters to display records."
          action={
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department / Staff</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.complaintId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-[180px] truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.category}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate">
                      {c.departmentId?.name ? (
                        <div>
                          <div className="font-semibold text-slate-800 truncate">{c.departmentId.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {c.assignedStaffId?.name || 'Unassigned staff'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.citizenId?.name || 'Citizen'}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/complaints/${c._id}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {c.status === 'PENDING' && (
                          <button
                            onClick={() => handleVerify(c._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg font-bold transition-colors"
                            title="Verify Complaint"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        )}

                        {(c.status === 'VERIFIED' || c.status === 'ASSIGNED') && (
                          <button
                            onClick={() => handleOpenAssignModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold transition-colors"
                            title="Assign to Staff"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {c.status === 'ASSIGNED' ? 'Reassign' : 'Assign'}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalComplaints}
            itemsPerPage={10}
            onPageChange={(p) => fetchComplaints(p)}
          />
        </div>
      )}

      {/* Assign Modal */}
      {selectedComplaint && (
        <AssignModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssignSubmit}
          initialPriority={selectedComplaint.priority}
          submitting={assigning}
        />
      )}
    </div>
  );
};

export default AllComplaints;
