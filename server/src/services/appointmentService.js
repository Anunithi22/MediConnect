import mongoose from 'mongoose';
import {
  Appointment,
  Doctor,
  Patient,
  Hospital,
  Notification,
  User,
} from '../models/index.js';
import * as availabilityService from './availabilityService.js';

/**
 * Generate unique booking ID: APT-YYYY-XXXXX
 */
export const generateBookingId = async () => {
  const currentYear = new Date().getFullYear();
  let bookingId = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    bookingId = `APT-${currentYear}-${randomNum}`;
    const existing = await Appointment.findOne({ bookingId }).select('_id');
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    bookingId = `APT-${currentYear}-${Date.now().toString().slice(-5)}`;
  }

  return bookingId;
};

/**
 * Create a new appointment booking for a patient
 */
export const createBooking = async ({
  patientUserId,
  doctorId,
  date,
  timeSlot,
  consultationMode = 'In-person',
  reason,
}) => {
  // 1. Verify Patient
  const patient = await Patient.findOne({ user: patientUserId });
  if (!patient) {
    const error = new Error('Patient profile not found. Only registered patients can book appointments.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Verify Doctor
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    const error = new Error('Invalid doctor ID format');
    error.statusCode = 400;
    throw error;
  }

  const doctor = await Doctor.findById(doctorId)
    .populate('user', 'fullName email phone')
    .populate('hospital', 'name address city phone isActive');

  if (!doctor) {
    const error = new Error('Doctor not found');
    error.statusCode = 404;
    throw error;
  }

  if (doctor.verificationStatus !== 'approved') {
    const error = new Error('Doctor is not approved for public appointments');
    error.statusCode = 400;
    throw error;
  }

  if (doctor.isAvailable === false) {
    const error = new Error('Doctor is currently unavailable for bookings');
    error.statusCode = 400;
    throw error;
  }

  // 3. Verify Mode
  const allowedModes = doctor.consultationModes || ['In-person', 'Online'];
  if (consultationMode && !allowedModes.includes(consultationMode)) {
    const error = new Error(
      `Doctor does not support "${consultationMode}" consultations. Supported: ${allowedModes.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Validate Reason
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    const error = new Error('Please provide a reason for consultation (minimum 3 characters)');
    error.statusCode = 400;
    throw error;
  }

  if (reason.trim().length > 500) {
    const error = new Error('Consultation reason cannot exceed 500 characters');
    error.statusCode = 400;
    throw error;
  }

  // 5. Query Availability & Verify Slot
  const slotData = await availabilityService.getDoctorAvailableSlots({
    doctorId: doctor._id,
    date,
    mode: consultationMode,
  });

  if (!slotData.isAvailable) {
    const error = new Error(slotData.reason || 'Doctor is not available on this date');
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlotInput = timeSlot ? timeSlot.trim() : '';
  const matchedSlot = slotData.slots.find(
    (s) =>
      s.timeSlot.toLowerCase() === normalizedSlotInput.toLowerCase() ||
      s.startTime === normalizedSlotInput ||
      s.interval.toLowerCase() === normalizedSlotInput.toLowerCase()
  );

  if (!matchedSlot) {
    const error = new Error(`Time slot "${timeSlot}" does not exist in doctor's schedule`);
    error.statusCode = 400;
    throw error;
  }

  if (matchedSlot.isPast) {
    const error = new Error('Cannot book a time slot in the past');
    error.statusCode = 400;
    throw error;
  }

  if (matchedSlot.booked || !matchedSlot.isAvailable) {
    const error = new Error('This time slot is already booked. Please choose another slot.');
    error.statusCode = 409;
    throw error;
  }

  // 6. Concurrency-Safe Date & Slot Preparation
  const targetDate = new Date(date);
  const [startH, startM] = (matchedSlot.startTime || '09:00').split(':').map(Number);
  targetDate.setHours(startH, startM, 0, 0);

  // Pre-check for overlapping active appointment
  const existingConflict = await Appointment.findOne({
    doctor: doctor._id,
    date: targetDate,
    timeSlot: matchedSlot.timeSlot,
    status: { $in: ['confirmed', 'pending'] },
  });

  if (existingConflict) {
    const conflictErr = new Error(
      'This time slot was just reserved by another patient. Please select another slot.'
    );
    conflictErr.statusCode = 409;
    throw conflictErr;
  }

  // Generate Booking ID
  const bookingId = await generateBookingId();

  // 7. Atomic Creation with Partial Unique Index Guard
  let appointment;
  try {
    appointment = await Appointment.create({
      bookingId,
      patient: patient._id,
      patientUser: patientUserId,
      doctor: doctor._id,
      hospital: doctor.hospital?._id || doctor.hospital,
      date: targetDate,
      timeSlot: matchedSlot.timeSlot,
      startTime: matchedSlot.startTime,
      endTime: matchedSlot.endTime,
      consultationMode: consultationMode || 'In-person',
      reason: reason.trim(),
      status: 'confirmed',
      consultationFee: doctor.consultationFee || 0,
    });
  } catch (err) {
    if (err.code === 11000) {
      const conflictErr = new Error(
        'Concurrent booking collision: This slot was just reserved by another patient. Please select another slot.'
      );
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }

  // 8. Notifications
  try {
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Notify patient
    await Notification.create({
      recipient: patientUserId,
      title: 'Appointment Confirmed',
      message: `Your appointment ${bookingId} with Dr. ${doctor.user?.fullName || 'Specialist'} has been confirmed for ${formattedDate} at ${matchedSlot.timeSlot}.`,
      type: 'appointment_confirmed',
      relatedId: appointment._id,
    });

    // Notify doctor
    if (doctor.user?._id) {
      await Notification.create({
        recipient: doctor.user._id,
        title: 'New Appointment Booked',
        message: `New consultation ${bookingId} scheduled for ${formattedDate} at ${matchedSlot.timeSlot}.`,
        type: 'new_appointment',
        relatedId: appointment._id,
      });
    }
  } catch (notifErr) {
    // Non-blocking notification failure
    console.error('[Notification Error]:', notifErr.message);
  }

  // Return populated appointment
  return Appointment.findById(appointment._id)
    .populate({
      path: 'doctor',
      populate: [
        { path: 'user', select: 'fullName email phone' },
        { path: 'specialization', select: 'name icon' },
      ],
    })
    .populate('hospital', 'name address city state phone rating emergencyContact')
    .populate('patient', 'age gender location')
    .populate('patientUser', 'fullName email phone');
};

/**
 * Reschedule an existing upcoming appointment to a new date and slot
 */
export const rescheduleBooking = async ({
  patientUserId,
  appointmentId,
  newDate,
  newTimeSlot,
  newConsultationMode,
}) => {
  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid appointment ID format');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate('doctor')
    .populate('patientUser', 'fullName email phone');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  if (appointment.patientUser._id.toString() !== patientUserId.toString()) {
    const error = new Error('Forbidden. You can only reschedule your own appointments.');
    error.statusCode = 403;
    throw error;
  }

  // Status check: Only upcoming confirmed/pending appointments can be rescheduled
  if (appointment.status === 'completed') {
    const error = new Error('Completed appointments cannot be rescheduled.');
    error.statusCode = 400;
    throw error;
  }

  if (appointment.status === 'cancelled') {
    const error = new Error('Cancelled appointments cannot be rescheduled.');
    error.statusCode = 400;
    throw error;
  }

  // Validate new slot
  const modeToUse = newConsultationMode || appointment.consultationMode || 'In-person';
  const slotData = await availabilityService.getDoctorAvailableSlots({
    doctorId: appointment.doctor._id,
    date: newDate,
    mode: modeToUse,
  });

  if (!slotData.isAvailable) {
    const error = new Error(slotData.reason || 'Doctor is not available on the selected date');
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlot = newTimeSlot ? newTimeSlot.trim() : '';
  const matchedSlot = slotData.slots.find(
    (s) =>
      s.timeSlot.toLowerCase() === normalizedSlot.toLowerCase() ||
      s.startTime === normalizedSlot ||
      s.interval.toLowerCase() === normalizedSlot.toLowerCase()
  );

  if (!matchedSlot) {
    const error = new Error(`Time slot "${newTimeSlot}" does not exist in doctor's schedule`);
    error.statusCode = 400;
    throw error;
  }

  if (matchedSlot.isPast) {
    const error = new Error('Cannot reschedule to a past time slot');
    error.statusCode = 400;
    throw error;
  }

  if (matchedSlot.booked || !matchedSlot.isAvailable) {
    const error = new Error('The selected slot is already booked. Please choose another slot.');
    error.statusCode = 409;
    throw error;
  }

  const targetDate = new Date(newDate);
  const [startH, startM] = (matchedSlot.startTime || '09:00').split(':').map(Number);
  targetDate.setHours(startH, startM, 0, 0);

  // Concurrency check for the new slot
  const conflict = await Appointment.findOne({
    doctor: appointment.doctor._id,
    date: targetDate,
    timeSlot: matchedSlot.timeSlot,
    status: { $in: ['confirmed', 'pending'] },
    _id: { $ne: appointment._id },
  });

  if (conflict) {
    const error = new Error('The selected slot is already booked by another patient.');
    error.statusCode = 409;
    throw error;
  }

  // Update appointment
  appointment.date = targetDate;
  appointment.timeSlot = matchedSlot.timeSlot;
  appointment.startTime = matchedSlot.startTime;
  appointment.endTime = matchedSlot.endTime;
  if (newConsultationMode) {
    appointment.consultationMode = newConsultationMode;
  }
  appointment.status = 'confirmed';

  try {
    await appointment.save();
  } catch (err) {
    if (err.code === 11000) {
      const conflictErr = new Error('Slot collision during reschedule. Please try another slot.');
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }

  // Notifications
  try {
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await Notification.create({
      recipient: patientUserId,
      title: 'Appointment Rescheduled',
      message: `Your appointment ${appointment.bookingId} has been rescheduled to ${formattedDate} at ${matchedSlot.timeSlot}.`,
      type: 'appointment_rescheduled',
      relatedId: appointment._id,
    });

    const doc = await Doctor.findById(appointment.doctor).populate('user');
    if (doc?.user?._id) {
      await Notification.create({
        recipient: doc.user._id,
        title: 'Appointment Rescheduled',
        message: `Appointment ${appointment.bookingId} was rescheduled by patient to ${formattedDate} at ${matchedSlot.timeSlot}.`,
        type: 'appointment_rescheduled',
        relatedId: appointment._id,
      });
    }
  } catch (notifErr) {
    console.error('[Notification Error]:', notifErr.message);
  }

  return Appointment.findById(appointment._id)
    .populate({
      path: 'doctor',
      populate: [
        { path: 'user', select: 'fullName email phone' },
        { path: 'specialization', select: 'name icon' },
      ],
    })
    .populate('hospital', 'name address city state phone')
    .populate('patient', 'age gender location')
    .populate('patientUser', 'fullName email phone');
};

/**
 * Cancel an appointment (Patient, Doctor, or Admin)
 */
export const cancelBooking = async ({
  userId,
  userRole,
  appointmentId,
  reason = 'Cancelled by user request',
}) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);
  const filter = isObjectId ? { _id: appointmentId } : { bookingId: appointmentId };

  const appointment = await Appointment.findOne(filter)
    .populate('doctor')
    .populate('patientUser');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization Check
  if (userRole === 'patient') {
    if (appointment.patientUser._id.toString() !== userId.toString()) {
      const error = new Error('Forbidden. You cannot cancel appointments belonging to other patients.');
      error.statusCode = 403;
      throw error;
    }
  } else if (userRole === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor || appointment.doctor._id.toString() !== doctor._id.toString()) {
      const error = new Error('Forbidden. You can only cancel appointments assigned to your schedule.');
      error.statusCode = 403;
      throw error;
    }
  } else if (userRole !== 'admin') {
    const error = new Error('Forbidden. Unauthorized role.');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status === 'completed') {
    const error = new Error('Completed appointments cannot be cancelled.');
    error.statusCode = 400;
    throw error;
  }

  if (appointment.status === 'cancelled') {
    const error = new Error('This appointment is already cancelled.');
    error.statusCode = 400;
    throw error;
  }

  // Free the slot by marking status as cancelled
  appointment.status = 'cancelled';
  appointment.cancellationReason = reason.trim() || 'Cancelled';
  appointment.cancelledBy = userRole;
  await appointment.save();

  // Notifications
  try {
    if (userRole === 'patient') {
      // Notify doctor
      const doc = await Doctor.findById(appointment.doctor).populate('user');
      if (doc?.user?._id) {
        await Notification.create({
          recipient: doc.user._id,
          title: 'Appointment Cancelled by Patient',
          message: `Appointment ${appointment.bookingId} was cancelled by patient. Reason: ${appointment.cancellationReason}`,
          type: 'appointment_cancelled',
          relatedId: appointment._id,
        });
      }
    } else {
      // Notify patient
      await Notification.create({
        recipient: appointment.patientUser._id,
        title: 'Appointment Cancelled',
        message: `Your appointment ${appointment.bookingId} was cancelled. Reason: ${appointment.cancellationReason}`,
        type: 'appointment_cancelled',
        relatedId: appointment._id,
      });
    }
  } catch (notifErr) {
    console.error('[Notification Error]:', notifErr.message);
  }

  return appointment;
};

/**
 * Get appointments assigned to authenticated doctor
 */
export const getDoctorAppointments = async ({
  doctorUserId,
  status,
  date,
  page = 1,
  limit = 20,
}) => {
  const doctor = await Doctor.findOne({ user: doctorUserId });
  if (!doctor) {
    const error = new Error('Doctor profile not found for this account.');
    error.statusCode = 403;
    throw error;
  }

  const query = { doctor: doctor._id };

  const now = new Date();
  const recentThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  let sortOrder = { date: -1 };

  if (status === 'upcoming') {
    query.date = { $gte: recentThreshold };
    query.status = { $in: ['confirmed', 'pending'] };
    sortOrder = { date: 1 };
  } else if (status === 'completed') {
    query.status = 'completed';
  } else if (status === 'cancelled') {
    query.status = 'cancelled';
  } else if (status === 'no-show') {
    query.status = 'no-show';
  } else if (status === 'pending') {
    query.status = 'pending';
  } else if (status === 'confirmed') {
    query.status = 'confirmed';
  } else if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by specific date if provided
  if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const dStart = new Date(targetDate);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(targetDate);
      dEnd.setHours(23, 59, 59, 999);
      query.date = { ...query.date, $gte: dStart, $lte: dEnd };
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit))
      .populate('patient', 'age gender location medicalHistorySummary')
      .populate('patientUser', 'fullName email phone')
      .populate('hospital', 'name address city phone'),
    Appointment.countDocuments(query),
  ]);

  return {
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: appointments,
  };
};

/**
 * Update doctor appointment status with strict transition rules
 */
export const updateDoctorAppointmentStatus = async ({
  doctorUserId,
  appointmentId,
  status,
  cancellationReason,
}) => {
  const doctor = await Doctor.findOne({ user: doctorUserId });
  if (!doctor) {
    const error = new Error('Doctor profile not found.');
    error.statusCode = 403;
    throw error;
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);
  const filter = isObjectId
    ? { _id: appointmentId, doctor: doctor._id }
    : { bookingId: appointmentId, doctor: doctor._id };

  const appointment = await Appointment.findOne(filter).populate('patientUser');

  if (!appointment) {
    const error = new Error('Appointment not found or not assigned to you.');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = appointment.status;
  const newStatus = status ? status.toLowerCase() : '';

  // Terminal states validation
  if (['completed', 'cancelled', 'no-show'].includes(currentStatus)) {
    const error = new Error(
      `Cannot change status of a ${currentStatus} appointment. Terminal state reached.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Allowed transitions:
  // pending -> confirmed, cancelled
  // confirmed -> completed, no-show, cancelled
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'no-show', 'cancelled'],
  };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    const error = new Error(
      `Invalid status transition from "${currentStatus}" to "${newStatus}". Permitted: ${allowedTransitions[currentStatus]?.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  if (newStatus === 'cancelled') {
    if (!cancellationReason || cancellationReason.trim().length < 3) {
      const error = new Error('A valid cancellation reason is required (minimum 3 characters).');
      error.statusCode = 400;
      throw error;
    }
    appointment.cancellationReason = cancellationReason.trim();
    appointment.cancelledBy = 'doctor';
  }

  appointment.status = newStatus;
  await appointment.save();

  // Notify patient
  try {
    let notifTitle = `Appointment Status Updated`;
    let notifMessage = `Your appointment ${appointment.bookingId} is now marked as ${newStatus}.`;

    if (newStatus === 'confirmed') {
      notifTitle = 'Appointment Confirmed by Doctor';
      notifMessage = `Dr. ${doctor.name || 'Specialist'} has confirmed your appointment ${appointment.bookingId}.`;
    } else if (newStatus === 'completed') {
      notifTitle = 'Consultation Completed';
      notifMessage = `Your consultation ${appointment.bookingId} has been marked completed.`;
    } else if (newStatus === 'cancelled') {
      notifTitle = 'Appointment Cancelled by Doctor';
      notifMessage = `Your appointment ${appointment.bookingId} was cancelled by doctor. Reason: ${appointment.cancellationReason}`;
    }

    await Notification.create({
      recipient: appointment.patientUser._id,
      title: notifTitle,
      message: notifMessage,
      type: newStatus === 'cancelled' ? 'appointment_cancelled' : 'system',
      relatedId: appointment._id,
    });
  } catch (notifErr) {
    console.error('[Notification Error]:', notifErr.message);
  }

  return appointment;
};
