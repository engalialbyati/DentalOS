const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireString, clampString, requireInt } = require('../middleware/validate');

// GET /api/lookups?category=condition
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const { category } = req.query;
        let query = 'SELECT * FROM lookups';
        const params = [];
        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }
        query += ' ORDER BY sort_order, label';

        const result = await db.query(query, params);
        res.json(result.rows);
    })
);

// POST /api/lookups
router.post(
    '/',
    asyncHandler(async (req, res) => {
        requireString(req.body, ['category', 'code', 'label']);
        const code = clampString(req.body.code, 50);
        const label = clampString(req.body.label, 100);
        const category = clampString(req.body.category, 50);
        const sortOrder = requireInt(req.body, 'sort_order', { min: 0, default: 0 });

        const result = await db.query(
            'INSERT INTO lookups (category, code, label, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [category, code, label, sortOrder]
        );
        res.status(201).json(result.rows[0]);
    })
);

// DELETE /api/lookups/:id
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        await db.query('DELETE FROM lookups WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    })
);

module.exports = router;
