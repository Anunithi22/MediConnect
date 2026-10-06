import express from 'express';
import { getDoctors, getDoctorById, compareDoctors } from '../controllers/doctorController.js';
import {
  validateDoctorQuery,
  validateObjectId,
  validateCompareQuery,
} from '../validators/discoveryValidator.js';

const router = express.Router();

router.get('/', validateDoctorQuery, getDoctors);
router.get('/compare', validateCompareQuery, compareDoctors);
router.get('/:id', validateObjectId('id', 'Doctor'), getDoctorById);

export default router;
