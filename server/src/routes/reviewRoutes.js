import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getMyReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.use(protect, requireRole('patient'));

router.get('/my', getMyReviews);

export default router;
