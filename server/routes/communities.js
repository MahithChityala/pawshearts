const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');
const { uploadSingleImage, processUploadedFiles } = require('../middleware/uploadMiddleware');

// Create community
router.post('/', auth, uploadSingleImage, processUploadedFiles, communityController.createCommunity);

// Get all communities
router.get('/', communityController.getAllCommunities);

// Get single community
router.get('/:id', communityController.getCommunity);

// Update community
router.patch('/:id', auth, uploadSingleImage, processUploadedFiles, communityController.updateCommunity);

// Delete community
router.delete('/:id', auth, communityController.deleteCommunity);

// Join community
router.post('/:id/join', auth, communityController.joinCommunity);

// Leave community
router.post('/:id/leave', auth, communityController.leaveCommunity);

module.exports = router; 