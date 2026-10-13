# MAIRA — Maternal & Infant Referral Assistance
## Government Healthcare Referral & Ambulance Coordination Operational Portal

MAIRA is an official, government-grade operational web platform designed for state healthcare departments, district hospitals, obstetricians, authorized 108 ambulance dispatchers, and healthcare administrators. It streamlines critical emergency transfers of high-risk pregnant mothers and critically ill neonates between primary centres (PHCs, CHCs) and higher-tier surgical and neonatal intensive care facilities.

---

## Key Operational Modules

1. **Role-Based Access & Security**:
   - **Hospital / Doctor**: Review clinical dossier, accept or decline referrals (mandatory reason required), request additional clinical observations, confirm triage arrival, and execute formal clinical handover.
   - **108 Dispatcher / Coordinator**: Monitor district telematics grid, assign available ALS/BLS/Neonatal ICU ambulances, track trip stages, and flag stale GPS telemetry.
   - **System Administrator**: User management, accreditation directory, ambulance fleet configuration, and immutable security audit logs.
   - Protected routes and role-guarding to prevent unauthorized URL access.

2. **Referral Management (`/referrals` & `/referrals/[id]`)**:
   - Filterable triage queue (New, Needs Review, Accepted, In Transit, Completed, Declined).
   - Maternal physiological vitals (BP, Heart Rate, SpO2, FHR) and high-risk flags (e.g. Severe Pre-eclampsia, PPH with rare Rh-Negative blood, Obstructed Labour).
   - Neonatal profiles (VLBW neonates, APGAR scores, Downe's respiratory scores).
   - Consequential action modals with duplicate-submission protection.

3. **Hospital Readiness Telemetry (`/facilities/readiness`)**:
   - Verified labour bed availability and SNCU / Level-3 NICU warmer occupancy.
   - Tracked PRBC blood stocks (A+, B+, O+, AB+, O-Negative).
   - Real-time data freshness indicators (`FRESH`, `EXPIRING_SOON`, `STALE`).

4. **108 Ambulance Dispatch Grid (`/ambulances`)**:
   - Interactive OpenStreetMap and Leaflet telematics visualization.
   - Vehicle location pins, equipment checks (Ventilators, Incubators, Oxygen), driver details, and stage tracking.

5. **Notifications & Activity (`/activity`)**:
   - Complete operational event timeline with multi-channel dispatch status (In-App, SMS Gateway, IVR Call).

6. **State Administration (`/admin`)**:
   - Protected administrative console with user directory, facility registry, fleet equipment, and system audit trail.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with official Government Healthcare palette
- **Icons**: Lucide React
- **Validation**: Zod & React Hook Form
- **Operational Charts**: Recharts
- **Interactive Mapping**: Leaflet with OpenStreetMap tiles
- **Data Layer**: Centralized typed API service (`apiClient`) with dual-mode support (External REST API / Self-Contained Demo Provider)

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

If connecting to an external Node.js/Express REST backend:
```env
NEXT_PUBLIC_API_URL=https://api.maira.health.gov.in
```
*(Leave blank to run in self-contained demonstration and drill mode).*

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Role Evaluation Credentials

In demonstration/evaluation mode, pre-configured roles are available on the login screen or via the **Role Switcher** in the top navigation bar:

| Persona | Role | Email |
|:---|:---|:---|
| **Dr. Priya Sharma** | Hospital / Obstetrician | `doctor@dwh.gov.in` |
| **Rajesh Verma** | 108 Dispatch Coordinator | `dispatch@erc108.gov.in` |
| **Alok Nath IAS** | System Administrator | `admin@nrhm.gov.in` |

Password for all test profiles: `GovernmentPass@2026`

---

## Design System Guidelines

- **Restrained Government Palette**: Navy `#163A5F`, Govt Blue `#1D4ED8`, Page Background `#F4F6F8`, Main Text `#172B3A`, Borders `#D9E0E7`.
- **Accessibility**: Status indicators never rely on colour alone; high contrast and visible focus indicators throughout.
- **Privacy Notice**: MAIRA supports emergency referral coordination and triage routing; it does not replace qualified clinical judgment.
