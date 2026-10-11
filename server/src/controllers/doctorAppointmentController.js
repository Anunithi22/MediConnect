import * as appointmentService from '../services/appointmentService.js';

/**
 * @desc    Get all appointments assigned to the logged-in doctor
 * @route   GET /api/doctor/appointments
 * @access  Private (Doctor only)
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, date, page, limit } = req.query;

    const result = await appointmentService.getDoctorAppointments({
      doctorUserId: req.user._id,
      status,
      date,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status by doctor (confirm, complete, no-show, cancel)
 * @route   PATCH /api/doctor/appointments/:id/status
 * @access  Private (Doctor only)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const updated = await appointmentService.updateDoctorAppointmentStatus({
      doctorUserId: req.user._id,
      appointmentId: id,
      status,
      cancellationReason,
    });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
