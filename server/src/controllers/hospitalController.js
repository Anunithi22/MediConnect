import * as hospitalSearchService from '../services/hospitalSearchService.js';

/**
 * @desc    Search and filter hospitals
 * @route   GET /api/hospitals
 * @access  Public
 */
export const getHospitals = async (req, res, next) => {
  try {
    const result = await hospitalSearchService.searchHospitals(req.query);

    if (result.data.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: result.pagination,
        message: 'No hospitals found matching your search criteria.',
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
 * @desc    Get hospital details by ID
 * @route   GET /api/hospitals/:id
 * @access  Public
 */
export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await hospitalSearchService.getHospitalById(req.params.id);
    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctors practicing at a hospital
 * @route   GET /api/hospitals/:id/doctors
 * @access  Public
 */
export const getHospitalDoctors = async (req, res, next) => {
  try {
    const result = await hospitalSearchService.getHospitalDoctors(req.params.id, req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
