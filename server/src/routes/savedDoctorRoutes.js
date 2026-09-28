import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getSavedDoctors,
  saveDoctor,
  removeSavedDoctor,
} from '../controllers/savedController.js';

const router = express.Router();

router.use(protect, requireRole('patient'));

router.get('/', getSavedDoctors);
router.post('/', saveDoctor);
router.delete('/:id', removeSavedDoctor);

export default router;
