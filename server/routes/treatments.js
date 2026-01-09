const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure directory exists: uploads/patients/{patientId}
        // Note: req.body.patient_id might not be available yet if fields come after file?
        // Multer processes fields in order. Best to use a general uploads dir and move?
        // Or just use 'uploads/' and filename structure.
        // Prompt says: "uploads/patients/{patient_id}/"
        // Let's use a simpler approach: check patient_id in body if possible, or just 'uploads' and move later?
        // Actually, let's just use 'uploads' for now and create the folder structure if we can.
        // But req.body is not fully populated before file if not ordered correctly on client.
        // Let's stick to a flat 'uploads' for simplicity unless strict requirement.
        // "Do not save the file in the DB. Save it to a local folder named uploads/patients/{patient_id}/."
        // We will try. If safe, just use 'uploads/'.
        const dir = 'uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // "P{id}_T{tooth}_{timestamp}.jpg"
        // We need patient id and tooth number.
        // If we can't get them here, we generate temp name and rename in the controller.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /api/treatments
// Handles creation of treatment + inventory deduction + image saving
router.post('/', upload.array('images'), async (req, res) => {
    const client = await db.pool.connect(); // Use transaction
    try {
        await client.query('BEGIN');

        const { patient_id, date, tooth_number, description, materials } = req.body;
        // materials is JSON string if sent via FormData
        const materialsList = materials ? JSON.parse(materials) : [];

        // 1. Insert Treatment
        const treatmentRes = await client.query(
            `INSERT INTO treatments (patient_id, date, tooth_number, description)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [patient_id, date || new Date(), tooth_number, description]
        );
        const treatmentId = treatmentRes.rows[0].id;

        // 2. Process Materials (Inventory Deduction - FEFO)
        for (const item of materialsList) {
            const { inventory_item_id, quantity } = item;
            let qtyNeeded = parseInt(quantity);

            // Record usage
            await client.query(
                `INSERT INTO treatment_materials (treatment_id, inventory_item_id, quantity_used)
                 VALUES ($1, $2, $3)`,
                [treatmentId, inventory_item_id, qtyNeeded]
            );

            // Deduct from batches (FEFO)
            const batchesRes = await client.query(
                `SELECT id, quantity_on_hand FROM inventory_batches 
                 WHERE item_id = $1 AND quantity_on_hand > 0 
                 ORDER BY expiration_date ASC`,
                [inventory_item_id]
            );

            for (const batch of batchesRes.rows) {
                if (qtyNeeded <= 0) break;

                const deduct = Math.min(batch.quantity_on_hand, qtyNeeded);
                await client.query(
                    `UPDATE inventory_batches SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2`,
                    [deduct, batch.id]
                );
                qtyNeeded -= deduct;
            }

            if (qtyNeeded > 0) {
                // Warning: Not enough stock? We proceed but maybe log it?
                console.warn(`Item ${inventory_item_id} used more than available stock.`);
                // Could error out here if strict.
            }
        }

        // 3. Process Images
        if (req.files) {
            for (const file of req.files) {
                // Move/Rename file to uploads/patients/{patient_id}/...
                const targetDir = path.join('uploads', 'patients', String(patient_id));
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const ext = path.extname(file.originalname);
                const newFilename = `P${patient_id}_T${tooth_number}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
                const targetPath = path.join(targetDir, newFilename);

                fs.renameSync(file.path, targetPath);

                const refNum = 'IMG-' + Date.now();
                await client.query(
                    `INSERT INTO treatment_images (treatment_id, file_path, file_reference_number)
                     VALUES ($1, $2, $3)`,
                    [treatmentId, targetPath, refNum]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ id: treatmentId, message: 'Treatment session saved.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    } finally {
        client.release();
    }
});

// GET /api/treatments/patient/:id
router.get('/patient/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT t.*, 
                   (SELECT json_agg(ti.file_path) FROM treatment_images ti WHERE ti.treatment_id = t.id) as images,
                   (SELECT json_agg(json_build_object('name', i.name, 'qty', tm.quantity_used)) 
                    FROM treatment_materials tm 
                    JOIN inventory_items i ON tm.inventory_item_id = i.id 
                    WHERE tm.treatment_id = t.id) as materials
            FROM treatments t
            WHERE t.patient_id = $1
            ORDER BY t.date DESC, t.created_at DESC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
