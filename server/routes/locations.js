const express = require('express');
const router = express.Router();

// Mock data for locations - in a real application, this would come from a database
const locations = [
    { id: 1, city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'Metro' },
    { id: 2, city: 'Delhi', state: 'Delhi', country: 'India', type: 'Metro' },
    { id: 3, city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'Metro' },
    { id: 4, city: 'Chennai', state: 'Tamil Nadu', country: 'India', type: 'Metro' },
    { id: 5, city: 'Hyderabad', state: 'Telangana', country: 'India', type: 'Metro' },
    { id: 6, city: 'Pune', state: 'Maharashtra', country: 'India', type: 'Tier-1' },
    { id: 7, city: 'Kolkata', state: 'West Bengal', country: 'India', type: 'Metro' },
    { id: 8, city: 'Ahmedabad', state: 'Gujarat', country: 'India', type: 'Tier-1' },
    { id: 9, city: 'Jaipur', state: 'Rajasthan', country: 'India', type: 'Tier-1' },
    { id: 10, city: 'Surat', state: 'Gujarat', country: 'India', type: 'Tier-1' }
];

// GET all locations
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            data: locations,
            message: 'Locations retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
});

// POST new location
router.post('/', async (req, res) => {
    try {
        const { city, state, country, type } = req.body;
        
        if (!city || !state || !country) {
            return res.status(400).json({
                success: false,
                message: 'City, state, and country are required'
            });
        }
        
        const newLocation = {
            id: locations.length + 1,
            city,
            state,
            country,
            type: type || 'Other'
        };
        
        locations.push(newLocation);
        
        res.status(201).json({
            success: true,
            data: newLocation,
            message: 'Location added successfully'
        });
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding location',
            error: error.message
        });
    }
});

module.exports = router;
