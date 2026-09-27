import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Building,
  Users,
  CheckSquare,
  User,
  X,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  const citizenLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints/new', label: 'Report Issue', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
    { to: '/admin/departments', label: 'Departments', icon: Building },
    { to: '/admin/staff', label: 'Staff Management', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const staffLinks = [
    { to: '/dashboard', label: 'Staff Overview', icon: LayoutDashboard },
    { to: '/staff/complaints', label: 'Assigned Tasks', icon: CheckSquare },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const links =
    role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : citizenLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 md:hidden">
          <span className="font-bold text-slate-800 text-sm">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* User info card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  {role} Portal
                </p>
              </div>
            </div>
            {role === 'staff' && user?.department && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 truncate">
                🏢 {user.department.name}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-100">
              <NavLink
                to="/"
                onClick={() => onClose && onClose()}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-150"
              >
                <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Public Portal</span>
              </NavLink>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
