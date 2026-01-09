const db = require('./db');
require('dotenv').config({ path: '../.env' });

async function applyImprovementSchema() {
    try {
        console.log('Applying Improvement Schema (Clean Slate)...');

        // 1. Remove perio_charts and conflicted tables
        await db.query('DROP TABLE IF EXISTS periodontal_charts CASCADE');
        await db.query('DROP TABLE IF EXISTS treatment_materials CASCADE');
        await db.query('DROP TABLE IF EXISTS treatment_images CASCADE');
        await db.query('DROP TABLE IF EXISTS treatments CASCADE');
        console.log('Dropped periodontal_charts and treatments related tables');

        // 2. Drop and Recreate patients
        await db.query('DROP TABLE IF EXISTS patients CASCADE');
        console.log('Dropped patients');

        await db.query(`
            CREATE TABLE patients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INT,
                address TEXT,
                phone VARCHAR(20),
                email VARCHAR(100),
                first_visit_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Recreated patients');

        // 3. Create treatments
        await db.query(`
            CREATE TABLE treatments (
                id SERIAL PRIMARY KEY,
                patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
                date DATE DEFAULT CURRENT_DATE,
                tooth_number INT, -- 1-32
                description TEXT, -- The doctor's notes
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created treatments');

        // 4. Create treatment_images
        await db.query(`
            CREATE TABLE treatment_images (
                id SERIAL PRIMARY KEY,
                treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
                file_path VARCHAR(255), -- e.g., "uploads/101/tooth_30_xray.jpg"
                file_reference_number VARCHAR(50), -- Auto-generated ID for easy lookup
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created treatment_images');

        // 5. Create treatment_materials
        await db.query(`
            CREATE TABLE treatment_materials (
                id SERIAL PRIMARY KEY,
                treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
                inventory_item_id INT REFERENCES inventory_items(id),
                quantity_used INT NOT NULL
            )
        `);
        console.log('Created treatment_materials');

        console.log('Database restructuring complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error applying improvement schema:', err);
        process.exit(1);
    }
}

applyImprovementSchema();
