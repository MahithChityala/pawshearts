const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['VETERINARY', 'GROOMING', 'PET_STORE', 'ADOPTION_CENTER', 'SHELTER', 'TRAINING']
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [String],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
serviceSchema.index({ location: '2dsphere' });

// Add pre-save hook to verify coordinates
serviceSchema.pre('save', function(next) {
  if (this.location && this.location.coordinates) {
    // Ensure coordinates are in the correct format [longitude, latitude]
    if (this.location.coordinates.length !== 2) {
      return next(new Error('Location coordinates must be an array of [longitude, latitude]'));
    }
    
    const [longitude, latitude] = this.location.coordinates;
    
    // Validate longitude (-180 to 180)
    if (longitude < -180 || longitude > 180) {
      return next(new Error('Longitude must be between -180 and 180'));
    }
    
    // Validate latitude (-90 to 90)
    if (latitude < -90 || latitude > 90) {
      return next(new Error('Latitude must be between -90 and 90'));
    }
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service; 