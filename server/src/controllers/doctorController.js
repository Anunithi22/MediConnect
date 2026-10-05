import * as doctorSearchService from '../services/doctorSearchService.js';

/**
 * @desc    Search and filter approved doctors
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res, next) => {
  try {
    const result = await doctorSearchService.searchDoctors(req.query, req.user);

    if (result.data.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: result.pagination,
        message: 'No doctors found matching your search criteria.',
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor profile by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorSearchService.getDoctorById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
