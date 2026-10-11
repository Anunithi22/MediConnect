import api from './api';

/**
 * Front‑end service wrapper for the Phase 9 appointment endpoints.
 * All calls return the raw `data` payload from the server response for convenience.
 */
export const appointmentService = {
  // ------- Patient side -------
  /** Get available slots for a doctor on a specific date and mode */
  getAvailableSlots: async (doctorId, date, mode) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (mode) params.append('mode', mode);
    const res = await api.get(`/appointments/available-slots?doctorId=${doctorId}&${params.toString()}`);
    return res.data;
  },

  /** Create a new appointment (patient) */
  createAppointment: async (payload) => {
    const res = await api.post('/appointments', payload);
    return res.data;
  },

  /** Patient – list own appointments (status filter optional) */
  getMyAppointments: async (status = '') => {
    const suffix = status && status !== 'all' ? `?status=${status}` : '';
    const res = await api.get(`/appointments/my${suffix}`);
    return res.data;
  },

  /** Patient – fetch a single appointment */
  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  /** Patient – cancel an appointment */
  cancelAppointment: async (id, reason = 'Cancelled by patient') => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  /** Patient – reschedule an appointment */
  rescheduleAppointment: async (id, payload) => {
    // payload: { date, timeSlot, consultationMode, reason }
    const res = await api.patch(`/appointments/${id}/reschedule`, payload);
    return res.data;
  },

  // ------- Doctor side -------
  /** Doctor – list own appointments (filter by date/status) */
  getDoctorAppointments: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const endpoint = qs ? `/doctor/appointments?${qs}` : '/doctor/appointments';
    const res = await api.get(endpoint);
    return res.data;
  },

  /** Doctor – update status for an appointment */
  updateDoctorAppointmentStatus: async (appointmentId, payload) => {
    // payload: { status, cancellationReason? }
    const res = await api.patch(`/doctor/appointments/${appointmentId}/status`, payload);
    return res.data;
  },
};

export default appointmentService;
