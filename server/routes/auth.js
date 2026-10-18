const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireString, clampString, isValidEmail } = require('../middleware/validate');

const ALLOWED_ROLES = ['admin', 'dentist', 'receptionist'];

// POST /api/auth/register  (first user may be seeded; restrict role escalation)
router.post(
    '/register',
    asyncHandler(async (req, res) => {
        const { username, password, full_name, role } = req.body;
        requireString(req.body, ['username', 'password', 'full_name']);

        if (String(password).length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const safeRole = ALLOWED_ROLES.includes(role) ? role : 'dentist';

        const hash = await bcrypt.hash(String(password), 12);

        const result = await db.query(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role, full_name',
            [clampString(username, 50), hash, clampString(full_name, 100), safeRole]
        );

        const user = result.rows[0];
        const token = signToken(user);
        res.status(201).json({ ...user, token });
    })
);

// POST /api/auth/login
router.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;
        requireString(req.body, ['username', 'password']);

        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            // Use the same message for user-not-found and bad-password to prevent enumeration.
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(String(password), user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken(user);
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            token,
        });
    })
);

// GET /api/auth/me  (requires token; mounted before auth limiter is fine)
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
