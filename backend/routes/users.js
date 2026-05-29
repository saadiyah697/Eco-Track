const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Imports your User model

// 1. GET ROUTE: Fetch all users for the Admin Dashboard
router.get('/', async (req, res) => {
    try {
        // Fetch all users, excluding passwords for security
        const users = await User.find().select('-password'); 
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server error while fetching users" });
    }
});

// 2. PATCH ROUTE: Update User Status (Suspend / Activate)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        // Find the user by ID and update their status
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: `User status successfully updated to ${status}`, user: updatedUser });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: "Server error while updating status" });
    }
});

module.exports = router;