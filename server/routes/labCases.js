const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/lab-cases
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT lc.*, p.first_name || ' ' || p.last_name as patient_name
            FROM lab_cases lc
            JOIN patients p ON lc.patient_id = p.id
            ORDER BY lc.due_date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/lab-cases
router.post('/', async (req, res) => {
    const { patient_id, lab_name, tooth_number, instruction_notes, due_date, status = 'Sent' } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO lab_cases (patient_id, lab_name, tooth_number, instruction_notes, due_date, status)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [patient_id, lab_name, tooth_number, instruction_notes, due_date, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/lab-cases/:id (Update Status)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, received_date } = req.body;
    try {
        // If status becomes Received, automatically set received_date if not provided
        let recDate = received_date;
        if (status === 'Received' && !recDate) {
            recDate = new Date();
        }

        const result = await db.query(
            `UPDATE lab_cases SET status = $1, received_date = $2 WHERE id = $3 RETURNING *`,
            [status, recDate, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/lab-cases/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM lab_cases WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
