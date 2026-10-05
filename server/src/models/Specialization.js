import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Specialization name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    icon: {
      type: String,
      default: 'Stethoscope',
    },
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

specializationSchema.index({ category: 1 });
specializationSchema.index({ keywords: 1 });

const Specialization = mongoose.models.Specialization || mongoose.model('Specialization', specializationSchema);
export default Specialization;
