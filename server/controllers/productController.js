const Product = require('../models/Product');
const Review = require('../models/Review');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/User');

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const products = await features.query;
  
  // Get total count for pagination
  const totalProducts = await Product.countDocuments(features.filterObj);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total: totalProducts,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'reviews',
      select: 'rating title comment user createdAt helpfulVotes isVerifiedPurchase',
      match: { status: 'approved' },
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = catchAsync(async (req, res, next) => {
  // Add user (admin) to request body
  req.body.user = req.user.id;
  
  // Process uploaded images if available
  if (req.processedFiles) {
    if (req.processedFiles.mainImage) {
      req.body.mainImage = req.processedFiles.mainImage[0];
    }
    if (req.processedFiles.images) {
      req.body.images = req.processedFiles.images;
    }
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  // Process uploaded images if available
  if (req.processedFiles) {
    if (req.processedFiles.mainImage) {
      req.body.mainImage = req.processedFiles.mainImage[0];
    }
    if (req.processedFiles.images) {
      // If append images flag is set, add to existing images
      if (req.body.appendImages === 'true') {
        const product = await Product.findById(req.params.id);
        if (product) {
          req.body.images = [...product.images, ...req.processedFiles.images];
        } else {
          req.body.images = req.processedFiles.images;
        }
      } else {
        req.body.images = req.processedFiles.images;
      }
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Delete all reviews associated with the product
  await Review.deleteMany({ product: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
exports.getTopProducts = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;
  
  const products = await Product.find({ rating: { $gte: 4 } })
    .sort({ rating: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category');

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  
  const products = await Product.find({ isFeatured: true })
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// @desc    Get on-sale products
// @route   GET /api/products/on-sale
// @access  Public
exports.getOnSaleProducts = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  
  const products = await Product.find({ 
    isOnSale: true,
    salePrice: { $exists: true, $ne: null },
    $expr: { $lt: ['$salePrice', '$price'] }
  }).limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  
  const limit = req.query.limit || 6;
  
  // Find products with same category excluding current product
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    petType: product.petType
  }).limit(Number(limit));

  res.status(200).json({
    status: 'success',
    results: relatedProducts.length,
    data: relatedProducts
  });
});

// @desc    Get products by pet type
// @route   GET /api/products/pet/:petType
// @access  Public
exports.getProductsByPetType = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find({ petType: req.params.petType }), 
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  
  // Get total count for pagination
  const totalProducts = await Product.countDocuments({ 
    petType: req.params.petType,
    ...features.filterObj
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    total: totalProducts,
    data: products
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  
  if (!query) {
    return next(new AppError('Search query is required', 400));
  }
  
  const features = new APIFeatures(
    Product.find({
      $text: { $search: query }
    }).score({ $meta: 'textScore' }),
    req.query
  )
    .filter()
    .sort({ score: { $meta: 'textScore' } })
    .limitFields()
    .paginate();

  const products = await features.query;
  
  // Get total count for pagination
  const totalProducts = await Product.countDocuments({
    $text: { $search: query },
    ...features.filterObj
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    total: totalProducts,
    data: products
  });
});

// @desc    Get all products with filtering and sorting
// @route   GET /api/products/all
// @access  Public
exports.getAllProducts = catchAsync(async (req, res) => {
  try {
    const {
      category,
      petType,
      minPrice,
      maxPrice,
      sort,
      search,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (petType) filter.petType = petType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price-asc':
        sortObj = { price: 1 };
        break;
      case 'price-desc':
        sortObj = { price: -1 };
        break;
      case 'rating-desc':
        sortObj = { averageRating: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('seller', 'name'),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = catchAsync(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name profilePicture')
      .sort('-createdAt');

    res.json({ product, reviews });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res, next) => {
  try {
    const { rating, title, review } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: req.params.id,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const newReview = new Review({
      product: req.params.id,
      user: req.user._id,
      rating,
      title,
      review,
      images
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id)
      .populate('user', 'name profilePicture');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/products/reviews/:reviewId/helpful
// @access  Private
exports.markReviewHelpful = catchAsync(async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const helpfulIndex = review.helpful.indexOf(req.user._id);
    
    if (helpfulIndex === -1) {
      review.helpful.push(req.user._id);
    } else {
      review.helpful.splice(helpfulIndex, 1);
    }

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get recommended products based on user's pets
// @route   GET /api/products/recommended
// @access  Private
exports.getRecommendedProducts = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('pets');
    
    if (!user.pets || user.pets.length === 0) {
      // If user has no pets, return popular products
      const products = await Product.find()
        .sort('-averageRating')
        .limit(10)
        .populate('seller', 'name');
      return res.json(products);
    }

    // Get pet types from user's pets
    const petTypes = [...new Set(user.pets.map(pet => pet.type))];

    // Find products matching user's pet types
    const products = await Product.find({
      petType: { $in: petTypes },
      averageRating: { $gte: 4 }
    })
      .sort('-averageRating')
      .limit(10)
      .populate('seller', 'name');

    res.json(products);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ message: error.message });
  }
}); 