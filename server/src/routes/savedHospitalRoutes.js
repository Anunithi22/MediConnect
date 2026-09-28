import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getSavedHospitals,
  saveHospital,
  removeSavedHospital,
} from '../controllers/savedController.js';

const router = express.Router();

router.use(protect, requireRole('patient'));

router.get('/', getSavedHospitals);
router.post('/', saveHospital);
router.delete('/:id', removeSavedHospital);

export default router;
