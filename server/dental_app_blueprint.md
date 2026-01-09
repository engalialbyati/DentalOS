# Project Blueprint: Dental Clinic Management System (DCMS)

## 1. Executive Summary
**Goal:** Build a modular, high-performance web application for dental clinics to manage clinical charting, patient records, appointments, and inventory operations.
**Target User:** Dentists, Hygienists, Receptionists, and Office Managers.

## 2. Technical Stack
* **Frontend:** React (Vite) + Tailwind CSS
* **Backend:** Node.js + Express
* **Database:** PostgreSQL
* **Key Libraries:**
    * `react-big-calendar` (Scheduling)
    * `recharts` (Analytics)
    * `cornerstone-core` (DICOM X-ray viewing)
    * `pg` (PostgreSQL client)

---

## 3. Core Modules & Features

### Module A: Clinical Management
1.  **Odontogram (Visual Charting):**
    * Interactive SVG of 32 teeth (Universal Numbering System).
    * Click-to-action: Assign condition (Cavity, Missing) or Treatment (Root Canal).
    * Visual feedback: Color-coded surfaces based on status.
2.  **Periodontal Charting:**
    * 6-point grid per tooth (Facial/Lingual).
    * **Logic:** Auto-highlight depths > 4mm (Red); auto-calc Clinical Attachment Loss.
3.  **Treatment Planning:**
    * Multi-phase planning (Phase 1: Urgent, Phase 2: Restorative).
    * Output: PDF quotes with insurance estimates.

### Module B: Operations & Business
4.  **Inventory Management (FEFO System):**
    * **Logic:** First-Expired-First-Out. Deduct stock from the batch expiring soonest.
    * **Alerts:** Low stock thresholds and expiration warnings (30 days).
5.  **Lab Case Tracker:**
    * Track external work (Crowns/Dentures).
    * **Status Workflow:** Sent -> In Production -> Received -> Delivered.
    * **Safety:** Warning trigger if booking an appointment before the "Due Date".

### Module C: Patient Experience
6.  **Kiosk Mode:**
    * Tablet-optimized login for patients in the waiting room.
    * Digital signature capture for consent forms.
    * Self-check-in.

---

## 4. Database Schema (PostgreSQL)

The following SQL defines the core structure for the Operations and Clinical modules.

```sql
-- USERS & ROLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('Admin', 'Dentist', 'Hygienist', 'Receptionist')),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255)
);

-- PATIENTS
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    dob DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    medical_history JSONB -- Stores allergies, conditions as JSON
);

-- CLINICAL: TEETH & CHARTING
CREATE TABLE patient_charts (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    tooth_number INT CHECK (tooth_number BETWEEN 1 AND 32),
    condition VARCHAR(50), -- e.g., 'Caries', 'Fracture'
    existing_restoration VARCHAR(50), -- e.g., 'Amalgam', 'Composite'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPERATIONS: INVENTORY (FEFO Support)
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    supplier_id INT REFERENCES suppliers(id),
    threshold_limit INT DEFAULT 10,
    sku VARCHAR(50) UNIQUE
);

CREATE TABLE inventory_batches (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number VARCHAR(50),
    quantity_on_hand INT NOT NULL,
    expiration_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE
);

-- OPERATIONS: LAB TRACKING
CREATE TABLE lab_cases (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    lab_name VARCHAR(100),
    tooth_number INT,
    status VARCHAR(20) DEFAULT 'Sent',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);