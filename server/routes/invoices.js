const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireInt, requireNumber, clampString } = require('../middleware/validate');

// GET /api/invoices?patient_id=&status=
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const { patient_id, status } = req.query;
        const where = [];
        const params = [];
        if (patient_id) { params.push(patient_id); where.push(`i.patient_id = $${params.length}`); }
        if (status) { params.push(status); where.push(`i.status = $${params.length}`); }
        const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const result = await db.query(
            `SELECT i.*, p.name as patient_name
             FROM invoices i
             JOIN patients p ON i.patient_id = p.id
             ${clause}
             ORDER BY i.created_at DESC`,
            params
        );
        res.json(result.rows);
    })
);

// GET /api/invoices/:id  (with line items)
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const inv = await db.query(
            `SELECT i.*, p.name as patient_name, p.phone, p.address
             FROM invoices i JOIN patients p ON i.patient_id = p.id
             WHERE i.id = $1`,
            [req.params.id]
        );
        if (inv.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });

        const items = await db.query(
            'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id',
            [req.params.id]
        );

        res.json({ ...inv.rows[0], items: items.rows });
    })
);

// POST /api/invoices  { patient_id, items: [{description, quantity, unit_price}], tax, discount, due_date, notes }
router.post(
    '/',
    asyncHandler(async (req, res) => {
        const patientId = requireInt(req.body, 'patient_id', { min: 1 });
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        if (items.length === 0) return res.status(400).json({ error: 'Invoice must have at least one item' });

        const tax = requireNumber(req.body, 'tax', { min: 0, default: 0 });
        const discount = requireNumber(req.body, 'discount', { min: 0, default: 0 });
        const dueDate = req.body.due_date || null;
        const notes = clampString(req.body.notes, 1000);

        const subtotal = items.reduce((sum, it) => {
            const qty = requireNumber(it, 'quantity', { min: 0 });
            const price = requireNumber(it, 'unit_price', { min: 0 });
            return sum + qty * price;
        }, 0);
        const total = Math.max(0, subtotal - discount + (subtotal - discount) * (tax / 100));

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const inv = await client.query(
                `INSERT INTO invoices (patient_id, subtotal, tax, discount, total, due_date, notes, status)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,'unpaid') RETURNING *`,
                [patientId, subtotal, tax, discount, total, dueDate, notes]
            );
            const invoice = inv.rows[0];

            for (const it of items) {
                const qty = Number(it.quantity);
                const price = Number(it.unit_price);
                await client.query(
                    `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
                     VALUES ($1,$2,$3,$4,$5)`,
                    [invoice.id, clampString(it.description, 300), qty, price, qty * price]
                );
            }
            await client.query('COMMIT');
            res.status(201).json(invoice);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    })
);

// PUT /api/invoices/:id/status  { status: 'paid' | 'unpaid' | 'partial' }
router.put(
    '/:id/status',
    asyncHandler(async (req, res) => {
        const allowed = ['unpaid', 'partial', 'paid'];
        const status = allowed.includes(req.body.status) ? req.body.status : null;
        if (!status) return res.status(400).json({ error: 'Invalid status' });

        const result = await db.query(
            `UPDATE invoices SET status = $1, paid_date = $2 WHERE id = $3 RETURNING *`,
            [status, status === 'paid' ? new Date() : null, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
        res.json(result.rows[0]);
    })
);

// GET /api/invoices/stats  -> revenue summary
router.get(
    '/stats/summary',
    asyncHandler(async (req, res) => {
        const r = await db.query(`
            SELECT
                COALESCE(SUM(total), 0) AS total_billed,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS total_paid,
                COALESCE(SUM(CASE WHEN status != 'paid' THEN total ELSE 0 END), 0) AS outstanding,
                COUNT(*) AS invoice_count
            FROM invoices
        `);
        res.json(r.rows[0]);
    })
);

module.exports = router;
