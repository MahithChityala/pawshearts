const express = require('express');
const router = express.Router();
const communityChatController = require('../controllers/communityChatController');
const auth = require('../middleware/auth');
const { uploadMultipleImages } = require('../middleware/uploadMiddleware');

router.post('/', auth, uploadMultipleImages, communityChatController.createMessage);
router.get('/community/:communityId', auth, communityChatController.getCommunityMessages);
router.post('/:messageId/reply', auth, communityChatController.addReply);
router.post('/:messageId/like', auth, communityChatController.toggleLike);
router.delete('/:messageId', auth, communityChatController.deleteMessage);

module.exports = router; 