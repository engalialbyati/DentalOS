const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/lookups?category=condition
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        let query = 'SELECT * FROM lookups';
        let params = [];
        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }
        query += ' ORDER BY sort_order, label';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/lookups
router.post('/', async (req, res) => {
    const { category, code, label, sort_order = 0 } = req.body;
    try {
        constresult = await db.query(
            'INSERT INTO lookups (category, code, label, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [category, code, label, sort_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/lookups/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM lookups WHERE id = $1', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
