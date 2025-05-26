const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  review: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update product average rating and review count
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const reviews = await this.constructor.find({ product: this.product });
  
  const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  
  await Product.findByIdAndUpdate(this.product, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema); 