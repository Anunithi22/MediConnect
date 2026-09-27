import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Please enter a realistic age'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a supported gender',
      },
      required: [true, 'Gender is required'],
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'ta', 'hi'],
      default: 'en',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    medicalHistorySummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
