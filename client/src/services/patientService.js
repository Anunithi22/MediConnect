import api from './api';

export const patientService = {
  // Profile
  getProfile: async () => {
    const res = await api.get('/patients/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/patients/me', data);
    return res.data;
  },

  getDashboardSummary: async () => {
    const res = await api.get('/patients/dashboard-summary');
    return res.data;
  },

  // Appointments
  getMyAppointments: async (status = '') => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const res = await api.get(`/appointments/my${params}`);
    return res.data;
  },

  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  cancelAppointment: async (id, reason = 'Cancelled by patient') => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  // Search History
  getSearchHistory: async () => {
    const res = await api.get('/search-history');
    return res.data;
  },

  addSearchHistory: async (data) => {
    const res = await api.post('/search-history', data);
    return res.data;
  },

  deleteSearchHistoryItem: async (id) => {
    const res = await api.delete(`/search-history/${id}`);
    return res.data;
  },

  clearSearchHistory: async () => {
    const res = await api.delete('/search-history');
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  // Saved Doctors & Hospitals
  getSavedDoctors: async () => {
    const res = await api.get('/saved-doctors');
    return res.data;
  },

  saveDoctor: async (doctorId) => {
    const res = await api.post('/saved-doctors', { doctorId });
    return res.data;
  },

  removeSavedDoctor: async (id) => {
    const res = await api.delete(`/saved-doctors/${id}`);
    return res.data;
  },

  getSavedHospitals: async () => {
    const res = await api.get('/saved-hospitals');
    return res.data;
  },

  saveHospital: async (hospitalId) => {
    const res = await api.post('/saved-hospitals', { hospitalId });
    return res.data;
  },

  removeSavedHospital: async (id) => {
    const res = await api.delete(`/saved-hospitals/${id}`);
    return res.data;
  },

  // Reviews
  getMyReviews: async () => {
    const res = await api.get('/reviews/my');
    return res.data;
  },
};

export default patientService;
