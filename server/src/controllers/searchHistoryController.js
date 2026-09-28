import { SearchHistory, Patient } from '../models/index.js';

/**
 * @desc    Get patient search history
 * @route   GET /api/search-history
 * @access  Private (Patient)
 */
export const getSearchHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const history = await SearchHistory.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a search query to history
 * @route   POST /api/search-history
 * @access  Private (Patient)
 */
export const addSearchHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const { query, specialty = '', location = '' } = req.body;

    const newEntry = await SearchHistory.create({
      patient: patient._id,
      query: query.trim(),
      specialty: specialty.trim(),
      location: location.trim(),
    });

    res.status(201).json({
      success: true,
      data: newEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a single search history entry
 * @route   DELETE /api/search-history/:id
 * @access  Private (Patient)
 */
export const deleteSearchHistoryItem = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const item = await SearchHistory.findOne({
      _id: req.params.id,
      patient: patient._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Search history entry not found or unauthorized.',
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Search history entry removed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all search history for patient
 * @route   DELETE /api/search-history
 * @access  Private (Patient)
 */
export const clearSearchHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    await SearchHistory.deleteMany({ patient: patient._id });

    res.status(200).json({
      success: true,
      message: 'All search history cleared.',
    });
  } catch (error) {
    next(error);
  }
};
