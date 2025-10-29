const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
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
  field: {
    type: String,
    enum: ['Engineering', 'Medicine', 'Business', 'Arts', 'Science', 'Technology', 'Education', 'Law', 'Other'],
    default: 'Other'
  },
  level: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'Post Graduate', 'Doctorate', 'Certificate', 'Other'],
    default: 'Graduate'
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
specializationSchema.index({ field: 1 });
specializationSchema.index({ level: 1 });
specializationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Specialization', specializationSchema);
