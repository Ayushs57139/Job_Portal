const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, trim: true, default: 'India' },
  type: { type: String, enum: ['Metro', 'Tier-1', 'Tier-2', 'Tier-3', 'Other'], default: 'Other' },
  pincode: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

LocationSchema.index({ city: 1, state: 1 }, { unique: true });
LocationSchema.index({ city: 'text', state: 'text' });

module.exports = mongoose.model('Location', LocationSchema);
