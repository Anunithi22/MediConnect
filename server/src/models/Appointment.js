import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    consultationMode: {
      type: String,
      enum: ['In-person', 'Online'],
      default: 'In-person',
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'confirmed',
      index: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'system', ''],
      default: '',
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
appointmentSchema.index({ patientUser: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });

// Concurrency-safe unique compound index for active appointments:
// Prevents two patients from ever double-booking the same doctor at the same date and timeSlot.
// Cancelled or no-show appointments are excluded so that the slot becomes available again.
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } },
    name: 'unique_active_doctor_slot',
  }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
