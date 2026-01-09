const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users
router.get('/', async (req, res) => {
    const { role } = req.query;
    try {
        let query = 'SELECT id, username, full_name, role FROM users';
        let params = [];
        if (role) {
            query += ' WHERE role = $1';
            params.push(role);
        }
        query += ' ORDER BY full_name';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
