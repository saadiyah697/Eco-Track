const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Imports the model we made earlier
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role, driverId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: role || 'user', // Defaults to user if no role is sent
            driverId: role === 'driver' ? driverId : undefined
        });

        await newUser.save();
        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Send back the token and the role for frontend routing
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                driverId: user.driverId
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during login' });
    }
});

// 3. GOOGLE LOGIN ROUTE
router.post('/google', async (req, res) => {
    try {
        const { token, role } = req.body;

        // Verify the token with Google's servers
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Check if user already exists in our database
        let user = await User.findOne({ email });

    if (!user) {
            // If they don't exist, create a new account automatically
            const randomPassword = Math.random().toString(36).slice(-10) + "Aa1!";
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            // Generate a temporary Driver ID if a driver uses Google to sign up
            const autoDriverId = role === 'driver' ? `FLT-G${Math.floor(1000 + Math.random() * 9000)}` : undefined;

            user = new User({
                fullName: name,
                email: email,
                password: hashedPassword,
                role: role || 'user',
                driverId: autoDriverId // 👇 THIS IS THE FIX 👇
            });
            await user.save();
        }

        // Generate our own JWT Token for the session
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Google Login successful',
            token: jwtToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                driverId: user.driverId
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Google Authentication Failed' });
    }
});

module.exports = router;