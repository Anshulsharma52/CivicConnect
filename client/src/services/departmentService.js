import api from './api';

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  getDepartmentStaff: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/staff`);
    return response.data;
  },

  // Users & Staff management
  getStaffMembers: async (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    const response = await api.get('/users/staff', { params });
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await api.post('/users/staff', staffData);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
};
