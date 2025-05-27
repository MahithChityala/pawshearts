const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('ratings.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add rating to a user (business)
router.post('/:id/ratings', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const businessId = req.params.id;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    // Validate review
    if (!review || typeof review !== 'string' || review.trim().length === 0) {
      return res.status(400).json({ message: 'Review text is required' });
    }

    // Find the business user
    const business = await User.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user has already rated this business
    const existingRatingIndex = business.ratings.findIndex(
      r => r.userId && r.userId.toString() === userId
    );

    const newRating = {
      userId,
      rating,
      review: review.trim(),
      date: new Date()
    };

    if (existingRatingIndex > -1) {
      // Update existing rating
      business.ratings[existingRatingIndex] = newRating;
    } else {
      // Add new rating
      business.ratings.push(newRating);
    }

    // Calculate new average rating
    const totalRating = business.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    business.averageRating = totalRating / business.ratings.length;

    // Save the updated business
    await business.save();

    // Get the user details for the response
    const userDetails = await User.findById(userId).select('name profilePicture');

    // Return the new rating with user details
    const populatedRating = {
      _id: newRating._id || new Date().getTime(), // Temporary ID if not set
      userId: {
        _id: userId,
        name: userDetails.name,
        profilePicture: userDetails.profilePicture
      },
      rating: newRating.rating,
      review: newRating.review,
      date: newRating.date,
      averageRating: business.averageRating
    };

    // Get all ratings with populated user details
    const populatedRatings = await Promise.all(
      business.ratings.map(async (r) => {
        const user = await User.findById(r.userId).select('name profilePicture');
        return {
          ...r.toObject(),
          userId: {
            _id: r.userId,
            name: user.name,
            profilePicture: user.profilePicture
          }
        };
      })
    );

    res.json({
      ratings: populatedRatings,
      averageRating: business.averageRating
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 