import api from './api';

export const discoveryService = {
  // Doctors
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  // Hospitals
  getHospitals: async (params = {}) => {
    const res = await api.get('/hospitals', { params });
    return res.data;
  },

  getHospitalById: async (id) => {
    const res = await api.get(`/hospitals/${id}`);
    return res.data;
  },

  getHospitalDoctors: async (hospitalId, params = {}) => {
    const res = await api.get(`/hospitals/${hospitalId}/doctors`, { params });
    return res.data;
  },

  // Specializations
  getSpecializations: async (search = '') => {
    const params = search ? { search } : {};
    const res = await api.get('/specializations', { params });
    return res.data;
  },
};

export default discoveryService;
