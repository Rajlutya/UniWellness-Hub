const mongoose = require("mongoose");

const supportRequestSchema = new mongoose.Schema({
    issue: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    history: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register', // Reference to the Register model
        required: true
    },
    counsellor: {
        type: String,
    },
    prescription: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
    // Add more fields as needed for your support request
});

const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);

module.exports = SupportRequest;
