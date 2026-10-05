import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctorController.js';
import { validateDoctorQuery, validateObjectId } from '../validators/discoveryValidator.js';

const router = express.Router();

router.get('/', validateDoctorQuery, getDoctors);
router.get('/:id', validateObjectId('id', 'Doctor'), getDoctorById);

export default router;
