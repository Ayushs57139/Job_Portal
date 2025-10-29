const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
sectorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get all sectors
sectorSchema.statics.getAllSectors = async function() {
  try {
    return await this.find({ isActive: true }).sort({ name: 1 });
  } catch (error) {
    throw error;
  }
};

// Static method to get sectors by industry
sectorSchema.statics.getSectorsByIndustry = async function(industry) {
  try {
    return await this.find({ 
      industry: industry, 
      isActive: true 
    }).sort({ name: 1 });
  } catch (error) {
    throw error;
  }
};

// Static method to add or update sector
sectorSchema.statics.addOrUpdateSector = async function(name, industry, description = '') {
  try {
    const sector = await this.findOne({ name: name.trim() });
    
    if (sector) {
      // Update existing sector
      sector.industry = industry;
      sector.description = description;
      sector.updatedAt = Date.now();
      await sector.save();
      return sector;
    } else {
      // Create new sector
      const newSector = new this({
        name: name.trim(),
        industry: industry,
        description: description
      });
      await newSector.save();
      return newSector;
    }
  } catch (error) {
    throw error;
  }
};

// Static method to search sectors
sectorSchema.statics.searchSectors = async function(query, limit = 10) {
  try {
    const regex = new RegExp(query, 'i');
    return await this.find({
      $or: [
        { name: regex },
        { industry: regex },
        { description: regex }
      ],
      isActive: true
    })
    .sort({ name: 1 })
    .limit(limit);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Sector', sectorSchema);
