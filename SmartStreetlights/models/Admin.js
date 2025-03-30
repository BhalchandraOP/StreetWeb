const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Hash the password before saving
adminSchema.pre('save', async function (next) {
    const admin = this;
    if (!admin.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;

// ✅ Explanation:

// Schema Fields:

// username: Admin’s username

// password: Admin’s hashed password

// Password Hashing:

// Uses bcrypt to hash the password before saving it to MongoDB.

