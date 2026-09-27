import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintFilter from '../../components/complaints/ComplaintFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalComplaints: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
  });

  const fetchMyComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        myComplaints: 'true',
        ...filters,
      };
      // Strip empty values
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
      console.error('Failed to fetch my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints(1);
  }, [filters.status, filters.category, filters.priority]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyComplaints(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '', category: '', priority: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Complaints</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View status and updates for all civic grievances you have submitted
          </p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <ComplaintFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={
            filters.search || filters.status || filters.category
              ? 'No complaints match your active filter criteria. Try resetting filters.'
              : 'You have not submitted any civic complaints yet.'
          }
          action={
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
            >
              <PlusCircle className="w-4 h-4" />
              File Your First Complaint
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalComplaints}
            itemsPerPage={9}
            onPageChange={(page) => fetchMyComplaints(page)}
          />
        </>
      )}
    </div>
  );
};

export default MyComplaints;
