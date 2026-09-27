import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      unique: true,
      index: true,
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    breakTime: {
      start: { type: String, default: '13:00' },
      end: { type: String, default: '14:00' },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    leaveDates: [
      {
        type: Date,
      },
    ],
    holidays: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.models.Availability || mongoose.model('Availability', availabilitySchema);
export default Availability;
