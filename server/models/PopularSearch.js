const mongoose = require('mongoose');

const popularSearchSchema = new mongoose.Schema({
  searchQuery: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  searchCategory: {
    type: String,
    enum: ['job', 'fresher', 'work-from-home', 'part-time', 'full-time', 'women', 'remote', 'hybrid', 'internship', 'contract'],
    default: 'job'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'briefcase-outline'
  },
  color: {
    type: String,
    default: '#4A90E2'
  },
  // Search parameters for navigation
  searchParams: {
    search: String,
    location: String,
    jobType: String,
    workMode: String,
    experience: String,
    skills: [String]
  },
  // Analytics
  clickCount: {
    type: Number,
    default: 0
  },
  searchCount: {
    type: Number,
    default: 0
  },
  // Display settings
  trendingRank: {
    type: Number,
    default: 0
  },
  enabled: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
popularSearchSchema.index({ enabled: 1, order: 1, trendingRank: -1 });
popularSearchSchema.index({ searchCategory: 1, enabled: 1 });

// Static method to get popular searches
popularSearchSchema.statics.getPopularSearches = async function(limit = 10) {
  return await this.find({ enabled: true })
    .sort({ trendingRank: -1, order: 1, clickCount: -1 })
    .limit(parseInt(limit))
    .lean();
};

// Static method to increment click count
popularSearchSchema.statics.incrementClickCount = async function(searchQuery) {
  await this.updateOne(
    { searchQuery },
    { $inc: { clickCount: 1 } }
  );
};

// Static method to increment search count
popularSearchSchema.statics.incrementSearchCount = async function(searchQuery) {
  await this.updateOne(
    { searchQuery },
    { $inc: { searchCount: 1 } }
  );
};

// Static method to update trending ranks based on recent activity
popularSearchSchema.statics.updateTrendingRanks = async function() {
  const searches = await this.find({ enabled: true })
    .sort({ searchCount: -1, clickCount: -1 })
    .lean();
  
  // Update ranks based on activity
  for (let i = 0; i < searches.length; i++) {
    await this.updateOne(
      { _id: searches[i]._id },
      { $set: { trendingRank: i + 1 } }
    );
  }
};

module.exports = mongoose.model('PopularSearch', popularSearchSchema);

