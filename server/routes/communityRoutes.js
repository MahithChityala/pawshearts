const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const communityController = require('../controllers/communityController');

// Validation middleware
const createCommunityValidation = [
  check('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  check('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  check('category')
    .isIn([
      'Pets',
      'Dogs',
      'Cats',
      'Birds',
      'Fish',
      'Reptiles',
      'Small Animals',
      'Wildlife',
      'Pet Care',
      'Pet Training',
      'Pet Health',
      'Pet Adoption',
      'Pet Rescue',
      'Pet Events',
      'Pet Products',
      'Other'
    ])
    .withMessage('Invalid community category'),
  check('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  check('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateCommunityValidation = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  check('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  check('category')
    .optional()
    .isIn([
      'Pets',
      'Dogs',
      'Cats',
      'Birds',
      'Fish',
      'Reptiles',
      'Small Animals',
      'Wildlife',
      'Pet Care',
      'Pet Training',
      'Pet Health',
      'Pet Adoption',
      'Pet Rescue',
      'Pet Events',
      'Pet Products',
      'Other'
    ])
    .withMessage('Invalid community category'),
  check('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  check('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Routes
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  createCommunityValidation,
  communityController.createCommunity
);

router.get('/:id', auth, communityController.getCommunity);

router.put(
  '/:id',
  auth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateCommunityValidation,
  communityController.updateCommunity
);

router.delete('/:id', auth, communityController.deleteCommunity);

// Member management routes
router.post('/:id/join', auth, communityController.joinCommunity);
router.post('/:id/leave', auth, communityController.leaveCommunity);
router.put('/:id/members/:userId/role', auth, communityController.updateMemberRole);

// Community posts routes
router.get('/:id/posts', auth, communityController.getCommunityPosts);
router.post('/:id/posts', auth, communityController.createCommunityPost);
router.put('/:id/posts/:postId', auth, communityController.updateCommunityPost);
router.delete('/:id/posts/:postId', auth, communityController.deleteCommunityPost);

// Community chat routes
router.get('/:id/chat', auth, communityController.getCommunityChat);
router.post('/:id/chat', auth, communityController.sendCommunityMessage);

module.exports = router; 