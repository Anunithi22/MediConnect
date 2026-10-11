import api from './api';

export const discoveryService = {
  // Doctors
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  getDoctorById: async (id, params = {}) => {
    const res = await api.get(`/doctors/${id}`, { params });
    return res.data;
  },

  compareDoctors: async (ids) => {
    const paramIds = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/doctors/compare', { params: { ids: paramIds } });
    return res.data;
  },

  // Hospitals
  getHospitals: async (params = {}) => {
    const res = await api.get('/hospitals', { params });
    return res.data;
  },

  getHospitalById: async (id, params = {}) => {
    const res = await api.get(`/hospitals/${id}`, { params });
    return res.data;
  },

  getHospitalDoctors: async (hospitalId, params = {}) => {
    const res = await api.get(`/hospitals/${hospitalId}/doctors`, { params });
    return res.data;
  },

  compareHospitals: async (ids) => {
    const paramIds = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/hospitals/compare', { params: { ids: paramIds } });
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
