import { query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Common validation error responder
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return res.status(400).json({
      success: false,
      message: extractedErrors[0].message || 'Validation failed. Please check your query parameters.',
      errors: extractedErrors,
    });
  }
  next();
};

/**
 * Validate MongoDB ObjectId in route parameters
 */
export const validateObjectId = (paramName, resourceLabel = 'Resource') => [
  param(paramName)
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage(`Invalid ${resourceLabel} ID format.`),
  handleValidationErrors,
];

/**
 * Doctor discovery query validation rules
 */
export const validateDoctorQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer greater than or equal to 1.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50.'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters.'),
  query('specialization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specialization parameter cannot exceed 100 characters.'),
  query('hospital')
    .optional()
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid hospital ID format.'),
  query('experienceMin')
    .optional()
    .isInt({ min: 0, max: 80 })
    .withMessage('Minimum experience must be a non-negative number between 0 and 80.'),
  query('experienceMax')
    .optional()
    .isInt({ min: 0, max: 80 })
    .withMessage('Maximum experience must be a non-negative number between 0 and 80.'),
  query('ratingMin')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5.'),
  query('feeMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum consultation fee cannot be negative.'),
  query('feeMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum consultation fee cannot be negative.'),
  query('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language filter cannot exceed 50 characters.'),
  query('sort')
    .optional()
    .isIn(['rating', 'experience', 'feeLow', 'feeHigh', 'name', 'newest', 'recommended'])
    .withMessage('Invalid sort parameter. Supported: rating, experience, feeLow, feeHigh, name, newest, recommended.'),
  handleValidationErrors,
];

/**
 * Hospital discovery query validation rules
 */
export const validateHospitalQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer greater than or equal to 1.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50.'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters.'),
  query('city')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  query('state')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  query('pincode')
    .optional()
    .trim()
    .isLength({ max: 20 }),
  query('specialty')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('facility')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  query('hospitalType')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  query('ratingMin')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5.'),
  query('emergency')
    .optional()
    .custom((val) => val === 'true' || val === 'false' || val === true || val === false)
    .withMessage('Emergency filter must be a boolean (true or false).'),
  query('sort')
    .optional()
    .isIn(['recommended', 'rating', 'name', 'beds', 'newest'])
    .withMessage('Invalid sort parameter. Supported: recommended, rating, name, beds, newest.'),
  handleValidationErrors,
];

/**
 * Specialization query validation rules
 */
export const validateSpecializationQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters.'),
  handleValidationErrors,
];

/**
 * Comparison query validation rules (2 to 3 IDs)
 */
export const validateCompareQuery = [
  query('ids')
    .notEmpty()
    .withMessage('Please provide comma-separated IDs to compare.')
    .custom((val) => {
      const ids = val.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length < 2 || ids.length > 3) {
        throw new Error('Please select between 2 and 3 items to compare.');
      }
      for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid ID format: ${id}`);
        }
      }
      return true;
    }),
  handleValidationErrors,
];

