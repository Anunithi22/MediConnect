/**
 * Reusable Location & Geospatial Service for MediConnect
 * Handles coordinate validation, radius sanitization, unit conversions,
 * distance formatting, and MongoDB geospatial query builders.
 */

export const EARTH_RADIUS_KM = 6378.137;
export const METERS_PER_KM = 1000;
export const METERS_PER_MILE = 1609.344;
export const DEFAULT_RADIUS_KM = 50;
export const MAX_RADIUS_KM = 500;

/**
 * Validate latitude range (-90 to 90)
 */
export const isValidLatitude = (lat) => {
  const num = Number(lat);
  return !Number.isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude range (-180 to 180)
 */
export const isValidLongitude = (lng) => {
  const num = Number(lng);
  return !Number.isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Parse and validate coordinate pair
 */
export const parseCoordinates = (latitude, longitude) => {
  if (latitude === undefined && longitude === undefined) {
    return null;
  }

  if (latitude === undefined || longitude === undefined) {
    const error = new Error('Both latitude and longitude must be provided together.');
    error.statusCode = 400;
    throw error;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!isValidLatitude(lat)) {
    const error = new Error('Invalid latitude. Latitude must be a numeric value between -90 and 90.');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidLongitude(lng)) {
    const error = new Error('Invalid longitude. Longitude must be a numeric value between -180 and 180.');
    error.statusCode = 400;
    throw error;
  }

  return { lat, lng };
};

/**
 * Parse and validate radius parameter
 */
export const parseRadius = (radius, defaultRadius = DEFAULT_RADIUS_KM, maxRadius = MAX_RADIUS_KM) => {
  if (radius === undefined || radius === null || radius === '') {
    return defaultRadius;
  }

  const num = Number(radius);
  if (Number.isNaN(num) || num <= 0) {
    const error = new Error('Radius must be a positive number greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  if (num > maxRadius) {
    const error = new Error(`Radius cannot exceed ${maxRadius} km.`);
    error.statusCode = 400;
    throw error;
  }

  return num;
};

/**
 * Parse distance unit ('km' | 'mi')
 */
export const parseUnit = (unit) => {
  if (!unit) return 'km';
  const clean = String(unit).toLowerCase().trim();
  if (clean === 'mi' || clean === 'miles' || clean === 'mile') {
    return 'mi';
  }
  return 'km';
};

/**
 * Convert meters to specified distance unit ('km' or 'mi')
 */
export const metersToUnit = (meters, unit = 'km') => {
  const m = Number(meters) || 0;
  if (unit === 'mi') {
    return m / METERS_PER_MILE;
  }
  return m / METERS_PER_KM;
};

/**
 * Convert unit value (km or mi) to meters
 */
export const unitToMeters = (value, unit = 'km') => {
  const val = Number(value) || 0;
  if (unit === 'mi') {
    return val * METERS_PER_MILE;
  }
  return val * METERS_PER_KM;
};

/**
 * Cleanly format distance for public API presentation
 */
export const formatDistance = (distanceValue, unit = 'km') => {
  if (distanceValue === undefined || distanceValue === null || Number.isNaN(Number(distanceValue))) {
    return null;
  }

  const numericValue = Number(distanceValue);
  // Round consistently to 1 decimal place
  const rounded = Math.round(numericValue * 10) / 10;
  const distanceUnit = unit === 'mi' ? 'mi' : 'km';

  return {
    distance: rounded,
    distanceUnit,
    formatted: `${rounded} ${distanceUnit}`,
  };
};

/**
 * Haversine formula calculation for distance between two points in memory
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @param {string} unit 'km' or 'mi'
 * @returns {number} Distance in requested unit
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = unit === 'mi' ? 3958.8 : EARTH_RADIUS_KM;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

/**
 * Build MongoDB $geoNear aggregation stage
 */
export const buildGeoNearStage = ({ lat, lng, maxDistanceMeters, query = {} }) => {
  return {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
      },
      distanceField: 'distanceMeters',
      maxDistance: Number(maxDistanceMeters),
      spherical: true,
      query,
    },
  };
};
