const express = require('express');
const router = express.Router();
const db = require('../db');

// --- ITEMS (Master List) ---

// GET /api/inventory/items (With calculated total stock)
router.get('/items', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT i.*, s.name as supplier_name, 
                   COALESCE(SUM(b.quantity_on_hand), 0)::int as total_quantity
            FROM inventory_items i
            LEFT JOIN suppliers s ON i.supplier_id = s.id
            LEFT JOIN inventory_batches b ON i.id = b.item_id
            GROUP BY i.id, s.name, s.id -- Grouping by s.id strictly
            ORDER BY i.name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/inventory/items
router.post('/items', async (req, res) => {
    const { name, category, supplier_id, threshold_limit, unit_price, sku } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO inventory_items (name, category, supplier_id, threshold_limit, unit_price, sku)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, category, supplier_id || null, threshold_limit, unit_price, sku]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/inventory/items/:id
router.delete('/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM inventory_items WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- BATCHES (Stock Management) ---

// GET /api/inventory/items/:id/batches
router.get('/items/:id/batches', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `SELECT * FROM inventory_batches WHERE item_id = $1 ORDER BY expiration_date ASC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/inventory/batches (Receive Stock)
router.post('/batches', async (req, res) => {
    const { item_id, batch_number, quantity, expiration_date } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO inventory_batches (item_id, batch_number, quantity_on_hand, expiration_date)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [item_id, batch_number, quantity, expiration_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/inventory/batches/:id/adjust (Manual Adjust/Usage)
router.put('/batches/:id/adjust', async (req, res) => {
    const { id } = req.params;
    const { new_quantity } = req.body;
    try {
        const result = await db.query(
            `UPDATE inventory_batches SET quantity_on_hand = $1 WHERE id = $2 RETURNING *`,
            [new_quantity, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- SUPPLIERS ---

router.get('/suppliers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM suppliers ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/suppliers', async (req, res) => {
    const { name, contact_name, phone, email } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO suppliers (name, contact_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, contact_name, phone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- DASHBOARD STATS ---

router.get('/dashboard/stats', async (req, res) => {
    try {
        const stats = {};

        // 1. Total Inventory Value (Unit Price * Qty on Hand)
        const valueRes = await db.query(`
            SELECT SUM(i.unit_price * b.quantity_on_hand) as total_value
            FROM inventory_items i
            JOIN inventory_batches b ON i.id = b.item_id
        `);
        stats.totalValue = valueRes.rows[0].total_value || 0;

        // 2. Low Stock Items Count
        const lowStockRes = await db.query(`
            SELECT COUNT(*) 
            FROM (
                SELECT i.id
                FROM inventory_items i
                LEFT JOIN inventory_batches b ON i.id = b.item_id
                GROUP BY i.id
                HAVING COALESCE(SUM(b.quantity_on_hand), 0) <= i.threshold_limit
            ) as low_stock
        `);
        stats.lowStockCount = parseInt(lowStockRes.rows[0].count);

        // 3. Expiring Soon (Next 30 days)
        const expiringRes = await db.query(`
            SELECT COUNT(*)
            FROM inventory_batches
            WHERE expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
            AND quantity_on_hand > 0
        `);
        stats.expiringCount = parseInt(expiringRes.rows[0].count);

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/inventory/items/:id
router.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, supplier_id, threshold_limit, unit_price, sku } = req.body;
    try {
        const result = await db.query(
            `UPDATE inventory_items 
             SET name = $1, category = $2, supplier_id = $3, threshold_limit = $4, unit_price = $5, sku = $6
             WHERE id = $7 RETURNING *`,
            [name, category, supplier_id, threshold_limit, unit_price, sku, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contact_name, phone, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE suppliers SET name = $1, contact_name = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *',
            [name, contact_name, phone, email, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
