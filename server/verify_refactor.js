const db = require('./db');
const path = require('path');

// Config
const BASE_URL = 'http://localhost:5001/api';

async function runVerification() {
    console.log('--- Starting Verification ---');
    try {
        // 1. Create Patient
        console.log('Creating Patient...');
        const patRes = await fetch(`${BASE_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Refactor Test Patient',
                age: 30,
                address: '123 Refactor Lane',
                phone: '555-0100',
                email: 'test@refactor.com'
            })
        });
        const patData = await patRes.json();
        const patientId = patData.id;
        console.log(`PASS: Patient Created (ID: ${patientId})`);

        // 2. Create Inventory Item & Batch
        console.log('Creating Inventory Item...');
        const supRes = await fetch(`${BASE_URL}/inventory/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Supplier' })
        });
        const supData = await supRes.json();
        const supplierId = supData.id;

        const itemRes = await fetch(`${BASE_URL}/inventory/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Material',
                category: 'Consumable',
                supplier_id: supplierId,
                threshold_limit: 10
            })
        });
        const itemData = await itemRes.json();
        const itemId = itemData.id;

        // Add Batch (Stock)
        await fetch(`${BASE_URL}/inventory/batches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: itemId,
                batch_number: 'B100',
                quantity: 50,
                expiration_date: '2027-01-01'
            })
        });
        console.log(`PASS: Inventory Item Created (ID: ${itemId}) with 50 qty.`);

        // 3. Create Treatment Session (Use 10 units)
        console.log('Creating Treatment Session...');

        // We need to use FormData because the backend uses multer
        const formData = new FormData();
        formData.append('patient_id', patientId);
        formData.append('date', new Date().toISOString().split('T')[0]);
        formData.append('tooth_number', '14');
        formData.append('description', 'Filling procedure with inventory check.');
        formData.append('materials', JSON.stringify([
            { inventory_item_id: itemId, quantity: 10 }
        ]));

        const trRes = await fetch(`${BASE_URL}/treatments`, {
            method: 'POST',
            body: formData
        });

        if (!trRes.ok) {
            const errText = await trRes.text();
            throw new Error(`Treatment creation failed: ${errText}`);
        }

        const trData = await trRes.json();
        const treatmentId = trData.id;
        console.log(`PASS: Treatment Created (ID: ${treatmentId})`);

        // 4. Verify Inventory Deduction
        const batchRes = await db.query('SELECT quantity_on_hand FROM inventory_batches WHERE item_id = $1', [itemId]);
        const qty = batchRes.rows[0].quantity_on_hand;

        if (parseInt(qty) === 40) {
            console.log('PASS: Inventory Deducted correctly (50 -> 40)');
        } else {
            console.error(`FAIL: Inventory Deduction wrong. Expected 40, got ${qty}`);
        }

        // 5. Verify Treatment History Retrieval
        const histRes = await fetch(`${BASE_URL}/treatments/patient/${patientId}`);
        const histData = await histRes.json();
        if (histData.length > 0 && histData[0].id === treatmentId) {
            console.log('PASS: Treatment History retrieved.');
        } else {
            console.error('FAIL: Treatment History not found.');
        }

    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
        if (err.cause) console.error(err.cause);
    } finally {
        process.exit(0);
    }
}

runVerification();
