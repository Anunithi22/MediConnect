import express from 'express';
import { getSpecializations } from '../controllers/specializationController.js';
import { validateSpecializationQuery } from '../validators/discoveryValidator.js';

const router = express.Router();

router.get('/', validateSpecializationQuery, getSpecializations);

export default router;
