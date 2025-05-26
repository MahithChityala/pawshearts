const CommunityChat = require('../models/CommunityChat');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new chat message in a community
exports.createMessage = catchAsync(async (req, res, next) => {
  const { communityId, message } = req.body;
  if (!communityId || !message) {
    return next(new AppError('Community ID and message are required', 400));
  }

  // Handle attachments if any
  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map(file => `/uploads/communities/${file.filename}`);
  } else if (req.file) {
    attachments = [`/uploads/communities/${req.file.filename}`];
  }

  const newMessage = await CommunityChat.create({
    community: communityId,
    sender: req.user._id,
    message,
    attachments,
    likes: [],
    replies: []
  });

  await newMessage.populate('sender', 'name profileImage');

  res.status(201).json({
    status: 'success',
    data: newMessage
  });
});

// Get all messages for a community
exports.getCommunityMessages = catchAsync(async (req, res, next) => {
  const messages = await CommunityChat.find({ community: req.params.communityId })
    .populate('sender', 'name profileImage')
    .populate('replies.sender', 'name profileImage')
    .sort('createdAt');

  res.status(200).json({
    status: 'success',
    data: messages
  });
});

// Add a reply to a message
exports.addReply = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', message: 'Reply added (stub)' });
});

// Toggle like on a message
exports.toggleLike = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', message: 'Like toggled (stub)' });
});

// Delete a message
exports.deleteMessage = catchAsync(async (req, res, next) => {
  res.status(204).json({ status: 'success', message: 'Message deleted (stub)' });
}); 