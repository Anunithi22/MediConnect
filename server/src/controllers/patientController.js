import { Patient, User, Appointment, SavedDoctor, SavedHospital, Notification, SearchHistory } from '../models/index.js';

/**
 * @desc    Get current logged-in patient's full profile
 * @route   GET /api/patients/me
 * @access  Private (Patient only)
 */
export const getProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email phone role avatar createdAt'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found for this account.',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged-in patient's profile
 * @route   PATCH /api/patients/me
 * @access  Private (Patient only)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found for this account.',
      });
    }

    const {
      fullName,
      phone,
      age,
      gender,
      preferredLanguage,
      address,
      city,
      state,
      pincode,
      medicalHistorySummary,
    } = req.body;

    // Update User model fields if provided
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName.trim();
    if (phone) userUpdates.phone = phone.trim();

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates, { runValidators: true });
    }

    // Update Patient specific fields
    if (age !== undefined) patient.age = Number(age);
    if (gender !== undefined) patient.gender = gender;
    if (preferredLanguage !== undefined) patient.preferredLanguage = preferredLanguage;
    if (medicalHistorySummary !== undefined) patient.medicalHistorySummary = medicalHistorySummary.trim();

    if (!patient.location) {
      patient.location = {};
    }
    if (address !== undefined) patient.location.address = address.trim();
    if (city !== undefined) patient.location.city = city.trim();
    if (state !== undefined) patient.location.state = state.trim();
    if (pincode !== undefined) patient.location.pincode = pincode.trim();

    await patient.save();

    const updatedProfile = await Patient.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email phone role avatar createdAt'
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard summary statistics & shortcuts for patient
 * @route   GET /api/patients/dashboard-summary
 * @access  Private (Patient only)
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.',
      });
    }

    const [
      upcomingAppointment,
      recentAppointments,
      totalAppointments,
      savedDoctorsCount,
      savedHospitalsCount,
      unreadNotificationsCount,
      recentSearchHistory,
    ] = await Promise.all([
      // Next confirmed or pending upcoming appointment
      Appointment.findOne({
        patient: patient._id,
        status: { $in: ['confirmed', 'pending'] },
        date: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      })
        .sort({ date: 1 })
        .populate({
          path: 'doctor',
          populate: [
            { path: 'user', select: 'fullName email phone' },
            { path: 'specialization', select: 'name category icon' },
          ],
        })
        .populate('hospital', 'name address city state phone pincode rating'),

      // Recent 4 appointments
      Appointment.find({ patient: patient._id })
        .sort({ date: -1 })
        .limit(4)
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'fullName' },
        })
        .populate('hospital', 'name address city'),

      Appointment.countDocuments({ patient: patient._id }),
      SavedDoctor.countDocuments({ patient: patient._id }),
      SavedHospital.countDocuments({ patient: patient._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      SearchHistory.find({ patient: patient._id }).sort({ createdAt: -1 }).limit(3),
    ]);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          age: patient.age,
          gender: patient.gender,
          preferredLanguage: patient.preferredLanguage,
          location: patient.location,
          medicalHistorySummary: patient.medicalHistorySummary,
        },
        stats: {
          totalAppointments,
          savedDoctorsCount,
          savedHospitalsCount,
          unreadNotificationsCount,
        },
        upcomingAppointment,
        recentAppointments,
        recentSearchHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
