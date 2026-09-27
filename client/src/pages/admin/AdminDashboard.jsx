import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  Layers,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/dateFormatter';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Generating municipal analytics..." />;
  }

  const { stats, categoryStats, priorityStats, departmentStats, recentComplaints } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Executive Municipal Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            City Civic Intelligence Dashboard
          </h1>
          <p className="mt-1 text-slate-300 text-xs sm:text-sm">
            Real-time municipal grievance monitoring, resource dispatch, and resolution telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/30"
          >
            Manage Complaints
          </Link>
          <Link
            to="/admin/departments"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors backdrop-blur-sm"
          >
            Departments
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Filed</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats?.totalComplaints || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pending || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Verified</span>
          <p className="text-2xl font-black text-sky-600 mt-1">{stats?.verified || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats?.inProgress || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {(stats?.resolved || 0) + (stats?.closed || 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Rejected</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats?.rejected || 0}</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Complaints by Category
              </h3>
            </div>
            <div className="space-y-3">
              {categoryStats?.length === 0 ? (
                <p className="text-xs text-slate-400">No category data yet.</p>
              ) : (
                categoryStats?.map((c) => {
                  const percentage = stats?.totalComplaints
                    ? Math.round((c.count / stats.totalComplaints) * 100)
                    : 0;
                  return (
                    <div key={c._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{c._id}</span>
                        <span className="text-slate-500 font-mono">
                          {c.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Urgency & Priority Distribution
              </h3>
            </div>
            <div className="space-y-4">
              {['HIGH', 'MEDIUM', 'LOW'].map((pLevel) => {
                const count = priorityStats?.find((p) => p._id === pLevel)?.count || 0;
                const percentage = stats?.totalComplaints
                  ? Math.round((count / stats.totalComplaints) * 100)
                  : 0;
                const color =
                  pLevel === 'HIGH'
                    ? 'bg-rose-500'
                    : pLevel === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';

                return (
                  <div key={pLevel} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">{pLevel} Priority</span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {count} complaints ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Resolution Ratios */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Department Activity
              </h3>
              <Link to="/admin/departments" className="text-xs text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {departmentStats?.map((dept) => {
                const rate = dept.total ? Math.round((dept.resolved / dept.total) * 100) : 0;
                return (
                  <div key={dept.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate">{dept.name}</span>
                      <span className="text-[11px] font-mono text-indigo-600 font-bold">{rate}% done</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{dept.total} assigned</span>
                      <span>{dept.resolved} resolved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Citizen Submissions</h3>
            <p className="text-xs text-slate-500">Live incoming complaint stream</p>
          </div>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Review all complaints
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints?.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.complaintId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.citizenId?.name || 'Citizen'}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold transition-colors inline-block"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
