import * as specializationService from '../services/specializationService.js';

/**
 * @desc    Get all medical specializations with optional search
 * @route   GET /api/specializations
 * @access  Public
 */
export const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await specializationService.getAllSpecializations(req.query);
    res.status(200).json({
      success: true,
      count: specializations.length,
      data: specializations,
    });
  } catch (error) {
    next(error);
  }
};
