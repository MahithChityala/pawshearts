const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');

router.post('/', auth, uploadSingleImage, communityController.createCommunity);
router.get('/', communityController.getAllCommunities);
router.get('/:id', communityController.getCommunity);
router.post('/:id/join', auth, communityController.joinCommunity);
router.post('/:id/leave', auth, communityController.leaveCommunity);
router.patch('/:id', auth, uploadSingleImage, communityController.updateCommunity);
router.delete('/:id', auth, communityController.deleteCommunity);

module.exports = router; 