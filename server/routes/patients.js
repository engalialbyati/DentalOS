const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireString, requireInt, clampString, isValidEmail } = require('../middleware/validate');

// GET /api/patients?search=&limit=&offset=
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const { search } = req.query;
        const limit = Math.min(requireInt(req.query, 'limit', { min: 1, max: 1000, default: 1000 }), 1000);
        const offset = requireInt(req.query, 'offset', { min: 0, default: 0 });

        let query = 'SELECT * FROM patients';
        const params = [];
        if (search) {
            params.push(`%${search}%`);
            query += ` WHERE name LIKE $1 OR phone LIKE $1 OR email LIKE $1`;
        }
        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await db.query(query, params);
        res.json(result.rows);
    })
);

// GET /api/patients/:id
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(result.rows[0]);
    })
);

function buildPatientFields(body, isUpdate) {
    const name = body.name;
    if (!isUpdate && (typeof name !== 'string' || !name.trim())) {
        const e = new Error('Missing or invalid field: name'); e.status = 400; throw e;
    }
    const data = {
        name: clampString(name, 100),
        age: requireInt(body, 'age', { min: 0, max: 130, default: null }),
        phone: clampString(body.phone, 20),
        email: body.email && isValidEmail(body.email) ? clampString(body.email, 100) : null,
        address: clampString(body.address, 500),
        first_visit_date: body.first_visit_date || new Date().toISOString().slice(0, 10),
        allergies: clampString(body.allergies, 1000),
        medical_conditions: clampString(body.medical_conditions, 1000),
        medications: clampString(body.medications, 1000),
        notes: clampString(body.notes, 2000),
    };
    return data;
}

// POST /api/patients
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const d = buildPatientFields(req.body, false);
        const result = await db.query(
            `INSERT INTO patients (name, age, phone, email, address, first_visit_date, allergies, medical_conditions, medications, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [d.name, d.age, d.phone, d.email, d.address, d.first_visit_date, d.allergies, d.medical_conditions, d.medications, d.notes]
        );
        res.status(201).json(result.rows[0]);
    })
);

// PUT /api/patients/:id
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const d = buildPatientFields(req.body, true);
        const result = await db.query(
            `UPDATE patients SET name=$1, age=$2, phone=$3, email=$4, address=$5, first_visit_date=$6,
                allergies=$7, medical_conditions=$8, medications=$9, notes=$10
             WHERE id=$11 RETURNING *`,
            [d.name, d.age, d.phone, d.email, d.address, d.first_visit_date, d.allergies, d.medical_conditions, d.medications, d.notes, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(result.rows[0]);
    })
);

// DELETE /api/patients/:id
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query('DELETE FROM patients WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Deleted' });
    })
);

module.exports = router;
