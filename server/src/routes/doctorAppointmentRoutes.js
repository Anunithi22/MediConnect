import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from '../controllers/doctorAppointmentController.js';
import { validateDoctorStatusUpdate } from '../validators/appointmentValidator.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('doctor'));

// GET /api/doctor/appointments
router.get('/', getDoctorAppointments);

// PATCH /api/doctor/appointments/:id/status
router.patch('/:id/status', validateDoctorStatusUpdate, updateAppointmentStatus);

export default router;
