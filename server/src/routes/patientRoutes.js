import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getProfile,
  updateProfile,
  getDashboardSummary,
} from '../controllers/patientController.js';
import { validateUpdateProfile } from '../validators/patientValidator.js';

const router = express.Router();

// All patient routes require authentication and patient role
router.use(protect, requireRole('patient'));

router.get('/me', getProfile);
router.patch('/me', validateUpdateProfile, updateProfile);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
