const Review = require('../models/Review');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all reviews
// @route   GET /api/reviews
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  
  // If productId is provided, filter reviews by product
  if (req.params.productId) {
    filter = { product: req.params.productId, status: 'approved' };
  } else {
    // For admin routes, get all reviews including pending and rejected
    filter = req.user.role === 'admin' ? {} : { status: 'approved' };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Sort options
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === 'newest') sort = { createdAt: -1 };
    if (req.query.sort === 'oldest') sort = { createdAt: 1 };
    if (req.query.sort === 'highest') sort = { rating: -1 };
    if (req.query.sort === 'lowest') sort = { rating: 1 };
    if (req.query.sort === 'helpful') sort = { helpfulVotes: -1 };
  } else {
    sort = { createdAt: -1 }; // Default to newest first
  }
  
  // Filter by rating if provided
  if (req.query.rating) {
    filter.rating = parseInt(req.query.rating, 10);
  }
  
  // Filter by verified purchase if requested
  if (req.query.verified === 'true') {
    filter.isVerifiedPurchase = true;
  }
  
  const reviews = await Review.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'user',
      select: 'name avatar'
    });
  
  // Get total count for pagination
  const totalReviews = await Review.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total: totalReviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page,
    data: reviews
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public/Private/Admin
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'user',
    select: 'name avatar'
  });
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // Only allow admins or the review owner to see non-approved reviews
  if (review.status !== 'approved' && 
      (!req.user || (req.user.role !== 'admin' && req.user.id.toString() !== review.user._id.toString()))) {
    return next(new AppError('This review is not available', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: review
  });
});

// Set productId and userId to req.body
exports.setProductUserIds = (req, res, next) => {
  // If not specified in body, get productId from URL
  if (!req.body.product) req.body.product = req.params.productId;
  // Set user to current user
  req.body.user = req.user.id;
  next();
};

// @desc    Create review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res, next) => {
  // Check if product exists
  const product = await Product.findById(req.body.product);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  
  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    product: req.body.product,
    user: req.body.user
  });
  
  if (alreadyReviewed) {
    return next(new AppError('You have already reviewed this product', 400));
  }
  
  // Process uploaded images if available
  if (req.fileUrls) {
    req.body.images = req.fileUrls;
  }
  
  // Set verified purchase status
  // In a real application, you would check if the user has actually purchased the product
  // This is a simplified example
  req.body.isVerifiedPurchase = false; // You should implement actual verification logic
  
  // Create the review
  const review = await Review.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: review
  });
});

// @desc    Update review
// @route   PATCH /api/reviews/:id
// @access  Private
exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // Check ownership - only allow the user who created the review or admin to update
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this review', 403));
  }
  
  // Process uploaded images if available
  if (req.fileUrls) {
    // If append images flag is set, add to existing images
    if (req.body.appendImages === 'true') {
      req.body.images = [...review.images, ...req.fileUrls];
    } else {
      req.body.images = req.fileUrls;
    }
  }
  
  // Reset status to pending if user updates the review content or rating
  if ((req.body.comment && req.body.comment !== review.comment) || 
      (req.body.rating && req.body.rating !== review.rating)) {
    req.body.status = 'pending';
  }
  
  // Update the review
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // Check ownership - only allow the user who created the review or admin to delete
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this review', 403));
  }
  
  await review.remove();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Update review status (admin only)
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = catchAsync(async (req, res, next) => {
  const { status, adminResponse } = req.body;
  
  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return next(new AppError('Please provide a valid status (approved, rejected, pending)', 400));
  }
  
  const review = await Review.findByIdAndUpdate(
    req.params.id, 
    { 
      status,
      adminResponse: status === 'rejected' ? {
        comment: adminResponse,
        date: Date.now()
      } : undefined
    }, 
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc    Vote on review helpfulness
// @route   PATCH /api/reviews/:id/vote
// @access  Private
exports.voteReview = catchAsync(async (req, res, next) => {
  const { helpful } = req.body;
  
  if (helpful === undefined) {
    return next(new AppError('Please specify if the review was helpful or not', 400));
  }
  
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // Simple implementation - in a real app, you would track which users voted
  // to prevent duplicate votes
  if (helpful) {
    review.helpfulVotes += 1;
  } else {
    review.unhelpfulVotes += 1;
  }
  
  await review.save();
  
  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc    Get review stats by product
// @route   GET /api/products/:productId/review-stats
// @access  Public
exports.getReviewStats = catchAsync(async (req, res, next) => {
  const stats = await Review.aggregate([
    {
      $match: { 
        product: mongoose.Types.ObjectId(req.params.productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  // Format the stats into an array of counts for each rating (5 to 1)
  const formattedStats = [5, 4, 3, 2, 1].map(rating => {
    const found = stats.find(stat => stat._id === rating);
    return {
      rating,
      count: found ? found.count : 0
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: formattedStats
  });
}); 