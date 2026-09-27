import api from './api';

export const registerPatient = async (patientData) => {
  const response = await api.post('/auth/register', patientData);
  return response.data;
};

export const registerDoctor = async (doctorData) => {
  const response = await api.post('/auth/register/doctor', doctorData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Non-blocking logout call
    console.warn('Logout endpoint call failed:', err.message);
  } finally {
    localStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_user');
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default {
  registerPatient,
  registerDoctor,
  login,
  logout,
  getCurrentUser,
};
