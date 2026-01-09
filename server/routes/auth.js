const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password, full_name, role } = req.body;
    try {
        // In production, hash password here (e.g., bcrypt.hash)
        const result = await db.query(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
            [username, password, full_name, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        // In production, compare hash (e.g., bcrypt.compare)
        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // In production, return JWT
        res.json({ id: user.id, username: user.username, role: user.role, full_name: user.full_name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
