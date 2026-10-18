const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/appointments
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const result = await db.query(`
            SELECT a.*, p.name AS patient_name, d.full_name AS dentist_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users d ON a.dentist_id = d.id
            ORDER BY a.start_time ASC
        `);
        res.json(result.rows);
    })
);

// POST /api/appointments
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { patient_id, dentist_id, start_time, end_time, status, notes } = req.body;
        const result = await db.query(
            `INSERT INTO appointments (patient_id, dentist_id, start_time, end_time, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [patient_id, dentist_id, start_time, end_time, status || 'scheduled', notes]
        );
        res.status(201).json(result.rows[0]);
    })
);

// PUT /api/appointments/:id  (reschedule / update)
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const { start_time, end_time, status, notes, dentist_id } = req.body;
        const result = await db.query(
            `UPDATE appointments
             SET start_time = COALESCE($1, start_time),
                 end_time = COALESCE($2, end_time),
                 status = COALESCE($3, status),
                 notes = COALESCE($4, notes),
                 dentist_id = COALESCE($5, dentist_id)
             WHERE id = $6 RETURNING *`,
            [start_time, end_time, status, notes, dentist_id, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
        res.json(result.rows[0]);
    })
);

module.exports = router;
