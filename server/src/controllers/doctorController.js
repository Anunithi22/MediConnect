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
        locationSearch: result.locationSearch,
        message: 'No doctors found matching your search criteria.',
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
 * @desc    Get single doctor profile by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorSearchService.getDoctorById(req.params.id, req.user, req.query);
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare 2 to 3 doctors side-by-side
 * @route   GET /api/doctors/compare?ids=id1,id2,id3
 * @access  Public
 */
export const compareDoctors = async (req, res, next) => {
  try {
    const rawIds = req.query.ids;
    const ids = Array.isArray(rawIds)
      ? rawIds
      : (typeof rawIds === 'string' ? rawIds.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const doctors = await doctorSearchService.compareDoctors(ids, req.user);
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

