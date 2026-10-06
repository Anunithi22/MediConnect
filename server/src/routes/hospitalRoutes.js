import express from 'express';
import {
  getHospitals,
  getHospitalById,
  getHospitalDoctors,
  compareHospitals,
} from '../controllers/hospitalController.js';
import {
  validateHospitalQuery,
  validateDoctorQuery,
  validateObjectId,
  validateCompareQuery,
} from '../validators/discoveryValidator.js';

const router = express.Router();

router.get('/', validateHospitalQuery, getHospitals);
router.get('/compare', validateCompareQuery, compareHospitals);
router.get('/:id', validateObjectId('id', 'Hospital'), getHospitalById);
router.get('/:id/doctors', validateObjectId('id', 'Hospital'), validateDoctorQuery, getHospitalDoctors);

export default router;
