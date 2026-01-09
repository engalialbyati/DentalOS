-- ==========================================
-- MODULE: INVENTORY MANAGEMENT
-- ==========================================

-- 1. Suppliers Table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Items (The Master List)
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50), -- e.g., 'Anesthetics', 'Composites', 'Gloves'
    supplier_id INT REFERENCES suppliers(id),
    threshold_limit INT DEFAULT 10, -- Alert when stock drops below this
    unit_price DECIMAL(10, 2),
    sku VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Batches (For FIFO & Expiration Tracking)
CREATE TABLE inventory_batches (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number VARCHAR(50),
    quantity_on_hand INT NOT NULL,
    expiration_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE
);

-- ==========================================
-- MODULE: LAB CASE TRACKING
-- ==========================================

-- 4. Lab Cases
CREATE TABLE lab_cases (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL, -- Assumes 'patients' table exists
    provider_id INT NOT NULL, -- Assumes 'users' table exists (the dentist)
    lab_name VARCHAR(100) NOT NULL,
    
    -- Clinical Details
    tooth_number INT, -- Universal System 1-32
    instruction_notes TEXT,
    
    -- Dates
    sent_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL, -- When the lab promised it back
    received_date DATE,
    
    -- Workflow Status
    status VARCHAR(20) CHECK (status IN ('Sent', 'In Production', 'Received', 'Quality Checked', 'Delivered')) DEFAULT 'Sent',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup of late cases
CREATE INDEX idx_lab_due_date ON lab_cases(due_date);
CREATE INDEX idx_inventory_expiry ON inventory_batches(expiration_date);