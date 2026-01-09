const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/', (req, res) => {
    res.send('Dental Clinic Management API is running');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/chart', require('./routes/chart'));
app.use('/api/lookups', require('./routes/lookups'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/lab-cases', require('./routes/labCases'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/uploads', express.static('uploads'));
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
