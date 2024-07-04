const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    otherDetails: {
        type: String // Adjust the type as per your actual data
    },
    profileVerified: {
        type: Boolean,
        default: false // Default to false indicating profile is not verified
    },
    role: {
        type: String,
        enum: ['counselor', 'admin'],
        default: 'counselor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

const Counselor = mongoose.model("Counselor", counselorSchema);
module.exports = Counselor;
