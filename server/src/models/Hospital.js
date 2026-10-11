import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      required: [true, 'Hospital latitude is required for distance calculation'],
    },
    longitude: {
      type: Number,
      required: [true, 'Hospital longitude is required for distance calculation'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Hospital coordinates [longitude, latitude] are required'],
      },
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    specialties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
      },
    ],
    facilities: [
      {
        type: String,
      },
    ],
    emergencyService: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
    },
    description: {
      type: String,
      default: '',
    },
    hospitalType: {
      type: String,
      enum: ['Multi-Specialty', 'Super-Specialty', 'Private', 'Government', 'Clinic'],
      default: 'Multi-Specialty',
      index: true,
    },
    totalBeds: {
      type: Number,
      default: 350,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to keep latitude, longitude and GeoJSON location in sync
hospitalSchema.pre('validate', function (next) {
  if (this.longitude !== undefined && this.latitude !== undefined) {
    if (!this.location || !Array.isArray(this.location.coordinates) || this.location.coordinates.length !== 2) {
      this.location = {
        type: 'Point',
        coordinates: [Number(this.longitude), Number(this.latitude)],
      };
    }
  } else if (this.location && Array.isArray(this.location.coordinates) && this.location.coordinates.length === 2) {
    this.longitude = this.location.coordinates[0];
    this.latitude = this.location.coordinates[1];
  }
  next();
});

// Indexes for high performance hospital discovery
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ latitude: 1, longitude: 1 });
hospitalSchema.index({ city: 1, state: 1, pincode: 1 });
hospitalSchema.index({ specialties: 1, isActive: 1 });
hospitalSchema.index({ facilities: 1 });
hospitalSchema.index({ emergencyService: 1, isActive: 1 });
hospitalSchema.index({ rating: -1, reviewCount: -1 });

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
export default Hospital;
