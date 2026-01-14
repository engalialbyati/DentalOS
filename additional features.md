Here is the first draft of the Project Requirement Document (PRD). It is structured for developers to understand both the logic and the features.
Project: Dental Management System (DMS)
Objective: A compliant, role-based clinic management tool focusing on clinical charting, scheduling, and financial health.
1. Core User Roles
 * Admin/Owner: Full financial oversight (Profit/Loss, Staff KPIs).
 * Dentist: Clinical focus (Teeth charts, history, personal schedule).
 * Receptionist: Logistics (Scheduling, patient intake, payment collection).
2. Compliance & Data Requirements (Dental Association)
Every visit must log:
 * Timestamp: Date/Time of visit.
 * Patient Identity: Name, Age, Gender, Contact.
 * Clinical Record: Specific treatments performed.
 * Financials: Transaction amount per visit.
 * Export: One-click PDF/Excel generation for legal audits.
3. Clinical Features
 * Dual Interactive Charts: Toggle between Adult (32 teeth) and Pediatric (20 teeth) views.
 * Tooth-Level Mapping: Attach specific services/notes to individual teeth.
 * Patient Database: Centralized history for treatments, demographics, and X-ray/file storage.
4. Scheduling & Communication
 * Multi-View Calendar: Day, Week, and Month views.
 * Financial Awareness: Appointment slots must display "Debt Badges" for patients with outstanding balances.
 * Automated Reminders: WhatsApp/SMS integration for upcoming visits.
 * Reception Call-List: Dashboard for confirming appointments 24h in advance.
5. Financial & Analytics Module
 * Service Catalog: Dynamic list of treatments (Add/Edit/Remove).
 * Profit Tracking: System must calculate Revenue - Cost of Service = Net Profit.
 * Payment Tracking: Real-time sync between Reception (payments) and Dentist (viewing status).
6. Feature Priority Matrix
| Priority | Feature | Developer Focus |
|---|---|---|
| P0 (Critical) | Patient Database & Auth | Role-based permissions and CRUD operations. |
| P0 (Critical) | Dual Teeth Charts | Interactive UI for Adult/Pediatric mapping. |
| P1 (High) | Financial Engine | Calculation of profit/revenue per service. |
| P1 (High) | Scheduling System | Calendar UI with balance-due flags. |
| P2 (Medium) | Notifications | WhatsApp/SMS API integration. |
Would you like me to add a section for "Future Scope" (like multi-branch support), or should I refine any of the points above first?.