import api from './api';

export const complaintService = {
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  verifyComplaint: async (id, data = {}) => {
    const response = await api.patch(`/complaints/${id}/verify`, data);
    return response.data;
  },

  rejectComplaint: async (id, reason) => {
    const response = await api.patch(`/complaints/${id}/reject`, { reason });
    return response.data;
  },

  assignComplaint: async (id, data) => {
    const response = await api.patch(`/complaints/${id}/assign`, data);
    return response.data;
  },

  updateStatus: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.patch(`/complaints/${id}/status`, formData, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};
