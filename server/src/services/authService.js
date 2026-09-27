import { User, Patient, Doctor, Specialization, Availability } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';

export const registerPatient = async (data) => {
  const {
    fullName,
    email,
    phone,
    password,
    age,
    gender,
    preferredLanguage = 'en',
    location = {},
    medicalHistorySummary = '',
  } = data;

  // Check for duplicate account
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Create User with enforced role = 'patient' (Admin creation forbidden through public register)
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
    role: 'patient',
    isActive: true,
  });

  // Create associated Patient profile
  const patient = await Patient.create({
    user: user._id,
    age: parseInt(age, 10),
    gender,
    preferredLanguage,
    location: {
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      pincode: location.pincode || '',
      latitude: location.latitude || null,
      longitude: location.longitude || null,
    },
    medicalHistorySummary,
  });

  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      patientId: patient._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      preferredLanguage: patient.preferredLanguage,
    },
  };
};

export const registerDoctor = async (data) => {
  const {
    fullName,
    email,
    phone,
    password,
    qualification,
    specialization,
    experience,
    hospital,
    hospitalName = '',
    consultationFee,
    languages = ['English', 'Tamil'],
    bio = '',
  } = data;

  // Check for duplicate email
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Create User with enforced role = 'doctor'
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
    role: 'doctor',
    isActive: true,
  });

  // Check or link specialization
  let specDoc = null;
  if (specialization) {
    specDoc = await Specialization.findOne({
      $or: [
        { _id: specialization.match(/^[0-9a-fA-F]{24}$/) ? specialization : null },
        { name: new RegExp(`^${specialization.trim()}$`, 'i') },
      ],
    });
  }

  const specialtyName = specDoc ? specDoc.name : (specialization || 'General Medicine');

  // Create Doctor Profile with initial verificationStatus: 'pending'
  const doctor = await Doctor.create({
    user: user._id,
    qualification: qualification.trim(),
    specialization: specDoc ? specDoc._id : null,
    specialtyName,
    experience: parseInt(experience, 10),
    hospital: hospital && hospital.match(/^[0-9a-fA-F]{24}$/) ? hospital : null,
    hospitalName: hospitalName.trim(),
    consultationFee: parseFloat(consultationFee),
    languages: Array.isArray(languages) ? languages : [languages],
    bio: bio.trim(),
    verificationStatus: 'pending', // Requires admin verification before public appearance
    isAvailable: true,
  });

  // Create baseline availability
  await Availability.create({
    doctor: doctor._id,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '17:00' },
    breakTime: { start: '13:00', end: '14:00' },
    slotDurationMinutes: 30,
  });

  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      doctorId: doctor._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialtyName: doctor.specialtyName,
      verificationStatus: doctor.verificationStatus,
    },
    message: 'Doctor account registered successfully. Verification is currently pending admin approval.',
  };
};

export const loginUser = async ({ email, password }) => {
  // Find user by email and explicitly include password field
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Compare hashed password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  // Role specific profile details
  let profile = {};
  if (user.role === 'patient') {
    const patient = await Patient.findOne({ user: user._id });
    if (patient) {
      profile = {
        patientId: patient._id,
        age: patient.age,
        gender: patient.gender,
        preferredLanguage: patient.preferredLanguage,
        location: patient.location,
      };
    }
  } else if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: user._id });
    if (doctor) {
      profile = {
        doctorId: doctor._id,
        qualification: doctor.qualification,
        specialtyName: doctor.specialtyName,
        experience: doctor.experience,
        hospitalName: doctor.hospitalName,
        verificationStatus: doctor.verificationStatus,
        rating: doctor.rating,
      };
    }
  }

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...profile,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated.');
    error.statusCode = 403;
    throw error;
  }

  let profile = {};
  if (user.role === 'patient') {
    const patient = await Patient.findOne({ user: user._id });
    if (patient) {
      profile = {
        patientId: patient._id,
        age: patient.age,
        gender: patient.gender,
        preferredLanguage: patient.preferredLanguage,
        location: patient.location,
      };
    }
  } else if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: user._id });
    if (doctor) {
      profile = {
        doctorId: doctor._id,
        qualification: doctor.qualification,
        specialtyName: doctor.specialtyName,
        experience: doctor.experience,
        hospitalName: doctor.hospitalName,
        verificationStatus: doctor.verificationStatus,
        rating: doctor.rating,
      };
    }
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    ...profile,
  };
};
