const Community = require('../models/Community');
const CommunityChat = require('../models/CommunityChat');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new community
exports.createCommunity = catchAsync(async (req, res, next) => {
  const { name, description, rules, isPrivate } = req.body;
  
  const community = await Community.create({
    name,
    description,
    rules: rules || [],
    isPrivate: isPrivate || false,
    creator: req.user._id,
    members: [req.user._id],
    moderators: [req.user._id],
    image: req.file ? `/uploads/communities/${req.file.filename}` : ''
  });

  res.status(201).json({
    status: 'success',
    data: community
  });
});

// Get all communities
exports.getAllCommunities = catchAsync(async (req, res, next) => {
  const communities = await Community.find()
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: communities
  });
});

// Get a single community
exports.getCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('moderators', 'name email');

  if (!community) {
    return next(new AppError('Community not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: community
  });
});

// Join a community
exports.joinCommunity = catchAsync(async (req, res, next) => {
  console.log('Join request for community:', req.params.id, 'by user:', req.user._id);
  
  const community = await Community.findById(req.params.id);
  console.log('Found community:', community ? 'yes' : 'no');

  if (!community) {
    return next(new AppError('Community not found', 404));
  }

  // Check if user is already a member
  const isAlreadyMember = community.members.some(
    member => member.toString() === req.user._id.toString()
  );
  console.log('Is already member:', isAlreadyMember);

  if (isAlreadyMember) {
    return next(new AppError('You are already a member of this community', 400));
  }

  // Add member using MongoDB update operator
  const updatedCommunity = await Community.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { members: req.user._id }
    },
    { 
      new: true,
      runValidators: true
    }
  ).populate('members', 'name email');

  console.log('Updated community members:', updatedCommunity.members);

  res.status(200).json({
    status: 'success',
    data: updatedCommunity
  });
});

// Leave a community
exports.leaveCommunity = catchAsync(async (req, res, next) => {
  console.log('Leave request for community:', req.params.id, 'by user:', req.user._id);
  
  const community = await Community.findById(req.params.id);
  console.log('Found community:', community ? 'yes' : 'no');

  if (!community) {
    return next(new AppError('Community not found', 404));
  }

  // Check if user is a member
  const isMember = community.members.some(
    member => member.toString() === req.user._id.toString()
  );
  console.log('Is member:', isMember);

  if (!isMember) {
    return next(new AppError('You are not a member of this community', 400));
  }

  // Check if user is the creator
  const isCreator = community.creator.toString() === req.user._id.toString();
  console.log('Is creator:', isCreator);

  if (isCreator) {
    return next(new AppError('Community creator cannot leave the community', 400));
  }

  // Remove member using MongoDB update operator
  const updatedCommunity = await Community.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { 
        members: req.user._id,
        moderators: req.user._id
      }
    },
    { 
      new: true,
      runValidators: true
    }
  ).populate('members', 'name email');

  console.log('Updated community members:', updatedCommunity.members);

  res.status(200).json({
    status: 'success',
    data: updatedCommunity
  });
});

// Update community
exports.updateCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(new AppError('Community not found', 404));
  }

  if (community.creator.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this community', 403));
  }

  const updatedCommunity = await Community.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      image: req.file ? `/uploads/communities/${req.file.filename}` : community.image
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedCommunity
  });
});

// Delete community
exports.deleteCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(new AppError('Community not found', 404));
  }

  if (community.creator.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this community', 403));
  }

  await community.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 