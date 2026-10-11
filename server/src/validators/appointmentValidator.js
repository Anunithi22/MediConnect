import mongoose from 'mongoose';

/**
 * Validate query params for available slots
 */
export const validateAvailableSlotsQuery = (req, res, next) => {
  const { doctorId, date, mode } = req.query;

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: 'doctorId query parameter is required',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid doctorId format. Must be a valid 24-character hexadecimal ObjectId',
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'date query parameter is required (format: YYYY-MM-DD)',
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'date format must be YYYY-MM-DD',
    });
  }

  if (mode && !['In-person', 'Online'].includes(mode)) {
    return res.status(400).json({
      success: false,
      message: 'mode must be either "In-person" or "Online"',
    });
  }

  next();
};

/**
 * Validate body for booking creation
 */
export const validateCreateBooking = (req, res, next) => {
  const { doctorId, date, timeSlot, consultationMode, reason } = req.body;

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: 'doctorId is required',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid doctorId format',
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'date is required (format: YYYY-MM-DD)',
    });
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date value',
    });
  }

  if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.trim()) {
    return res.status(400).json({
      success: false,
      message: 'timeSlot is required (e.g. "09:00 AM")',
    });
  }

  if (consultationMode && !['In-person', 'Online'].includes(consultationMode)) {
    return res.status(400).json({
      success: false,
      message: 'consultationMode must be either "In-person" or "Online"',
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Reason for consultation is required (minimum 3 characters)',
    });
  }

  if (reason.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Reason for consultation cannot exceed 500 characters',
    });
  }

  next();
};

/**
 * Validate body for appointment rescheduling
 */
export const validateReschedule = (req, res, next) => {
  const { newDate, newTimeSlot, newConsultationMode } = req.body;

  if (!newDate) {
    return res.status(400).json({
      success: false,
      message: 'newDate is required (format: YYYY-MM-DD)',
    });
  }

  const d = new Date(newDate);
  if (isNaN(d.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid newDate value',
    });
  }

  if (!newTimeSlot || typeof newTimeSlot !== 'string' || !newTimeSlot.trim()) {
    return res.status(400).json({
      success: false,
      message: 'newTimeSlot is required',
    });
  }

  if (newConsultationMode && !['In-person', 'Online'].includes(newConsultationMode)) {
    return res.status(400).json({
      success: false,
      message: 'newConsultationMode must be either "In-person" or "Online"',
    });
  }

  next();
};

/**
 * Validate doctor appointment status update
 */
export const validateDoctorStatusUpdate = (req, res, next) => {
  const { status, cancellationReason } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'status is required',
    });
  }

  const allowed = ['confirmed', 'completed', 'cancelled', 'no-show'];
  if (!allowed.includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid status "${status}". Allowed values: ${allowed.join(', ')}`,
    });
  }

  if (status.toLowerCase() === 'cancelled') {
    if (!cancellationReason || cancellationReason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'cancellationReason is required when cancelling an appointment (minimum 3 characters)',
      });
    }
  }

  next();
};
