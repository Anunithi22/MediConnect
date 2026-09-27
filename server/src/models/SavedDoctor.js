import mongoose from 'mongoose';

const savedDoctorSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

savedDoctorSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const SavedDoctor = mongoose.models.SavedDoctor || mongoose.model('SavedDoctor', savedDoctorSchema);
export default SavedDoctor;
