import express from 'express';
import {
  getHospitals,
  getHospitalById,
  getHospitalDoctors,
} from '../controllers/hospitalController.js';
import {
  validateHospitalQuery,
  validateDoctorQuery,
  validateObjectId,
} from '../validators/discoveryValidator.js';

const router = express.Router();

router.get('/', validateHospitalQuery, getHospitals);
router.get('/:id', validateObjectId('id', 'Hospital'), getHospitalById);
router.get('/:id/doctors', validateObjectId('id', 'Hospital'), validateDoctorQuery, getHospitalDoctors);

export default router;
