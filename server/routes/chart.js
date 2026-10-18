const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireInt, clampString } = require('../middleware/validate');

// GET /api/chart/:patientId  -> maps treatments to odontogram data
router.get(
    '/:patientId',
    asyncHandler(async (req, res) => {
        const result = await db.query(
            `SELECT tooth_number AS tooth_id, description AS condition_description, 'Completed' AS status
             FROM treatments
             WHERE patient_id = $1 AND tooth_number IS NOT NULL
             ORDER BY tooth_number ASC`,
            [req.params.patientId]
        );
        res.json(result.rows);
    })
);

// POST /api/chart  -> record a tooth condition as a treatment entry
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const patientId = requireInt(req.body, 'patient_id', { min: 1 });
        const toothId = requireInt(req.body, 'tooth_id', { min: 1, max: 32 });
        const description = clampString(req.body.condition_description, 500) || 'Charted condition';

        const result = await db.query(
            `INSERT INTO treatments (patient_id, date, tooth_number, description)
             VALUES ($1, CURRENT_DATE, $2, $3) RETURNING id, tooth_number, description`,
            [patientId, toothId, description]
        );
        res.status(201).json(result.rows[0]);
    })
);

module.exports = router;
