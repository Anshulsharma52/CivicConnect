import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/common/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import CreateComplaint from '../pages/citizen/CreateComplaint';
import MyComplaints from '../pages/citizen/MyComplaints';
import AllComplaints from '../pages/admin/AllComplaints';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ManageStaff from '../pages/admin/ManageStaff';
import AssignedComplaints from '../pages/staff/AssignedComplaints';
import ComplaintDetails from '../pages/complaints/ComplaintDetails';
import Profile from '../pages/common/Profile';
import NotFound from '../pages/common/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside Main Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/profile" element={<Profile />} />

          {/* Citizen Routes */}
          <Route element={<ProtectedRoute allowedRoles={['citizen', 'admin']} />}>
            <Route path="/complaints/new" element={<CreateComplaint />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
            <Route path="/staff/complaints" element={<AssignedComplaints />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/complaints" element={<AllComplaints />} />
            <Route path="/admin/departments" element={<ManageDepartments />} />
            <Route path="/admin/staff" element={<ManageStaff />} />
          </Route>

          {/* Shared Complaint Details */}
          <Route path="/complaints/:id" element={<ComplaintDetails />} />

          {/* 404 Inside Shell */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
