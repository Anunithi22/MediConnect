import mongoose from 'mongoose';
import { Doctor, User, Specialization, Hospital, Availability } from '../models/index.js';

/**
 * Helper to escape regex special characters
 */
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Transform Doctor document into a clean, safe public representation
 */
export const transformPublicDoctor = (doc, availability = null) => {
  if (!doc) return null;

  const user = doc.user || {};
  const spec = doc.specialization || {};
  const hosp = doc.hospital || {};

  return {
    id: doc._id.toString(),
    name: user.fullName || doc.name || 'Medical Specialist',
    email: user.email,
    profileImage: doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    qualification: doc.qualification,
    specialization: typeof spec === 'object' && spec.name ? spec.name : doc.specialtyName,
    specializationId: typeof spec === 'object' && spec._id ? spec._id.toString() : null,
    specialtyName: doc.specialtyName || (typeof spec === 'object' ? spec.name : ''),
    experience: doc.experience || 0,
    hospital: {
      id: typeof hosp === 'object' && hosp._id ? hosp._id.toString() : null,
      name: typeof hosp === 'object' && hosp.name ? hosp.name : doc.hospitalName,
      city: typeof hosp === 'object' ? hosp.city : '',
      address: typeof hosp === 'object' ? hosp.address : '',
      rating: typeof hosp === 'object' ? hosp.rating : null,
      phone: typeof hosp === 'object' ? hosp.phone : '',
      totalBeds: typeof hosp === 'object' ? hosp.totalBeds : undefined,
    },
    rating: doc.rating || 4.8,
    reviewCount: doc.reviewCount || 0,
    consultationFee: doc.consultationFee || 0,
    consultationModes: Array.isArray(doc.consultationModes) && doc.consultationModes.length > 0
      ? doc.consultationModes
      : ['In-person', 'Online'],
    education: Array.isArray(doc.education) && doc.education.length > 0
      ? doc.education
      : [`${doc.qualification || 'MBBS'} - Recognized Medical University`],
    experienceHistory: Array.isArray(doc.experienceHistory) && doc.experienceHistory.length > 0
      ? doc.experienceHistory
      : [`Clinical Consultant at ${typeof hosp === 'object' && hosp.name ? hosp.name : doc.hospitalName || 'Recognized Medical Center'} (${doc.experience || 5} yrs)`],
    schedule: availability
      ? {
          workingDays: availability.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: availability.workingHours || { start: '09:00', end: '17:00' },
          breakTime: availability.breakTime || { start: '13:00', end: '14:00' },
          slotDurationMinutes: availability.slotDurationMinutes || 30,
          summary: `${(availability.workingDays && availability.workingDays.length > 0) ? availability.workingDays[0] + ' - ' + availability.workingDays[availability.workingDays.length - 1] : 'Mon - Sat'} (${availability.workingHours?.start || '09:00'} - ${availability.workingHours?.end || '17:00'})`,
        }
      : {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          workingHours: { start: '09:00', end: '17:00' },
          breakTime: { start: '13:00', end: '14:00' },
          slotDurationMinutes: 30,
          summary: 'Monday - Saturday (09:00 - 17:00)',
        },
    languages: Array.isArray(doc.languages) ? doc.languages : ['English'],
    bio: doc.bio || '',
    services: Array.isArray(doc.services) && doc.services.length > 0
      ? doc.services
      : [`${doc.specialtyName || 'Specialist'} Consultation`, 'Clinical Evaluation', 'Preventive Health Advice'],
    isAvailable: doc.isAvailable !== false,
    verificationStatus: doc.verificationStatus,
    createdAt: doc.createdAt,
  };
};

/**
 * Search and filter doctors
 */
export const searchDoctors = async (queryParams = {}, requestingUser = null) => {
  const {
    page = 1,
    limit = 12,
    search,
    specialization,
    hospital,
    experienceMin,
    experienceMax,
    ratingMin,
    feeMin,
    feeMax,
    language,
    sort = 'recommended',
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  // Base visibility: Public users can only see approved doctors
  const query = {};
  if (!requestingUser || requestingUser.role !== 'admin') {
    query.verificationStatus = 'approved';
  }

  // 1. Specialization filter (support ObjectId or name)
  if (specialization) {
    const trimmedSpec = specialization.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedSpec)) {
      query.specialization = new mongoose.Types.ObjectId(trimmedSpec);
    } else {
      // Find matching specialization documents
      const specDocs = await Specialization.find({
        name: { $regex: new RegExp(`^${escapeRegex(trimmedSpec)}$`, 'i') },
      }).select('_id');

      if (specDocs.length > 0) {
        query.specialization = { $in: specDocs.map((s) => s._id) };
      } else {
        query.specialtyName = { $regex: new RegExp(escapeRegex(trimmedSpec), 'i') };
      }
    }
  }

  // 2. Hospital filter
  if (hospital && mongoose.Types.ObjectId.isValid(hospital)) {
    query.hospital = new mongoose.Types.ObjectId(hospital);
  }

  // 3. Experience filter
  if (experienceMin !== undefined || experienceMax !== undefined) {
    query.experience = {};
    if (experienceMin !== undefined) query.experience.$gte = Number(experienceMin);
    if (experienceMax !== undefined) query.experience.$lte = Number(experienceMax);
  }

  // 4. Rating filter
  if (ratingMin !== undefined) {
    query.rating = { $gte: Number(ratingMin) };
  }

  // 5. Consultation Fee filter
  if (feeMin !== undefined || feeMax !== undefined) {
    query.consultationFee = {};
    if (feeMin !== undefined) query.consultationFee.$gte = Number(feeMin);
    if (feeMax !== undefined) query.consultationFee.$lte = Number(feeMax);
  }

  // 6. Language filter
  if (language) {
    query.languages = {
      $in: [new RegExp(`^${escapeRegex(language.trim())}$`, 'i')],
    };
  }

  // 7. Case-insensitive text search (doctor name, specialty, hospital name)
  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');

    // Find user IDs whose full name matches the search query
    const matchingUsers = await User.find({
      fullName: searchRegex,
      role: 'doctor',
      isActive: true,
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    // Find hospital IDs matching search
    const matchingHospitals = await Hospital.find({
      name: searchRegex,
      isActive: true,
    }).select('_id');

    const hospitalIds = matchingHospitals.map((h) => h._id);

    query.$or = [
      { user: { $in: userIds } },
      { specialtyName: searchRegex },
      { hospitalName: searchRegex },
      { hospital: { $in: hospitalIds } },
    ];
  }

  // 8. Sorting options
  let sortCriteria = {};
  switch (sort) {
    case 'rating':
      sortCriteria = { rating: -1, reviewCount: -1 };
      break;
    case 'experience':
      sortCriteria = { experience: -1 };
      break;
    case 'feeLow':
      sortCriteria = { consultationFee: 1 };
      break;
    case 'feeHigh':
      sortCriteria = { consultationFee: -1 };
      break;
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'name':
      // Sorted primarily by specialtyName / user name fallback
      sortCriteria = { specialtyName: 1 };
      break;
    case 'recommended':
    default:
      // Deterministic neutral default: verified, rating descending, review count descending, experience descending
      sortCriteria = { rating: -1, reviewCount: -1, experience: -1 };
      break;
  }

  // Execute Count & Query
  const [total, rawDoctors] = await Promise.all([
    Doctor.countDocuments(query),
    Doctor.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'fullName email phone avatar isActive')
      .populate('specialization', 'name category icon description')
      .populate('hospital', 'name address city state pincode phone rating emergencyService image'),
  ]);

  // Filter out any doctors whose User account is deactivated (public security)
  const activeDoctors = rawDoctors.filter((doc) => doc.user && doc.user.isActive !== false);

  // If sort === 'name', sort activeDoctors in-memory by user.fullName
  if (sort === 'name') {
    activeDoctors.sort((a, b) => {
      const nameA = (a.user?.fullName || '').toLowerCase();
      const nameB = (b.user?.fullName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  const transformedDoctors = activeDoctors.map(transformPublicDoctor);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    data: transformedDoctors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};

/**
 * Get single doctor profile by ID with strict public security
 */
export const getDoctorById = async (id, requestingUser = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid doctor ID.');
    error.statusCode = 400;
    throw error;
  }

  const doctor = await Doctor.findById(id)
    .populate('user', 'fullName email phone avatar isActive')
    .populate('specialization', 'name category icon description keywords')
    .populate('hospital', 'name address city state pincode phone email rating emergencyService facilities image description');

  if (!doctor) {
    const error = new Error('Doctor profile not found.');
    error.statusCode = 404;
    throw error;
  }

  // Security: If not approved or user deactivated, hide from public
  const isAdmin = requestingUser && requestingUser.role === 'admin';
  if (!isAdmin) {
    if (doctor.verificationStatus !== 'approved' || (doctor.user && doctor.user.isActive === false)) {
      const error = new Error('Doctor profile not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  const availability = await Availability.findOne({ doctor: doctor._id });

  return transformPublicDoctor(doctor, availability);
};

/**
 * Compare 2 to 3 doctors side-by-side with security checks and availability schedules
 */
export const compareDoctors = async (doctorIds = [], requestingUser = null) => {
  if (!Array.isArray(doctorIds) || doctorIds.length < 2 || doctorIds.length > 3) {
    const error = new Error('You must select between 2 and 3 doctors to compare.');
    error.statusCode = 400;
    throw error;
  }

  for (const id of doctorIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error(`Invalid doctor ID: ${id}`);
      error.statusCode = 400;
      throw error;
    }
  }

  const query = {
    _id: { $in: doctorIds },
  };

  const isAdmin = requestingUser && requestingUser.role === 'admin';
  if (!isAdmin) {
    query.verificationStatus = 'approved';
  }

  const doctors = await Doctor.find(query)
    .populate('user', 'fullName email phone avatar isActive')
    .populate('specialization', 'name category icon description keywords')
    .populate('hospital', 'name address city state pincode phone email rating emergencyService facilities image description totalBeds');

  // Filter out doctors whose user is deactivated
  const activeDoctors = isAdmin
    ? doctors
    : doctors.filter((doc) => doc.user && doc.user.isActive !== false);

  if (activeDoctors.length < 2) {
    const error = new Error('At least 2 active approved doctors must be available for comparison.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch availabilities
  const availabilities = await Availability.find({
    doctor: { $in: activeDoctors.map((d) => d._id) },
  });
  const availMap = new Map();
  availabilities.forEach((a) => availMap.set(a.doctor.toString(), a));

  // Maintain original selection order
  const docMap = new Map();
  activeDoctors.forEach((doc) => {
    docMap.set(doc._id.toString(), transformPublicDoctor(doc, availMap.get(doc._id.toString())));
  });

  const orderedResult = [];
  for (const id of doctorIds) {
    if (docMap.has(id.toString())) {
      orderedResult.push(docMap.get(id.toString()));
    }
  }

  return orderedResult;
};

