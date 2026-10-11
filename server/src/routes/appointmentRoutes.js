import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import {
  validateAvailableSlotsQuery,
  validateCreateBooking,
  validateReschedule,
} from '../validators/appointmentValidator.js';

const router = express.Router();

// 1. Public / Semi-Public: Check doctor available slots
router.get('/available-slots', validateAvailableSlotsQuery, getAvailableSlots);

// 2. Protected Routes
router.use(protect);

// Patient appointment list
router.get('/my', requireRole('patient'), getMyAppointments);

// Create new appointment (patient only)
router.post('/', requireRole('patient'), validateCreateBooking, createAppointment);

// Single appointment details (patient, doctor, admin)
router.get('/:id', getAppointmentById);

// Reschedule appointment (patient only)
router.patch('/:id/reschedule', requireRole('patient'), validateReschedule, rescheduleAppointment);

// Cancel appointment (patient or doctor)
router.patch('/:id/cancel', cancelAppointment);

export default router;
