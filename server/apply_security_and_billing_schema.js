// Idempotent migration: medical-history columns + billing tables + lookups table.
// Run with: node apply_security_and_billing_schema.js
require('dotenv').config({ path: '../.env' });
const db = require('./db');

async function run() {
    try {
        // --- Patient medical history fields ---
        await db.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT`);
        await db.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_conditions TEXT`);
        await db.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS medications TEXT`);
        await db.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes TEXT`);
        console.log('✓ Patient medical-history columns ensured');

        // --- Lookups table (used by lookups route) ---
        await db.query(`
            CREATE TABLE IF NOT EXISTS lookups (
                id SERIAL PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                code VARCHAR(50) NOT NULL,
                label VARCHAR(100) NOT NULL,
                sort_order INT DEFAULT 0
            )
        `);
        console.log('✓ Lookups table ensured');

        // --- Billing ---
        await db.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
                treatment_id INT REFERENCES treatments(id) ON DELETE SET NULL,
                invoice_number VARCHAR(50),
                subtotal DECIMAL(12,2) DEFAULT 0,
                tax DECIMAL(5,2) DEFAULT 0,
                discount DECIMAL(12,2) DEFAULT 0,
                total DECIMAL(12,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'unpaid',
                issue_date DATE DEFAULT CURRENT_DATE,
                due_date DATE,
                paid_date DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id SERIAL PRIMARY KEY,
                invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
                description VARCHAR(300) NOT NULL,
                quantity DECIMAL(10,2) DEFAULT 1,
                unit_price DECIMAL(12,2) DEFAULT 0,
                total DECIMAL(12,2) DEFAULT 0
            )
        `);
        console.log('✓ Billing tables ensured');

        // --- Migrate any existing plaintext passwords to bcrypt hashes ---
        // (Only re-hashes rows where password_hash is NOT already a bcrypt hash)
        const { rows } = await db.query(
            `SELECT id, password_hash FROM users WHERE password_hash NOT LIKE '$2a$%' AND password_hash NOT LIKE '$2b$%' AND password_hash NOT LIKE '$2y$%'`
        );
        if (rows.length) {
            const bcrypt = require('bcryptjs');
            for (const row of rows) {
                const hash = await bcrypt.hash(row.password_hash, 12);
                await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.id]);
            }
            console.log(`✓ Migrated ${rows.length} existing password(s) to bcrypt`);
        } else {
            console.log('✓ All passwords already hashed');
        }

        console.log('\nMigration complete.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await db.pool.end();
    }
}

run();
