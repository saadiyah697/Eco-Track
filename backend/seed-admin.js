const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User'); // Ensures it connects to your User schema

async function seedAdmin() {
    try {
        // Connect to MongoDB using your existing .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database. Checking for Admin...');

        // Check if an admin already exists to prevent duplicates
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Master Admin already exists in the system.');
            process.exit();
        }

        // Encrypt the Master Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('AdminSecure2026', salt);

        // Create the Admin Profile
        const masterAdmin = new User({
            fullName: 'Super Admin',
            email: 'admin@ecotrack.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Save to Database
        await masterAdmin.save();
        console.log('====================================');
        console.log('✅ MASTER ADMIN CREATED SUCCESSFULLY');
        console.log('Email: admin@ecotrack.com');
        console.log('Password: AdminSecure2026');
        console.log('====================================');
        process.exit();

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();