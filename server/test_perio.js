const db = require('./db');
require('dotenv').config({ path: '../.env' });

async function testPerio() {
    try {
        console.log('Testing Periodontal Routes...');

        // Use existing patient or create one (Assuming patient ID 1 exists from previous walkthrough, 
        // but let's be safe and insert one if needed, or just pick one. 
        // Actually, previous tests cleaned up. So we need a patient.)

        const patientRes = await db.query(
            `INSERT INTO patients (first_name, last_name, date_of_birth, phone, email) 
             VALUES ('Perio', 'Patient', '1985-05-05', '555-PERIO', 'perio@test.com') 
             RETURNING id`
        );
        const patientId = patientRes.rows[0].id;

        // Create Perio Chart Entry
        console.log('Inserting chart for Tooth 1...');
        const chartRes = await db.query(
            `INSERT INTO periodontal_charts 
            (patient_id, tooth_id, pocket_depths, gingival_margins, bleeding_points)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [patientId, 1, JSON.stringify([3, 2, 3, 4, 3, 2]), JSON.stringify([0, 0, 0, 0, 0, 0]), JSON.stringify([false, false, true, false, false, false])]
        );
        console.log('Inserted Chart ID:', chartRes.rows[0].id);

        // Fetch it back
        const fetchRes = await db.query(`SELECT * FROM periodontal_charts WHERE patient_id = $1`, [patientId]);
        console.log('Fetched Count:', fetchRes.rowCount);
        console.log('First Entry Depths:', fetchRes.rows[0].pocket_depths);

        // Cleanup
        console.log('Cleaning up...');
        await db.query('DELETE FROM periodontal_charts WHERE patient_id = $1', [patientId]);
        await db.query('DELETE FROM patients WHERE id = $1', [patientId]);

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testPerio();
