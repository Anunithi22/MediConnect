import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  validatePatientRegister,
  validateDoctorRegister,
  validateLogin,
} from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Public Authentication Routes
router.post('/register', validatePatientRegister, authController.registerPatient);
router.post('/register/doctor', validateDoctorRegister, authController.registerDoctor);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);

// Protected Authentication Routes
router.get('/me', protect, authController.getMe);

// Verification and Testing Routes for Role-Based Authorization
router.get('/test/patient-only', protect, requireRole('patient'), authController.testPatientOnly);
router.get('/test/doctor-only', protect, requireRole('doctor'), authController.testDoctorOnly);
router.get('/test/admin-only', protect, requireRole('admin'), authController.testAdminOnly);

export default router;
