const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Follow a user/company/consultancy
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { notifications } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine follow type
    let followType = 'user';
    if (userToFollow.userType === 'employer') {
      followType = userToFollow.employerType === 'company' ? 'company' : 'consultancy';
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: userId
    });

    if (existingFollow) {
      if (existingFollow.isActive) {
        return res.status(400).json({ message: 'Already following this user' });
      } else {
        // Reactivate follow
        existingFollow.isActive = true;
        if (notifications) {
          existingFollow.notifications = notifications;
        }
        await existingFollow.save();
        return res.json({
          message: 'Successfully followed',
          follow: existingFollow
        });
      }
    }

    // Create new follow
    const follow = new Follow({
      follower: req.user.id,
      following: userId,
      followType: followType,
      notifications: notifications || {
        jobPosts: true,
        socialUpdates: true,
        companyNews: true
      }
    });

    await follow.save();
    await follow.populate('following', 'firstName lastName profile.avatar userType employerType companyName consultancyName');

    res.status(201).json({
      message: 'Successfully followed',
      follow
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOne({
      follower: req.user.id,
      following: userId,
      isActive: true
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    follow.isActive = false;
    await follow.save();

    res.json({ message: 'Successfully unfollowed' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get followers
router.get('/followers', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({
      following: req.user.id,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('follower', 'firstName lastName profile.avatar userType employerType companyName consultancyName');

    const total = await Follow.countDocuments({
      following: req.user.id,
      isActive: true
    });

    res.json({
      followers: follows.map(f => f.follower),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get following
router.get('/following', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      follower: req.user.id,
      isActive: true
    };

    if (type) {
      query.followType = type;
    }

    const follows = await Follow.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('following', 'firstName lastName profile.avatar userType employerType companyName consultancyName');

    const total = await Follow.countDocuments(query);

    res.json({
      following: follows.map(f => ({
        user: f.following,
        followType: f.followType,
        notifications: f.notifications,
        followedAt: f.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if following
router.get('/is-following/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const isFollowing = await Follow.isFollowing(req.user.id, userId);
    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get follower/following counts
router.get('/counts/:userId?', auth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const [followerCount, followingCount] = await Promise.all([
      Follow.getFollowerCount(userId),
      Follow.getFollowingCount(userId)
    ]);

    res.json({
      followers: followerCount,
      following: followingCount
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification preferences
router.put('/notifications/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { notifications } = req.body;

    const follow = await Follow.findOne({
      follower: req.user.id,
      following: userId,
      isActive: true
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    follow.notifications = {
      ...follow.notifications,
      ...notifications
    };

    await follow.save();

    res.json({
      message: 'Notification preferences updated',
      notifications: follow.notifications
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
