const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    subcategories: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Static method to get all departments with subcategories
departmentSchema.statics.getAllDepartments = async function() {
    try {
        const departments = await this.find({ isActive: true })
            .select('name description subcategories')
            .sort({ name: 1 });
        
        return departments.map(dept => ({
            _id: dept._id,
            name: dept.name,
            description: dept.description,
            subcategories: dept.subcategories
        }));
    } catch (error) {
        throw error;
    }
};

// Static method to get subcategories for a specific department
departmentSchema.statics.getSubcategories = async function(departmentName) {
    try {
        const department = await this.findOne({ 
            name: departmentName, 
            isActive: true 
        }).select('subcategories');
        
        return department ? department.subcategories : [];
    } catch (error) {
        throw error;
    }
};

// Static method to add subcategory to department
departmentSchema.statics.addSubcategory = async function(departmentId, subcategory) {
    try {
        const department = await this.findById(departmentId);
        if (!department) {
            throw new Error('Department not found');
        }
        
        if (!department.subcategories.includes(subcategory)) {
            department.subcategories.push(subcategory);
            await department.save();
        }
        
        return department;
    } catch (error) {
        throw error;
    }
};

// Static method to remove subcategory from department
departmentSchema.statics.removeSubcategory = async function(departmentId, subcategory) {
    try {
        const department = await this.findById(departmentId);
        if (!department) {
            throw new Error('Department not found');
        }
        
        department.subcategories = department.subcategories.filter(sub => sub !== subcategory);
        await department.save();
        
        return department;
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('Department', departmentSchema);
