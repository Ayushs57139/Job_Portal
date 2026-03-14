const mongoose = require('mongoose');

const candidateSearchHistorySchema = new mongoose.Schema({
    searcherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    searcherType: {
        type: String,
        enum: ['admin', 'company', 'consultancy'],
        required: true,
        index: true
    },
    candidateIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile',
        required: true
    }],
    searchFilters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    searchKeywords: {
        type: String,
        default: ''
    },
    totalResults: {
        type: Number,
        default: 0
    },
    searchedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
candidateSearchHistorySchema.index({ searcherId: 1, searcherType: 1, searchedAt: -1 });
candidateSearchHistorySchema.index({ searchedAt: -1 });

module.exports = mongoose.model('CandidateSearchHistory', candidateSearchHistorySchema);

