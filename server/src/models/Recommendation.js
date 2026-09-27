import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    userQuery: {
      type: String,
      required: true,
    },
    matchedSpecialty: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.9,
    },
    explanation: {
      type: String,
      default: '',
    },
    recommendedDoctors: [
      {
        doctor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        score: Number,
        factors: {
          specialtyMatch: Number,
          hospitalMatch: Number,
          ratingScore: Number,
          experienceScore: Number,
          distanceScore: Number,
          availabilityScore: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
