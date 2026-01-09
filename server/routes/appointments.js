const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/appointments
router.get('/', async (req, res) => {
    try {
        // In a real app, support ?start= & end= query params for calendar view
        const result = await db.query(`
      SELECT a.*, p.name as patient_name, d.full_name as dentist_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users d ON a.dentist_id = d.id
      ORDER BY a.start_time ASC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/appointments
router.post('/', async (req, res) => {
    const { patient_id, dentist_id, start_time, end_time, status, notes } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO appointments (patient_id, dentist_id, start_time, end_time, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [patient_id, dentist_id, start_time, end_time, status || 'scheduled', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
