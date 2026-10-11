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
        locationSearch: result.locationSearch,
        message: 'No hospitals found matching your search criteria.',
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      locationSearch: result.locationSearch,
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
    const hospital = await hospitalSearchService.getHospitalById(req.params.id, req.query);
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

/**
 * @desc    Compare 2 to 3 hospitals side-by-side
 * @route   GET /api/hospitals/compare?ids=id1,id2,id3
 * @access  Public
 */
export const compareHospitals = async (req, res, next) => {
  try {
    const rawIds = req.query.ids;
    const ids = Array.isArray(rawIds)
      ? rawIds
      : (typeof rawIds === 'string' ? rawIds.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const hospitals = await hospitalSearchService.compareHospitals(ids);
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

