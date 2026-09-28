import mongoose from 'mongoose';
import { SavedDoctor, SavedHospital, Patient, Doctor, Hospital } from '../models/index.js';

/**
 * @desc    Get all saved doctors for the logged-in patient
 * @route   GET /api/saved-doctors
 * @access  Private (Patient)
 */
export const getSavedDoctors = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const saved = await SavedDoctor.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'fullName email phone' },
          { path: 'specialization', select: 'name category icon' },
          { path: 'hospital', select: 'name address city rating image' },
        ],
      });

    res.status(200).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a doctor to patient's bookmarks
 * @route   POST /api/saved-doctors
 * @access  Private (Patient)
 */
export const saveDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId is required.' });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const saved = await SavedDoctor.findOneAndUpdate(
      { patient: patient._id, doctor: doctorId },
      { patient: patient._id, doctor: doctorId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Doctor saved successfully.',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a saved doctor (by SavedDoctor _id or doctor ID)
 * @route   DELETE /api/saved-doctors/:id
 * @access  Private (Patient)
 */
export const removeSavedDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const isId = mongoose.Types.ObjectId.isValid(id);
    if (!isId) {
      return res.status(400).json({ success: false, message: 'Invalid ID provided.' });
    }

    const deleted = await SavedDoctor.findOneAndDelete({
      patient: patient._id,
      $or: [{ _id: id }, { doctor: id }],
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved doctor entry not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor removed from saved list.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved hospitals for the logged-in patient
 * @route   GET /api/saved-hospitals
 * @access  Private (Patient)
 */
export const getSavedHospitals = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const saved = await SavedHospital.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .populate('hospital');

    res.status(200).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a hospital to patient's bookmarks
 * @route   POST /api/saved-hospitals
 * @access  Private (Patient)
 */
export const saveHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.body;
    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'hospitalId is required.' });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const saved = await SavedHospital.findOneAndUpdate(
      { patient: patient._id, hospital: hospitalId },
      { patient: patient._id, hospital: hospitalId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Hospital saved successfully.',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a saved hospital (by SavedHospital _id or hospital ID)
 * @route   DELETE /api/saved-hospitals/:id
 * @access  Private (Patient)
 */
export const removeSavedHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const isId = mongoose.Types.ObjectId.isValid(id);
    if (!isId) {
      return res.status(400).json({ success: false, message: 'Invalid ID provided.' });
    }

    const deleted = await SavedHospital.findOneAndDelete({
      patient: patient._id,
      $or: [{ _id: id }, { hospital: id }],
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved hospital entry not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hospital removed from saved list.',
    });
  } catch (error) {
    next(error);
  }
};
