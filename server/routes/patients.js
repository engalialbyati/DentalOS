const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/patients
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/patients
router.post('/', async (req, res) => {
    const { name, age, phone, email, address = null, first_visit_date } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO patients (name, age, phone, email, address, first_visit_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, age, phone, email, address, first_visit_date || new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, phone, email, address = null, first_visit_date } = req.body;
    try {
        const result = await db.query(
            `UPDATE patients SET name = $1, age = $2, phone = $3, email = $4, address = $5, first_visit_date = $6
       WHERE id = $7 RETURNING *`,
            [name, age, phone, email, address, first_visit_date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
