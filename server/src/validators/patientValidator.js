import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

export const validateUpdateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[0-9\s\-()]{7,18}$/)
    .withMessage('Please provide a valid phone number'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Age must be between 0 and 120'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'ta', 'hi'])
    .withMessage('Supported languages are en, ta, hi'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('pincode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Pincode cannot exceed 20 characters'),
  body('medicalHistorySummary')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Medical history summary cannot exceed 1000 characters'),
  handleValidationErrors,
];

export const validateSearchHistory = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters'),
  body('specialty')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  handleValidationErrors,
];
