const mongoose = require('mongoose');

const faultSchema = new mongoose.Schema({
    streetlightID: {
        type: String,
        required: true
    },
    faultType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reportedAt: {              // Timestamp field for better tracking
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Fault', faultSchema);
