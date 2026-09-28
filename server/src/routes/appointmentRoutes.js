import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', requireRole('patient'), cancelAppointment);

export default router;
