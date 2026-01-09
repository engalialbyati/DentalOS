const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/chart/:patientId
// Maps new `treatments` (sessions) to Odontogram data.
router.get('/:patientId', async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await db.query(`
            SELECT tooth_number as tooth_id, description as condition_description, 
                   'Completed' as status
            FROM treatments
            WHERE patient_id = $1 AND tooth_number IS NOT NULL
        `, [patientId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// REMOVED: POST /api/chart (Old logic)
// REMOVED: Perio routes

module.exports = router;
