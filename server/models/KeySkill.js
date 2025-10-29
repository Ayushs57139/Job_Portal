const mongoose = require('mongoose');

const keySkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        default: 'Key Skills'
    },
    skillType: {
        type: String,
        enum: ['Technical', 'Soft Skills', 'Industry Specific', 'Tools & Software', 'Languages', 'Certifications', 'Other'],
        default: 'Technical'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    tags: [{
        type: String,
        trim: true
    }],
    relatedSkills: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for text search
keySkillSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Static method to get all key skills
keySkillSchema.statics.getAllKeySkills = async function() {
    try {
        const skills = await this.find({ isActive: true })
            .select('name category skillType')
            .sort({ name: 1 });
        
        return skills.map(skill => ({
            name: skill.name,
            category: skill.category,
            skillType: skill.skillType
        }));
    } catch (error) {
        throw error;
    }
};

// Static method to search key skills
keySkillSchema.statics.searchKeySkills = function(query, limit = 50) {
    return this.find({
        isActive: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit);
};

// Static method to get popular key skills
keySkillSchema.statics.getPopularKeySkills = function(limit = 20) {
    return this.find({ isActive: true, isVerified: true })
        .sort({ usageCount: -1, lastUsed: -1 })
        .limit(limit);
};

// Static method to get key skills by category
keySkillSchema.statics.getKeySkillsByCategory = function(category, limit = 100) {
    return this.find({ isActive: true, category: category })
        .sort({ usageCount: -1, name: 1 })
        .limit(limit);
};

// Static method to get key skills by type
keySkillSchema.statics.getKeySkillsByType = function(skillType, limit = 100) {
    return this.find({ isActive: true, skillType: skillType })
        .sort({ usageCount: -1, name: 1 })
        .limit(limit);
};

// Static method to add or update key skill
keySkillSchema.statics.addOrUpdateKeySkill = function(name, category = 'Key Skills', skillType = 'Technical', addedBy = null, description = '', tags = []) {
    return this.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        {
            $set: {
                name: name,
                category: category,
                skillType: skillType,
                createdBy: addedBy,
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

// Static method to get suggestions (10-12 skills)
keySkillSchema.statics.getSuggestions = function(query = '', limit = 12) {
    const searchQuery = query ? {
        isActive: true,
        name: { $regex: query, $options: 'i' }
    } : { isActive: true };
    
    return this.find(searchQuery)
        .sort({ usageCount: -1, name: 1 })
        .limit(limit);
};

module.exports = mongoose.model('KeySkill', keySkillSchema);
