const db = require('./db');

const applySchema = async () => {
    try {
        console.log('Applying Lab Case schema...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS lab_cases (
                id SERIAL PRIMARY KEY,
                patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
                lab_name VARCHAR(100) NOT NULL,
                tooth_number INT,
                instruction_notes TEXT,
                sent_date DATE DEFAULT CURRENT_DATE,
                due_date DATE NOT NULL,
                received_date DATE,
                status VARCHAR(20) DEFAULT 'Sent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(`CREATE INDEX IF NOT EXISTS idx_lab_due_date ON lab_cases(due_date);`);

        console.log('Lab Case schema applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    }
};

applySchema();
