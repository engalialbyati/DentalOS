# Improvement & Refactoring Plan: Dental Clinic App

> **Instructions to Agent:** > Please execute the following changes in the order presented below (Step 1 -> Step 2 -> Step 3). 
> Refer to the "Master Blueprint V2" at the bottom of this file for the full context of the new architecture.

---

## Step 1: Database Restructuring (The Clean Slate)

We need to refactor the database schema based on new requirements to simplify the patient flow and add inventory tracking to treatments.

**Action Items:**
1.  **DELETE** the `perio_charts` table and remove any related backend/frontend code. We are completely removing this feature.
2.  **DROP and RECREATE** the `patients` table. It should ONLY have these simplified columns:
    * `id` (Serial PK)
    * `name` (Text)
    * `age` (Int)
    * `address` (Text)
    * `phone` (Text)
    * `email` (Text)
    * `first_visit_date` (Date)
3.  **CREATE** a new table called `treatments` to link patients to their medical history.
    * Columns: `id`, `patient_id` (FK), `date`, `tooth_number` (Int), `description` (Text).
4.  **CREATE** a table `treatment_images` to store file references (NOT the binary images themselves).
    * Columns: `id`, `treatment_id` (FK), `file_path` (Text), `file_reference_number` (String/Auto-generated).
5.  **CREATE** a table `treatment_materials` to track inventory usage per session.
    * Columns: `id`, `treatment_id` (FK), `inventory_item_id` (FK), `quantity_used` (Int).

**Output:** Generate and run the SQL to apply these changes.

---

## Step 2: The New "Treatment Session" Module

Create a new core feature called the **'Treatment Session'** where the doctor performs their daily work.

**UI Flow & Requirements:**
1.  **Context:** Allow selection of a Patient and a Date.
2.  **Charting:** Display the Dental Chart (Odontogram) and allow clicking a specific tooth number to link it to this session.
3.  **Details:** Provide a text area for 'Clinical Notes/Description'.
4.  **Inventory Usage (Critical):** Add a 'Materials Used' section.
    * Dropdown to select an item from Inventory (e.g., 'Anesthetic', 'Composite').
    * Input for 'Quantity'.
    * **Backend Logic:** When the treatment is saved, you must **AUTOMATICALLY deduct** this quantity from the `inventory_batches` table using the FEFO (First-Expired-First-Out) logic.
5.  **Imaging:** Add a file upload button for X-Rays/Photos.
    * **Storage:** Do not save the file in the DB. Save it to a local folder named `uploads/patients/{patient_id}/`.
    * **Naming:** Rename the file automatically (e.g., `P{id}_T{tooth}_{timestamp}.jpg`) and save only this string path in the `treatment_images` table.

---

## Step 3: Patient Profile Update

Refactor the **Patient Details** page to reflect the new simplified structure.

**Requirements:**
1.  **Top Section:** Display only the basic info (Name, Age, Phone, Address, First Visit).
2.  **Bottom Section (Tabs):** Create a tab called 'Treatment History'.
3.  **The List:** Inside this tab, show a chronological list of all treatments for this patient.
    * **Columns:** Date, Tooth #, Description, Materials Used (Comma-separated list), and a 'View Images' button.
4.  **Interaction:** * Clicking 'View Images' should load the images from the server folder based on the file paths stored in the DB.
    * Allow the doctor to click a treatment row to edit the Description or Notes.

---

# Reference: Master Blueprint V2

**Use this schema reference for writing the code:**

```sql
-- 1. PATIENTS (Simplified)
DROP TABLE IF EXISTS patients CASCADE;
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

-- 2. TREATMENTS (The Medical Record)
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    tooth_number INT, -- 1-32
    description TEXT, -- The doctor's notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TREATMENT IMAGES (File References)
CREATE TABLE treatment_images (
    id SERIAL PRIMARY KEY,
    treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
    file_path VARCHAR(255), -- e.g., "uploads/101/tooth_30_xray.jpg"
    file_reference_number VARCHAR(50), -- Auto-generated ID for easy lookup
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TREATMENT MATERIALS (Inventory Link)
-- Tracks what was used during a specific session
CREATE TABLE treatment_materials (
    id SERIAL PRIMARY KEY,
    treatment_id INT REFERENCES treatments(id) ON DELETE CASCADE,
    inventory_item_id INT REFERENCES inventory_items(id),
    quantity_used INT NOT NULL
);