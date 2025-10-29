const mongoose = require('mongoose');

const jobKeySkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Soft Skills', 'Language', 'Certification', 'Other'],
    default: 'Technical'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better performance
jobKeySkillSchema.index({ category: 1 });
jobKeySkillSchema.index({ isActive: 1 });

module.exports = mongoose.model('JobKeySkill', jobKeySkillSchema);
