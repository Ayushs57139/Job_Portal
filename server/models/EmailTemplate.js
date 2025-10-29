const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['job_apply_invite', 'employer_confirmation', 'employer_welcome', 'jobseeker_welcome', 'company_welcome', 'consultancy_welcome'],
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: false
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    example: {
      type: String,
      required: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
emailTemplateSchema.index({ type: 1, isActive: 1 });
emailTemplateSchema.index({ isDefault: 1, type: 1 });

// Static method to get active template by type
emailTemplateSchema.statics.getActiveTemplate = async function(type) {
  const template = await this.findOne({ 
    type: type, 
    isActive: true 
  }).sort({ isDefault: -1, createdAt: -1 });
  
  if (!template) {
    throw new Error(`No active template found for type: ${type}`);
  }
  
  return template;
};

// Static method to get default template by type
emailTemplateSchema.statics.getDefaultTemplate = async function(type) {
  const template = await this.findOne({ 
    type: type, 
    isDefault: true 
  });
  
  if (!template) {
    throw new Error(`No default template found for type: ${type}`);
  }
  
  return template;
};

// Method to increment usage count
emailTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Method to render template with variables
emailTemplateSchema.methods.render = function(variables = {}) {
  let htmlContent = this.htmlContent;
  let textContent = this.textContent || '';
  let subject = this.subject;
  
  // Replace variables in HTML content
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = variables[key] || '';
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return {
    subject,
    htmlContent,
    textContent
  };
};

// Pre-save middleware to ensure only one default template per type
emailTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other templates of the same type
    await this.constructor.updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
