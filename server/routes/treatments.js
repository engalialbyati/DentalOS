const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireInt, clampString } = require('../middleware/validate');

// --- Hardened file upload config ---
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const safeExt = ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())
            ? path.extname(file.originalname).toLowerCase()
            : '.jpg';
        const rand = Math.random().toString(36).slice(2, 11);
        cb(null, `tmp_${Date.now()}_${rand}${safeExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Only images are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

// POST /api/treatments  (treatment + inventory FEFO deduction + image saving)
router.post(
    '/',
    (req, res, next) => upload.array('images', 10)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    }),
    asyncHandler(async (req, res) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const patientId = requireInt(req.body, 'patient_id', { min: 1 });
            const date = req.body.date || new Date().toISOString().slice(0, 10);
            const toothNumber = req.body.tooth_number
                ? requireInt(req.body, 'tooth_number', { min: 1, max: 32, default: null })
                : null;
            const description = clampString(req.body.description, 5000);

            const materialsList = req.body.materials ? JSON.parse(req.body.materials) : [];

            const treatmentRes = await client.query(
                `INSERT INTO treatments (patient_id, date, tooth_number, description)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [patientId, date, toothNumber, description]
            );
            const treatmentId = treatmentRes.rows[0].id;

            for (const item of materialsList) {
                const inventoryItemId = requireInt(item, 'inventory_item_id', { min: 1 });
                const qtyNeeded = requireInt(item, 'quantity', { min: 1 });

                await client.query(
                    `INSERT INTO treatment_materials (treatment_id, inventory_item_id, quantity_used)
                     VALUES ($1, $2, $3)`,
                    [treatmentId, inventoryItemId, qtyNeeded]
                );

                const batchesRes = await client.query(
                    `SELECT id, quantity_on_hand FROM inventory_batches
                     WHERE item_id = $1 AND quantity_on_hand > 0
                     ORDER BY expiration_date ASC`,
                    [inventoryItemId]
                );

                let remaining = qtyNeeded;
                for (const batch of batchesRes.rows) {
                    if (remaining <= 0) break;
                    const deduct = Math.min(batch.quantity_on_hand, remaining);
                    await client.query(
                        `UPDATE inventory_batches SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2`,
                        [deduct, batch.id]
                    );
                    remaining -= deduct;
                }
                if (remaining > 0) {
                    console.warn(`Item ${inventoryItemId} under-supplied by ${remaining}`);
                }
            }

            // Move validated images into per-patient folder with safe names.
            if (req.files && req.files.length) {
                const targetDir = path.join(UPLOAD_DIR, 'patients', String(patientId));
                fs.mkdirSync(targetDir, { recursive: true });

                for (const file of req.files) {
                    const ext = ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase())
                        ? path.extname(file.originalname).toLowerCase()
                        : '.jpg';
                    const safeName = `P${patientId}_T${toothNumber || 'X'}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
                    const relPath = path.join('uploads', 'patients', String(patientId), safeName);
                    fs.renameSync(file.path, path.join(UPLOAD_DIR, 'patients', String(patientId), safeName));

                    const refNum = 'IMG-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
                    await client.query(
                        `INSERT INTO treatment_images (treatment_id, file_path, file_reference_number)
                         VALUES ($1, $2, $3)`,
                        [treatmentId, relPath.replace(/\\/g, '/'), refNum]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json({ id: treatmentId, message: 'Treatment session saved.' });
        } catch (err) {
            await client.query('ROLLBACK');
            // Clean up any temp files that were written before the failure.
            if (req.files) {
                req.files.forEach((f) => {
                    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                });
            }
            throw err;
        } finally {
            client.release();
        }
    })
);

// GET /api/treatments/patient/:id
router.get(
    '/patient/:id',
    asyncHandler(async (req, res) => {
        const treatments = await db.query(
            `SELECT * FROM treatments WHERE patient_id = $1 ORDER BY date DESC, created_at DESC`,
            [req.params.id]
        );

        // Assemble images + materials per treatment (SQLite has no json_agg).
        for (const t of treatments.rows) {
            const imgs = await db.query(
                'SELECT file_path FROM treatment_images WHERE treatment_id = $1',
                [t.id]
            );
            const mats = await db.query(
                `SELECT i.name, tm.quantity_used AS qty
                 FROM treatment_materials tm
                 JOIN inventory_items i ON tm.inventory_item_id = i.id
                 WHERE tm.treatment_id = $1`,
                [t.id]
            );
            t.images = imgs.rows.map((r) => r.file_path);
            t.materials = mats.rows;
        }
        res.json(treatments.rows);
    })
);

module.exports = router;
