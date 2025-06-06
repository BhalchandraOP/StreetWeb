const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ✅ Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;  // <-- Ensure these field names match

    if (!email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "✅ User registered successfully" });
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

// ✅ Login Route
// ✅ Simplified Login Route (Only Email & Password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '❌ All fields are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: '❌ Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: '❌ Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            token,
            message: '✅ Login successful'
        });
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ message: '❌ Server error' });
    }
});


module.exports = router;
