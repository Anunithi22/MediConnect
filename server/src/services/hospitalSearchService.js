import mongoose from 'mongoose';
import { Hospital, Doctor, Specialization } from '../models/index.js';
import { transformPublicDoctor } from './doctorSearchService.js';
import {
  parseCoordinates,
  parseRadius,
  parseUnit,
  metersToUnit,
  unitToMeters,
  formatDistance,
  calculateHaversineDistance,
  buildGeoNearStage,
} from './locationService.js';

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Transform Hospital document into a clean, safe public representation
 */
export const transformPublicHospital = (hosp, doctorsCount = null, distanceInfo = null) => {
  if (!hosp) return null;

  let distanceObj = distanceInfo;
  if (!distanceObj) {
    if (hosp.distance !== undefined && hosp.distanceUnit !== undefined) {
      distanceObj = {
        distance: hosp.distance,
        distanceUnit: hosp.distanceUnit,
        formatted: `${hosp.distance} ${hosp.distanceUnit}`,
      };
    } else if (hosp.distanceMeters !== undefined) {
      const dist = metersToUnit(hosp.distanceMeters, 'km');
      distanceObj = formatDistance(dist, 'km');
    }
  }

  return {
    id: hosp._id.toString(),
    name: hosp.name,
    description: hosp.description || `${hosp.name} provides comprehensive medical diagnostics and healthcare treatments in ${hosp.city}.`,
    hospitalType: hosp.hospitalType || 'Multi-Specialty',
    address: hosp.address,
    city: hosp.city,
    state: hosp.state,
    pincode: hosp.pincode || '',
    latitude: hosp.latitude,
    longitude: hosp.longitude,
    location: hosp.location || {
      type: 'Point',
      coordinates: [hosp.longitude, hosp.latitude],
    },
    distance: distanceObj?.distance !== undefined ? distanceObj.distance : undefined,
    distanceUnit: distanceObj?.distanceUnit !== undefined ? distanceObj.distanceUnit : undefined,
    distanceFormatted: distanceObj?.formatted !== undefined ? distanceObj.formatted : undefined,
    phone: hosp.phone || '',
    email: hosp.email || '',
    specialties: Array.isArray(hosp.specialties)
      ? hosp.specialties.map((s) => ({
          id: s._id ? s._id.toString() : s.toString(),
          name: s.name || '',
          icon: s.icon || 'Activity',
        }))
      : [],
    facilities: Array.isArray(hosp.facilities) ? hosp.facilities : [],
    emergencyService: hosp.emergencyService !== false,
    rating: hosp.rating || 4.5,
    reviewCount: hosp.reviewCount || 0,
    totalBeds: hosp.totalBeds !== undefined ? hosp.totalBeds : 350,
    image: hosp.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
    isActive: hosp.isActive !== false,
    doctorsCount: doctorsCount !== null ? doctorsCount : undefined,
    createdAt: hosp.createdAt,
  };
};

/**
 * Search and filter hospitals (with optional geospatial querying)
 */
export const searchHospitals = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 12,
    search,
    city,
    state,
    pincode,
    specialty,
    facility,
    hospitalType,
    ratingMin,
    emergency,
    latitude,
    longitude,
    radius,
    unit,
    sort = 'recommended',
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const query = { isActive: true };

  // 1. City, State, Pincode
  if (city && city.trim()) {
    query.city = { $regex: new RegExp(escapeRegex(city.trim()), 'i') };
  }
  if (state && state.trim()) {
    query.state = { $regex: new RegExp(escapeRegex(state.trim()), 'i') };
  }
  if (pincode && pincode.trim()) {
    query.pincode = pincode.trim();
  }

  // 2. Specialty filter
  if (specialty && specialty.trim()) {
    const trimmedSpec = specialty.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedSpec)) {
      query.specialties = new mongoose.Types.ObjectId(trimmedSpec);
    } else {
      const specDocs = await Specialization.find({
        name: { $regex: new RegExp(escapeRegex(trimmedSpec), 'i') },
      }).select('_id');
      if (specDocs.length > 0) {
        query.specialties = { $in: specDocs.map((s) => s._id) };
      }
    }
  }

  // 3. Facility filter
  if (facility && facility.trim()) {
    query.facilities = { $regex: new RegExp(escapeRegex(facility.trim()), 'i') };
  }

  // 4. Hospital Type
  if (hospitalType && hospitalType.trim()) {
    query.hospitalType = { $regex: new RegExp(escapeRegex(hospitalType.trim()), 'i') };
  }

  // 5. Emergency Service
  if (emergency !== undefined) {
    query.emergencyService = emergency === 'true' || emergency === true;
  }

  // 6. Rating filter
  if (ratingMin !== undefined) {
    query.rating = { $gte: Number(ratingMin) };
  }

  // 7. Case-insensitive text search (name, address, city, state)
  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { name: searchRegex },
      { address: searchRegex },
      { city: searchRegex },
      { state: searchRegex },
    ];
  }

  // Check if location coordinates were provided
  const coords = parseCoordinates(latitude, longitude);
  const distUnit = parseUnit(unit);

  if (coords) {
    const radiusKm = parseRadius(radius);
    const radiusMeters = unitToMeters(radiusKm, distUnit);

    const geoNearStage = buildGeoNearStage({
      lat: coords.lat,
      lng: coords.lng,
      maxDistanceMeters: radiusMeters,
      query,
    });

    let sortStage = null;
    if (sort === 'rating' || sort === 'recommended') {
      sortStage = { $sort: { rating: -1, reviewCount: -1 } };
    } else if (sort === 'beds') {
      sortStage = { $sort: { totalBeds: -1 } };
    } else if (sort === 'name') {
      sortStage = { $sort: { name: 1 } };
    } else if (sort === 'newest') {
      sortStage = { $sort: { createdAt: -1 } };
    }
    // If sort === 'nearest', $geoNear already outputs in ascending order of distance!

    const pipeline = [
      geoNearStage,
      ...(sortStage ? [sortStage] : []),
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $lookup: {
                from: 'specializations',
                localField: 'specialties',
                foreignField: '_id',
                as: 'specialties',
              },
            },
          ],
        },
      },
    ];

    const aggregateResult = await Hospital.aggregate(pipeline);
    const total = aggregateResult[0]?.metadata[0]?.total || 0;
    const rawHospitals = aggregateResult[0]?.data || [];

    const transformedHospitals = rawHospitals.map((h) => {
      const distConverted = metersToUnit(h.distanceMeters, distUnit);
      const distObj = formatDistance(distConverted, distUnit);
      return transformPublicHospital(h, null, distObj);
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data: transformedHospitals,
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

  // Non-location fallback: standard MongoDB query
  let sortCriteria = {};
  switch (sort) {
    case 'name':
      sortCriteria = { name: 1 };
      break;
    case 'beds':
      sortCriteria = { totalBeds: -1 };
      break;
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'nearest':
    case 'rating':
    case 'recommended':
    default:
      sortCriteria = { rating: -1, reviewCount: -1 };
      break;
  }

  const [total, rawHospitals] = await Promise.all([
    Hospital.countDocuments(query),
    Hospital.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .populate('specialties', 'name icon category'),
  ]);

  const transformedHospitals = rawHospitals.map((h) => transformPublicHospital(h));
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    data: transformedHospitals,
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
 * Get single hospital by ID with doctors count & optional distance calculation
 */
export const getHospitalById = async (id, queryParams = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid hospital ID.');
    error.statusCode = 400;
    throw error;
  }

  const { latitude, longitude, unit } = queryParams;

  const [hospital, doctorsCount] = await Promise.all([
    Hospital.findOne({ _id: id, isActive: true }).populate('specialties', 'name icon category description'),
    Doctor.countDocuments({ hospital: id, verificationStatus: 'approved' }),
  ]);

  if (!hospital) {
    const error = new Error('Hospital not found or inactive.');
    error.statusCode = 404;
    throw error;
  }

  let distanceInfo = null;
  const coords = parseCoordinates(latitude, longitude);
  if (coords && hospital.latitude !== undefined && hospital.longitude !== undefined) {
    const distUnit = parseUnit(unit);
    const dist = calculateHaversineDistance(coords.lat, coords.lng, hospital.latitude, hospital.longitude, distUnit);
    distanceInfo = formatDistance(dist, distUnit);
  }

  return transformPublicHospital(hospital, doctorsCount, distanceInfo);
};

/**
 * Get approved doctors associated with a hospital
 */
export const getHospitalDoctors = async (hospitalId, queryParams = {}) => {
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    const error = new Error('Invalid hospital ID.');
    error.statusCode = 400;
    throw error;
  }

  const { page = 1, limit = 12 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    hospital: hospitalId,
    verificationStatus: 'approved',
  };

  const [total, rawDoctors] = await Promise.all([
    Doctor.countDocuments(query),
    Doctor.find(query)
      .sort({ rating: -1, reviewCount: -1, experience: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'fullName email phone avatar isActive')
      .populate('specialization', 'name category icon')
      .populate('hospital', 'name address city'),
  ]);

  const activeDoctors = rawDoctors.filter((doc) => doc.user && doc.user.isActive !== false);
  const transformed = activeDoctors.map(transformPublicDoctor);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    data: transformed,
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
 * Compare 2 to 3 hospitals side-by-side with doctor counts and populated specialties
 */
export const compareHospitals = async (hospitalIds = []) => {
  if (!Array.isArray(hospitalIds) || hospitalIds.length < 2 || hospitalIds.length > 3) {
    const error = new Error('You must select between 2 and 3 hospitals to compare.');
    error.statusCode = 400;
    throw error;
  }

  for (const id of hospitalIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error(`Invalid hospital ID: ${id}`);
      error.statusCode = 400;
      throw error;
    }
  }

  const hospitals = await Hospital.find({
    _id: { $in: hospitalIds },
    isActive: true,
  }).populate('specialties', 'name icon category');

  if (hospitals.length < 2) {
    const error = new Error('At least 2 active hospitals must be available for comparison.');
    error.statusCode = 404;
    throw error;
  }

  // Compute doctors count for each compared hospital
  const doctorCounts = await Doctor.aggregate([
    {
      $match: {
        hospital: { $in: hospitals.map((h) => h._id) },
        verificationStatus: 'approved',
      },
    },
    {
      $group: {
        _id: '$hospital',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map();
  doctorCounts.forEach((dc) => countMap.set(dc._id.toString(), dc.count));

  const hospMap = new Map();
  hospitals.forEach((hosp) => {
    const docCount = countMap.get(hosp._id.toString()) || 0;
    hospMap.set(hosp._id.toString(), transformPublicHospital(hosp, docCount));
  });

  const orderedResult = [];
  for (const id of hospitalIds) {
    if (hospMap.has(id.toString())) {
      orderedResult.push(hospMap.get(id.toString()));
    }
  }

  return orderedResult;
};

