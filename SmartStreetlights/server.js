const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');  // ✅ Cookie Parser for JWT
const jwt = require('jsonwebtoken');            // ✅ JWT for authentication

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // ✅ Use cookie-parser middleware

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Import models once at the top
const Fault = require('./models/Fault');

// ✅ Import auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);              

// ✅ JWT Middleware to Verify Token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];

    if (!token) {
        return res.status(403).send('❌ Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('❌ Invalid token.');
    }
};

// ✅ Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

// ✅ Secure Dashboard Route
app.get('/dashboard', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/dashboard.html'));
});

// ✅ Step 1: Route to Fetch Fault Reports for Dashboard
app.get('/api/faults', async (req, res) => {
    try {
        const faults = await Fault.find().sort({ reportedAt: -1 });
        res.json(faults);
    } catch (error) {
        console.error('❌ Error fetching faults:', error);
        res.status(500).send('Error retrieving fault reports');
    }
});

// ✅ QR Fault Report Form Submission
app.post('/report-fault', async (req, res) => {
    const { streetlightID, faultType, description } = req.body;

    if (!streetlightID || !faultType || !description) {
        return res.status(400).send('❌ All fields are required!');
    }

    const newFault = new Fault({ streetlightID, faultType, description });

    try {
        await newFault.save();
        res.status(201).send('✅ Fault reported successfully!');
    } catch (error) {
        console.error('❌ MongoDB Insert Error:', error);
        res.status(500).send('Error reporting fault');
    }
});

// ✅ Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
