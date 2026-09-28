import { Review, Patient } from '../models/index.js';

/**
 * @desc    Get all reviews authored by the logged-in patient
 * @route   GET /api/reviews/my
 * @access  Private (Patient)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ patientUser: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'fullName email' },
          { path: 'specialization', select: 'name category' },
        ],
      })
      .populate('hospital', 'name address city')
      .populate('appointment', 'bookingId date timeSlot reason');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
