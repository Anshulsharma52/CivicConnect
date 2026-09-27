import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import StaffDashboard from '../staff/StaffDashboard';
import CitizenDashboard from '../citizen/CitizenDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }

  return <CitizenDashboard />;
};

export default DashboardRouter;
