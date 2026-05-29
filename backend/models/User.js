const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'driver', 'admin'],
        default: 'user' // Defaults to a standard user unless specified otherwise
    },
    // Optional: Fields specific to drivers
    driverId: {
        type: String,
        required: function() { return this.role === 'driver'; }
    },
    points: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);