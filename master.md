# Product Requirements Document: Dental Clinic Management System

## 1. Project Overview
**Goal:** Build a comprehensive, web-based management system for dental clinics to handle patient records, clinical charting, appointments, billing, and back-office operations.
**Tech Stack:**
* **Frontend:** React (Vite), Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** PostgreSQL
* **Libraries:** `react-big-calendar` (Scheduling), `recharts` (Analytics), `cornerstone-core` (DICOM).

---

## 2. Core Modules

### Module A: Clinical Management
1.  **Odontogram (Visual Charting):**
    * Interactive SVG of 32 teeth (Upper/Lower arches).
    * Click-to-action: Assign condition (Cavity, Missing) or Treatment (Root Canal).
    * Visual feedback: Color-coded surfaces based on status.
2.  **Periodontal Charting:**
    * 6-point grid per tooth (Facial/Lingual).
    * Auto-highlight depths > 4mm (Red).
    * Auto-calc Clinical Attachment Loss.
3.  **Treatment Planning:**
    * Multi-phase planning (Phase 1: Urgent, Phase 2: Restorative).
    * Generation of PDF quotes with insurance estimates.
4.  **DICOM Viewer:**
    * Integrated X-ray viewer (`.dcm` files) with brightness/contrast tools.

### Module B: Patient Administration
5.  **Appointment Scheduler:**
    * Day/Week/Month views.
    * Drag-and-drop rescheduling.
    * Conflict detection (Double-booking prevention).
6.  **Patient Kiosk/Portal:**
    * Tablet-optimized login.
    * Digital signature capture for consent forms.
    * Self-check-in functionality.
7.  **Automated Recall:**
    * Cron job to flag patients due for cleaning (>6 months) without future bookings.

### Module C: Operations & Business
8.  **Inventory Management:**
    * FIFO (First-In-First-Out) tracking for supplies.
    * Expiration date alerts.
    * Low-stock threshold dashboard.
9.  **Lab Case Tracker:**
    * Track external work (Crowns/Dentures).
    * Status workflow: Sent -> In Production -> Received -> Delivered.
    * Calendar integration (Warning if booking appt before lab delivery).
10. **Analytics Dashboard:**
    * Production vs. Collection financial charts.
    * No-show rates and Case Acceptance % metrics.

---

## 3. Database Schema Overview
* **Users/Auth:** Roles (Admin, Dentist, Staff).
* **Patients:** Core demographics and medical history.
* **Clinical:** `teeth`, `patient_charts`, `perio_data`, `treatments`.
* **Operations:** `inventory_items`, `suppliers`, `lab_cases`.