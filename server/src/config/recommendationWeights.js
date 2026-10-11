// src/config/recommendationWeights.js
/**
 * Configurable weights for the recommendation scoring algorithm.
 * Values should sum to 1 (or 100%). They can be adjusted without code changes
 * by editing this file or overriding via environment variables.
 */
const defaultWeights = {
  specialtyMatch: 0.30,
  hospitalMatch: 0.20,
  ratingScore: 0.15,
  experienceScore: 0.10,
  distanceScore: 0.10,
  availabilityScore: 0.10,
  preferenceScore: 0.05,
};

// Allow environment overrides – e.g., RECOMMEND_WEIGHT_SPECIALTY=0.25
const envWeights = {
  specialtyMatch: parseFloat(process.env.RECOMMEND_WEIGHT_SPECIALTY) || undefined,
  hospitalMatch: parseFloat(process.env.RECOMMEND_WEIGHT_HOSPITAL) || undefined,
  ratingScore: parseFloat(process.env.RECOMMEND_WEIGHT_RATING) || undefined,
  experienceScore: parseFloat(process.env.RECOMMEND_WEIGHT_EXPERIENCE) || undefined,
  distanceScore: parseFloat(process.env.RECOMMEND_WEIGHT_DISTANCE) || undefined,
  availabilityScore: parseFloat(process.env.RECOMMEND_WEIGHT_AVAILABILITY) || undefined,
  preferenceScore: parseFloat(process.env.RECOMMEND_WEIGHT_PREFERENCE) || undefined,
};

const recommendationWeights = {
  ...defaultWeights,
  ...Object.fromEntries(Object.entries(envWeights).filter(([, v]) => v !== undefined)),
};

export default recommendationWeights;
