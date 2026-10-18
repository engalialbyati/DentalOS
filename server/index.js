require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Security & performance middleware ---
app.use(helmet());

// Restrict CORS to the configured client origin(s).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
app.use(
    cors({
        origin(origin, cb) {
            // Allow same-origin / non-browser clients (no origin header).
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '1mb' })); // cap JSON body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// Basic HTTP access logging (skip in tests).
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Global rate limiter to mitigate brute-force / abuse.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth endpoints.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, please try again later.' },
});

// --- Static uploads (served after helmet sets CSP-safe headers) ---
const uploadsDir = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- Health check ---
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Dental Clinic Management API' });
});
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Routes ---
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/patients', requireAuth, require('./routes/patients'));
app.use('/api/appointments', requireAuth, require('./routes/appointments'));
app.use('/api/treatments', requireAuth, require('./routes/treatments'));
app.use('/api/chart', requireAuth, require('./routes/chart'));
app.use('/api/lookups', requireAuth, require('./routes/lookups'));
app.use('/api/inventory', requireAuth, require('./routes/inventory'));
app.use('/api/lab-cases', requireAuth, require('./routes/labCases'));
app.use('/api/users', requireAuth, require('./routes/users'));
app.use('/api/invoices', requireAuth, require('./routes/invoices'));
app.use('/api/alerts', requireAuth, require('./routes/alerts'));

// --- Fallbacks ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
