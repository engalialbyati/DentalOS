// One-time SQLite schema setup + seed data. Run with: node init_sqlite.js
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const db = require('./db');
const sqlite = db._db;

sqlite.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'dentist' CHECK (role IN ('admin','dentist','receptionist','patient')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    address TEXT,
    phone TEXT,
    email TEXT,
    first_visit_date TEXT DEFAULT CURRENT_DATE,
    allergies TEXT,
    medical_conditions TEXT,
    medications TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    supplier_id INTEGER REFERENCES suppliers(id),
    threshold_limit INTEGER DEFAULT 10,
    unit_price REAL,
    sku TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number TEXT,
    quantity_on_hand INTEGER NOT NULL,
    expiration_date TEXT NOT NULL,
    received_date TEXT DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_batches(expiration_date);

CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date TEXT DEFAULT CURRENT_DATE,
    tooth_number INTEGER,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatment_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treatment_id INTEGER NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    file_path TEXT,
    file_reference_number TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatment_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treatment_id INTEGER NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    quantity_used INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id INTEGER REFERENCES users(id),
    start_time TEXT,
    end_time TEXT,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    lab_name TEXT NOT NULL,
    tooth_number INTEGER,
    instruction_notes TEXT,
    sent_date TEXT DEFAULT CURRENT_DATE,
    due_date TEXT NOT NULL,
    received_date TEXT,
    status TEXT DEFAULT 'Sent',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lab_due_date ON lab_cases(due_date);

CREATE TABLE IF NOT EXISTS lookups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    code TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id INTEGER REFERENCES treatments(id) ON DELETE SET NULL,
    invoice_number TEXT,
    subtotal REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'unpaid',
    issue_date TEXT DEFAULT CURRENT_DATE,
    due_date TEXT,
    paid_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity REAL DEFAULT 1,
    unit_price REAL DEFAULT 0,
    total REAL DEFAULT 0
);
`);

// --- Seed default admin (only if no users exist) ---
const userCount = sqlite.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
    const hash = bcrypt.hashSync('admin12345', 12);
    sqlite.prepare(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)'
    ).run('admin', hash, 'Clinic Admin', 'admin');
    console.log('✓ Seeded admin user (admin / admin12345)');
} else {
    console.log('✓ Users already exist, skipping seed');
}

// --- Seed default lookups ---
const lookupCount = sqlite.prepare('SELECT COUNT(*) AS c FROM lookups').get().c;
if (lookupCount === 0) {
    const ins = sqlite.prepare('INSERT INTO lookups (category, code, label, sort_order) VALUES (?,?,?,?)');
    const conditions = [
        ['cavity', 'Cavity'], ['existing_filling', 'Existing Filling'],
        ['completed', 'Completed'], ['extracted', 'Extracted'], ['healthy', 'Healthy'],
    ];
    const statuses = [
        ['planned', 'Planned'], ['in_progress', 'In Progress'], ['completed', 'Completed'],
    ];
    conditions.forEach(([code, label], i) => ins.run('condition', code, label, i));
    statuses.forEach(([code, label], i) => ins.run('status', code, label, i));
    console.log('✓ Seeded default lookups');
}

console.log('\nSQLite schema ready at:', require('path').resolve(__dirname, 'data.db'));
sqlite.close();
