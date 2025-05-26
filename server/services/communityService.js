const Community = require('../models/Community');
const User = require('../models/User');
const Message = require('../models/Message');
const Post = require('../models/Post');

const communityService = {
  // Create a new community
  async createCommunity(data, creatorId) {
    const community = new Community({
      ...data,
      creator: creatorId
    });

    await community.save();

    // Add community to creator's joined communities
    await User.findByIdAndUpdate(creatorId, {
      $push: { joinedCommunities: community._id }
    });

    return community;
  },

  // Get community by ID with populated data
  async getCommunityById(id) {
    return await Community.findById(id)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar');
  },

  // Update community
  async updateCommunity(id, data, userId) {
    const community = await Community.findById(id);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isAdmin(userId)) {
      throw new Error('Not authorized to update this community');
    }

    Object.assign(community, data);
    await community.save();

    return community;
  },

  // Delete community
  async deleteCommunity(id, userId) {
    const community = await Community.findById(id);

    if (!community) {
      throw new Error('Community not found');
    }

    if (community.creator.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this community');
    }

    // Remove community from all members' joined communities
    await User.updateMany(
      { joinedCommunities: community._id },
      { $pull: { joinedCommunities: community._id } }
    );

    // Delete all community messages
    await Message.deleteMany({ community: community._id });

    // Delete all community posts
    await Post.deleteMany({ community: community._id });

    await community.remove();
  },

  // Join community
  async joinCommunity(communityId, userId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (community.isMember(userId)) {
      throw new Error('Already a member of this community');
    }

    await community.addMember(userId);

    // Add community to user's joined communities
    await User.findByIdAndUpdate(userId, {
      $push: { joinedCommunities: community._id }
    });

    return community;
  },

  // Leave community
  async leaveCommunity(communityId, userId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isMember(userId)) {
      throw new Error('Not a member of this community');
    }

    if (community.creator.toString() === userId.toString()) {
      throw new Error('Creator cannot leave the community');
    }

    await community.removeMember(userId);

    // Remove community from user's joined communities
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedCommunities: community._id }
    });

    return community;
  },

  // Update member role
  async updateMemberRole(communityId, memberId, newRole, userId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isAdmin(userId)) {
      throw new Error('Not authorized to update member roles');
    }

    if (community.creator.toString() === memberId.toString()) {
      throw new Error('Cannot change creator\'s role');
    }

    await community.updateMemberRole(memberId, newRole);
    return community;
  },

  // Get community posts
  async getCommunityPosts(communityId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ community: communityId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('likes', 'username')
      .populate('comments.author', 'username avatar');

    const total = await Post.countDocuments({ community: communityId });

    return {
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  },

  // Create community post
  async createCommunityPost(communityId, data, authorId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isMember(authorId)) {
      throw new Error('Must be a member to create posts');
    }

    const post = new Post({
      ...data,
      community: communityId,
      author: authorId
    });

    await post.save();
    return post;
  },

  // Get community chat messages
  async getCommunityChat(communityId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ community: communityId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar');

    const total = await Message.countDocuments({ community: communityId });

    return {
      messages,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  },

  // Send community message
  async sendCommunityMessage(communityId, data, senderId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isMember(senderId)) {
      throw new Error('Must be a member to send messages');
    }

    const message = new Message({
      ...data,
      community: communityId,
      sender: senderId
    });

    await message.save();

    // Update community's last activity
    community.lastActivity = Date.now();
    await community.save();

    return message;
  }
};

module.exports = communityService; 