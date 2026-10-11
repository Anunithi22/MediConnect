import mongoose from 'mongoose';
import { Doctor, User, Specialization, Hospital, Availability } from '../models/index.js';
import {
  parseCoordinates,
  parseRadius,
  parseUnit,
  metersToUnit,
  unitToMeters,
  formatDistance,
  calculateHaversineDistance,
} from './locationService.js';

/**
 * Helper to escape regex special characters
 */
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Transform Doctor document into a clean, safe public representation
 */
export const transformPublicDoctor = (doc, availability = null, distanceInfo = null) => {
  if (!doc) return null;

  const user = doc.user || {};
  const spec = doc.specialization || {};
  const hosp = doc.hospital || {};

  let distObj = distanceInfo;
  if (!distObj && (doc.distance !== undefined && doc.distanceUnit !== undefined)) {
    distObj = {
      distance: doc.distance,
      distanceUnit: doc.distanceUnit,
      formatted: `${doc.distance} ${doc.distanceUnit}`,
    };
  }

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
    distance: distObj?.distance !== undefined ? distObj.distance : undefined,
    distanceUnit: distObj?.distanceUnit !== undefined ? distObj.distanceUnit : undefined,
    distanceFormatted: distObj?.formatted !== undefined ? distObj.formatted : undefined,
    hospital: {
      id: typeof hosp === 'object' && hosp._id ? hosp._id.toString() : null,
      name: typeof hosp === 'object' && hosp.name ? hosp.name : doc.hospitalName,
      city: typeof hosp === 'object' ? hosp.city : '',
      address: typeof hosp === 'object' ? hosp.address : '',
      rating: typeof hosp === 'object' ? hosp.rating : null,
      phone: typeof hosp === 'object' ? hosp.phone : '',
      totalBeds: typeof hosp === 'object' ? hosp.totalBeds : undefined,
      latitude: typeof hosp === 'object' ? hosp.latitude : undefined,
      longitude: typeof hosp === 'object' ? hosp.longitude : undefined,
      location: typeof hosp === 'object' ? hosp.location : undefined,
      distance: distObj?.distance !== undefined ? distObj.distance : undefined,
      distanceUnit: distObj?.distanceUnit !== undefined ? distObj.distanceUnit : undefined,
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
    latitude,
    longitude,
    radius,
    unit,
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

    const matchingUsers = await User.find({
      fullName: searchRegex,
      role: 'doctor',
      isActive: true,
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

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

  // 8. Geospatial location search based on affiliated hospital coordinates
  const coords = parseCoordinates(latitude, longitude);
  const distUnit = parseUnit(unit);

  if (coords) {
    const radiusKm = parseRadius(radius);
    const radiusMeters = unitToMeters(radiusKm, distUnit);

    // Query active hospitals within radiusMeters using $geoNear
    const nearbyHospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat],
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: { isActive: true },
        },
      },
      {
        $project: {
          _id: 1,
          distanceMeters: 1,
        },
      },
    ]);

    if (nearbyHospitals.length === 0) {
      return {
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        locationSearch: {
          latitude: coords.lat,
          longitude: coords.lng,
          radius: radiusKm,
          unit: distUnit,
        },
      };
    }

    const hospitalDistanceMap = new Map();
    nearbyHospitals.forEach((h) => {
      hospitalDistanceMap.set(h._id.toString(), h.distanceMeters);
    });

    const nearbyHospitalIds = nearbyHospitals.map((h) => h._id);

    if (query.hospital) {
      if (!hospitalDistanceMap.has(query.hospital.toString())) {
        return {
          data: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          locationSearch: {
            latitude: coords.lat,
            longitude: coords.lng,
            radius: radiusKm,
            unit: distUnit,
          },
        };
      }
    } else {
      query.hospital = { $in: nearbyHospitalIds };
    }

    const rawDoctors = await Doctor.find(query)
      .populate('user', 'fullName email phone avatar isActive')
      .populate('specialization', 'name category icon description')
      .populate('hospital', 'name address city state pincode phone rating emergencyService image latitude longitude location totalBeds');

    const activeDoctors = rawDoctors.filter((doc) => doc.user && doc.user.isActive !== false);

    // Attach computed distance from affiliated hospital
    activeDoctors.forEach((doc) => {
      const hospId = doc.hospital?._id ? doc.hospital._id.toString() : (doc.hospital ? doc.hospital.toString() : null);
      const distMeters = hospId ? hospitalDistanceMap.get(hospId) : undefined;
      doc._distanceMeters = distMeters;
      if (distMeters !== undefined) {
        const converted = metersToUnit(distMeters, distUnit);
        doc._distanceObj = formatDistance(converted, distUnit);
      }
    });

    // Sort doctors
    if (sort === 'nearest') {
      activeDoctors.sort((a, b) => {
        const distDiff = (a._distanceMeters ?? Infinity) - (b._distanceMeters ?? Infinity);
        if (distDiff !== 0) return distDiff;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else if (sort === 'feeLow') {
      activeDoctors.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
    } else if (sort === 'feeHigh') {
      activeDoctors.sort((a, b) => (b.consultationFee || 0) - (a.consultationFee || 0));
    } else if (sort === 'experience') {
      activeDoctors.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else if (sort === 'name') {
      activeDoctors.sort((a, b) => (a.user?.fullName || '').localeCompare(b.user?.fullName || ''));
    } else if (sort === 'newest') {
      activeDoctors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // rating / recommended default
      activeDoctors.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
    }

    const total = activeDoctors.length;
    const pagedDoctors = activeDoctors.slice(skip, skip + limitNum);
    const transformedDoctors = pagedDoctors.map((doc) => transformPublicDoctor(doc, null, doc._distanceObj));
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
      locationSearch: {
        latitude: coords.lat,
        longitude: coords.lng,
        radius: radiusKm,
        unit: distUnit,
      },
    };
  }

  // 9. Standard non-location sorting options
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
      sortCriteria = { specialtyName: 1 };
      break;
    case 'nearest':
    case 'recommended':
    default:
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
      .populate('hospital', 'name address city state pincode phone rating emergencyService image latitude longitude location totalBeds'),
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

  const transformedDoctors = activeDoctors.map((doc) => transformPublicDoctor(doc));
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
 * Get single doctor profile by ID with strict public security & optional distance
 */
export const getDoctorById = async (id, requestingUser = null, queryParams = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid doctor ID.');
    error.statusCode = 400;
    throw error;
  }

  const { latitude, longitude, unit } = queryParams;

  const doctor = await Doctor.findById(id)
    .populate('user', 'fullName email phone avatar isActive')
    .populate('specialization', 'name category icon description keywords')
    .populate('hospital', 'name address city state pincode phone email rating emergencyService facilities image description latitude longitude location totalBeds');

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

  let distanceInfo = null;
  const coords = parseCoordinates(latitude, longitude);
  if (coords && doctor.hospital && doctor.hospital.latitude !== undefined && doctor.hospital.longitude !== undefined) {
    const distUnit = parseUnit(unit);
    const dist = calculateHaversineDistance(coords.lat, coords.lng, doctor.hospital.latitude, doctor.hospital.longitude, distUnit);
    distanceInfo = formatDistance(dist, distUnit);
  }

  return transformPublicDoctor(doctor, availability, distanceInfo);
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

