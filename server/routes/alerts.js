const express = require('express');
const router = express.Router();
const db = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/alerts  -> aggregated notifications for the dashboard bell icon.
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const [lowStock, expiring, overdueLab, todaysAppts] = await Promise.all([
            db.query(`
                SELECT i.id, i.name, COALESCE(SUM(b.quantity_on_hand),0) AS qty, i.threshold_limit
                FROM inventory_items i
                LEFT JOIN inventory_batches b ON i.id = b.item_id
                GROUP BY i.id
                HAVING COALESCE(SUM(b.quantity_on_hand),0) <= i.threshold_limit
                ORDER BY i.name
            `),
            db.query(`
                SELECT i.id, i.name, b.expiration_date, b.quantity_on_hand
                FROM inventory_batches b
                JOIN inventory_items i ON b.item_id = i.id
                WHERE b.expiration_date BETWEEN date('now') AND date('now','+30 day')
                  AND b.quantity_on_hand > 0
                ORDER BY b.expiration_date ASC
            `),
            db.query(`
                SELECT lc.id, p.name AS patient_name, lc.lab_name, lc.due_date
                FROM lab_cases lc
                JOIN patients p ON lc.patient_id = p.id
                WHERE lc.due_date < CURRENT_DATE AND lc.status NOT IN ('Delivered','Received')
                ORDER BY lc.due_date ASC
            `),
            db.query(`
                SELECT a.id, p.name AS patient_name, a.start_time, a.status
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                WHERE date(a.start_time) = date('now')
                ORDER BY a.start_time ASC
            `),
        ]);

        res.json({
            lowStock: lowStock.rows,
            expiring: expiring.rows,
            overdueLab: overdueLab.rows,
            todaysAppointments: todaysAppts.rows,
            count:
                lowStock.rows.length +
                expiring.rows.length +
                overdueLab.rows.length +
                todaysAppts.rows.length,
        });
    })
);

module.exports = router;
