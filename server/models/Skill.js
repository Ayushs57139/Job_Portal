const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'Technology', 'Programming', 'Design', 'Marketing', 'Sales', 'Management',
      'Communication', 'Analytics', 'Engineering', 'Healthcare', 'Finance',
      'Operations', 'Customer Service', 'Human Resources', 'Legal', 'Education',
      'Creative', 'Language', 'Soft Skills', 'Hardware', 'Other'
    ],
    default: 'Other'
  },
  skillType: {
    type: String,
    enum: ['Technical', 'Soft', 'Language', 'Certification', 'Tool', 'Framework'],
    default: 'Technical'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usageCount: {
    type: Number,
    default: 1
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for text search
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Static method to search skills
skillSchema.statics.searchSkills = function(query, limit = 10) {
  return this.find(
    { 
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }
  )
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Static method to add or update skill
skillSchema.statics.addOrUpdateSkill = function(name, category = 'Other', skillType = 'Technical', addedBy = null, description = '', tags = []) {
  return this.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${name}$`, 'i') } },
    {
      $set: {
        name: name,
        category: category,
        skillType: skillType,
        addedBy: addedBy,
        description: description,
        tags: tags,
        lastUsed: new Date()
      },
      $inc: { usageCount: 1 }
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

// Static method to get popular skills
skillSchema.statics.getPopularSkills = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

// Static method to get skills by category
skillSchema.statics.getSkillsByCategory = function(category, limit = 50) {
  return this.find({ isActive: true, category: category })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit);
};

module.exports = mongoose.model('Skill', skillSchema);
