import mongoose from 'mongoose';

const savedHospitalSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

savedHospitalSchema.index({ patient: 1, hospital: 1 }, { unique: true });

const SavedHospital = mongoose.models.SavedHospital || mongoose.model('SavedHospital', savedHospitalSchema);
export default SavedHospital;
