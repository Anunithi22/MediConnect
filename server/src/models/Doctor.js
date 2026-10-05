import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    qualification: {
      type: String,
      required: [true, 'Doctor qualification is required'],
      trim: true,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
      index: true,
    },
    specialtyName: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      index: true,
    },
    hospitalName: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    languages: {
      type: [String],
      default: ['English', 'Tamil'],
    },
    bio: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    },
    services: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance doctor discovery
doctorSchema.index({ verificationStatus: 1, isAvailable: 1 });
doctorSchema.index({ specialization: 1, verificationStatus: 1 });
doctorSchema.index({ hospital: 1, verificationStatus: 1 });
doctorSchema.index({ experience: 1 });
doctorSchema.index({ consultationFee: 1 });
doctorSchema.index({ rating: -1, reviewCount: -1 });
doctorSchema.index({ languages: 1 });
doctorSchema.index({ specialtyName: 1 });
doctorSchema.index({ hospitalName: 1 });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
export default Doctor;
