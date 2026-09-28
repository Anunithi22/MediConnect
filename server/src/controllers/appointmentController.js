import mongoose from 'mongoose';
import { Appointment, Review, Notification, Patient } from '../models/index.js';

/**
 * @desc    Get all appointments for the logged-in patient
 * @route   GET /api/appointments/my
 * @access  Private (Patient)
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = { patientUser: req.user._id };

    const now = new Date();
    // 2 hours buffer for "today's" ongoing appointments
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
    } else if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(Number(limit))
        .populate({
          path: 'doctor',
          populate: [
            { path: 'user', select: 'fullName email phone' },
            { path: 'specialization', select: 'name category icon' },
          ],
        })
        .populate('hospital', 'name address city state phone rating image'),
      Appointment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single appointment by ID or bookingId with security check
 * @route   GET /api/appointments/:id
 * @access  Private (Patient/Doctor/Admin)
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by MongoDB _id or human-readable bookingId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { bookingId: id };

    const appointment = await Appointment.findOne(filter)
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'fullName email phone' },
          { path: 'specialization', select: 'name category icon' },
        ],
      })
      .populate('hospital', 'name address city state pincode phone rating emergencyContact')
      .populate('patient', 'age gender location preferredLanguage medicalHistorySummary')
      .populate('patientUser', 'fullName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Security Check: Patient can only view their own appointments
    if (
      req.user.role === 'patient' &&
      appointment.patientUser._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this appointment.',
      });
    }

    // Check if review exists for this appointment
    const review = await Review.findOne({ appointment: appointment._id });

    res.status(200).json({
      success: true,
      data: {
        ...appointment.toObject(),
        review: review || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an upcoming appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (Patient only)
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by patient' } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { bookingId: id };

    const appointment = await Appointment.findOne(filter);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Security Ownership check
    if (appointment.patientUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot cancel appointments belonging to other patients.',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled.',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason.trim();
    await appointment.save();

    // Create notification for patient
    await Notification.create({
      recipient: req.user._id,
      title: 'Appointment Cancelled',
      message: `Your appointment ${appointment.bookingId} has been cancelled.`,
      type: 'appointment_cancelled',
      relatedId: appointment._id,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
