const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET all departments with categories and subcategories
router.get('/', async (req, res) => {
    try {
        const departments = await Department.getAllDepartments();
        res.status(200).json({ 
            success: true, 
            data: departments,
            message: 'Departments retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: 'Failed to fetch departments'
        });
    }
});

// GET all department categories only
router.get('/categories', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select('name').sort({ name: 1 });
        res.status(200).json({ 
            success: true, 
            data: departments.map(dept => dept.name),
            message: 'Department categories retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching department categories:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: 'Failed to fetch department categories'
        });
    }
});

// GET subcategories for a specific department
router.get('/:departmentName/subcategories', async (req, res) => {
    try {
        const { departmentName } = req.params;
        const subcategories = await Department.getSubcategories(departmentName);
        
        res.status(200).json({ 
            success: true, 
            data: {
                department: departmentName,
                subcategories: subcategories
            },
            message: 'Subcategories retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: 'Failed to fetch subcategories'
        });
    }
});

// GET specific department with all details
router.get('/:departmentName', async (req, res) => {
    try {
        const { departmentName } = req.params;
        const department = await Department.findOne({ 
            name: departmentName, 
            isActive: true 
        }).select('name subcategories');
        
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                error: 'Department not found',
                message: `Department '${departmentName}' not found`
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: department,
            message: 'Department retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error',
            message: 'Failed to fetch department'
        });
    }
});

// POST new department
router.post('/', async (req, res) => {
    try {
        const { name, description = '', subcategories = [] } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required and must be at least 2 characters'
            });
        }
        
        const department = new Department({
            name: name.trim(),
            description: description.trim(),
            subcategories: subcategories.map(sub => sub.trim()).filter(sub => sub),
            isActive: true
        });
        
        await department.save();
        
        res.status(201).json({
            success: true,
            data: department,
            message: 'Department added successfully'
        });
    } catch (error) {
        console.error('Error adding department:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding department',
            error: error.message
        });
    }
});

// PUT update department
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, subcategories, isActive } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required and must be at least 2 characters'
            });
        }
        
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        department.name = name.trim();
        department.description = description ? description.trim() : department.description;
        department.subcategories = subcategories ? subcategories.map(sub => sub.trim()).filter(sub => sub) : department.subcategories;
        department.isActive = isActive !== undefined ? isActive : department.isActive;
        
        await department.save();
        
        res.status(200).json({
            success: true,
            data: department,
            message: 'Department updated successfully'
        });
    } catch (error) {
        console.error('Error updating department:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
});

// DELETE department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Soft delete by setting isActive to false
        department.isActive = false;
        await department.save();
        
        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
});

// POST add subcategory to department
router.post('/:id/subcategories', async (req, res) => {
    try {
        const { id } = req.params;
        const { subcategory } = req.body;
        
        if (!subcategory || subcategory.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required and must be at least 2 characters'
            });
        }
        
        const department = await Department.addSubcategory(id, subcategory.trim());
        
        res.status(200).json({
            success: true,
            data: department,
            message: 'Subcategory added successfully'
        });
    } catch (error) {
        console.error('Error adding subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding subcategory',
            error: error.message
        });
    }
});

// DELETE subcategory from department
router.delete('/:id/subcategories/:subcategory', async (req, res) => {
    try {
        const { id, subcategory } = req.params;
        
        const department = await Department.removeSubcategory(id, decodeURIComponent(subcategory));
        
        res.status(200).json({
            success: true,
            data: department,
            message: 'Subcategory removed successfully'
        });
    } catch (error) {
        console.error('Error removing subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing subcategory',
            error: error.message
        });
    }
});

module.exports = router;
