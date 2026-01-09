-- MODIFIED SCHEMA FOR IMPROVEMENT PLAN

-- 1. Users Table (Roles: Admin, Dentist, Receptionist, Patient)
CREATE TYPE user_role AS ENUM ('admin', 'dentist', 'receptionist', 'patient');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table (Simplified)
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    first_visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Treatments (The Medical Record)
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    tooth_number INT, -- 1-32
    description TEXT, -- The doctor's notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Treatment Images (File References)
CREATE TABLE treatment_images (
    id SERIAL PRIMARY KEY,
    treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
    file_path VARCHAR(255),
    file_reference_number VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Treatment Materials (Inventory Link)
CREATE TABLE treatment_materials (
    id SERIAL PRIMARY KEY,
    treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
    inventory_item_id INT REFERENCES inventory_items(id),
    quantity_used INT NOT NULL
);

-- 6. Teeth Table (Static Lookup 1-32)
CREATE TABLE teeth (
    id INTEGER PRIMARY KEY, -- 1-32
    name VARCHAR(100) NOT NULL,
    quadrant VARCHAR(20)
);
-- (Insert teeth data here...)

-- 7. Inventory Modules
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    supplier_id INT REFERENCES suppliers(id),
    threshold_limit INT DEFAULT 10,
    unit_price DECIMAL(10, 2),
    sku VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_batches (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number VARCHAR(50),
    quantity_on_hand INT NOT NULL,
    expiration_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_inventory_expiry ON inventory_batches(expiration_date);

-- REMOVED: periodontal_charts

-- 8. Lab Cases (External Orders)
CREATE TABLE lab_cases (
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

CREATE INDEX idx_lab_due_date ON lab_cases(due_date);
