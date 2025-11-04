const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['company', 'consultancy', 'individual', 'freelancer'],
    required: true
  },
  companyType: {
    type: String,
    enum: [
      'Educational',
      'Non-profit (NGO)',
      'Freelancer',
      'Individual/Self Employed',
      'Foundation/Trust',
      'Government Agency',
      'Partnership',
      'Sole Proprietorship',
      'Public Limited Company',
      'Private Limited Company',
      'Limited Liability Partnership (LLP)'
    ],
    required: function() {
      return ['company', 'consultancy'].includes(this.userType);
    }
  },
  documents: {
    // Company/Consultancy Documents
    gstCertificate: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    certificateOfIncorporation: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    udyamMsmeCertificate: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    companyPanCard: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    companyIdCard: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    otherDocument: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    // Individual/Freelancer Documents
    aadharCard: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    panCard: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    voterId: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    },
    otherIdDocument: {
      idNumber: {
        type: String,
        trim: true
      },
      documentUrl: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date
      }
    }
  },
  submissionStatus: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'verified', 'rejected'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
// Note: userId already has an index from unique: true
kycSchema.index({ submissionStatus: 1 });
kycSchema.index({ userType: 1 });

// Method to check if KYC is complete based on user type
kycSchema.methods.checkCompleteness = function() {
  const { userType, documents } = this;
  
  if (userType === 'company' || userType === 'consultancy') {
    // Check if at least one company document is uploaded
    const companyDocs = [
      documents.gstCertificate,
      documents.certificateOfIncorporation,
      documents.udyamMsmeCertificate,
      documents.companyPanCard,
      documents.companyIdCard,
      documents.otherDocument
    ];
    
    return companyDocs.some(doc => doc && doc.documentUrl && doc.documentUrl.trim() !== '');
  } else if (userType === 'individual' || userType === 'freelancer') {
    // Check if at least one individual document is uploaded
    const individualDocs = [
      documents.aadharCard,
      documents.panCard,
      documents.voterId,
      documents.otherIdDocument
    ];
    
    return individualDocs.some(doc => doc && doc.documentUrl && doc.documentUrl.trim() !== '');
  }
  
  return false;
};

// Method to get required documents based on user type
kycSchema.methods.getRequiredDocuments = function() {
  const { userType } = this;
  
  if (userType === 'company' || userType === 'consultancy') {
    return [
      { key: 'gstCertificate', name: 'GST Certificate', required: false },
      { key: 'certificateOfIncorporation', name: 'Certificate Of Incorporation', required: false },
      { key: 'udyamMsmeCertificate', name: 'UDYAM / MSME Certificate', required: false },
      { key: 'companyPanCard', name: 'Company PAN Card', required: false },
      { key: 'companyIdCard', name: 'Company ID Card', required: false },
      { key: 'otherDocument', name: 'Other Document', required: false }
    ];
  } else if (userType === 'individual' || userType === 'freelancer') {
    return [
      { key: 'aadharCard', name: 'Aadhar Card', required: false },
      { key: 'panCard', name: 'PAN Card', required: false },
      { key: 'voterId', name: 'Voter ID', required: false },
      { key: 'otherIdDocument', name: 'Other Document', required: false }
    ];
  }
  
  return [];
};

// Static method to get KYC statistics
kycSchema.statics.getKYCStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$submissionStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    verified: 0,
    rejected: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('KYC', kycSchema);
