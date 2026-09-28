import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getSearchHistory,
  addSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
} from '../controllers/searchHistoryController.js';
import { validateSearchHistory } from '../validators/patientValidator.js';

const router = express.Router();

router.use(protect, requireRole('patient'));

router.get('/', getSearchHistory);
router.post('/', validateSearchHistory, addSearchHistory);
router.delete('/:id', deleteSearchHistoryItem);
router.delete('/', clearSearchHistory);

export default router;
