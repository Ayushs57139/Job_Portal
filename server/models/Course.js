const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
  duration: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['Certificate', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate', 'Other'],
    default: 'Certificate'
  },
  category: {
    type: String,
    enum: ['Technical', 'Management', 'Arts', 'Science', 'Commerce', 'Engineering', 'Medical', 'Education', 'Law', 'Other'],
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
courseSchema.index({ level: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isActive: 1 });

module.exports = mongoose.model('Course', courseSchema);
