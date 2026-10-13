# MAIRA Backend Integration Specification & Endpoint Contracts
**Maternal & Infant Referral Assistance — Government Healthcare Operations Portal**

This document specifies the authoritative REST API contracts for the shared Node.js / Express.js / MongoDB backend serving the MAIRA website operations portal and future mobile clients.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │    MAIRA Web Portal (Next.js Client)     │
                      └────────────────────┬─────────────────────┘
                                           │  REST / HTTPS
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │    Node.js / Express.js API Gateway      │
                      │ (Server-Enforced Role-Based Auth & RBAC) │
                      └───────┬──────────────────────────┬───────┘
                              │                          │
                              ▼                          ▼
               ┌───────────────────────────┐    ┌─────────────────┐
               │  MongoDB Clustered Store  │    │  108 Telematics │
               │ (Referrals, Vitals, Audit)│    │  GPS Gateway    │
               └───────────────────────────┘    └─────────────────┘
```

---

## Endpoint Inventory & Contract Status

| HTTP Method | Proposed Blueprint Endpoint | Purpose / Scope | Authority & RBAC | Status in Website |
|:---|:---|:---|:---|:---|
| `POST` | `/api/mothers` | Register new pregnant mother profile with RCH ID | Health Worker / Hospital | **Supported & Typed** (Client + API) |
| `GET` | `/api/mothers/:id` | Retrieve authorized mother medical history | Hospital / Doctor | **Supported & Typed** |
| `POST` | `/api/mothers/:id/visits` | Record antenatal clinic / triage visit vitals | Hospital / Doctor | **Supported & Typed** |
| `POST` | `/api/mothers/:id/newborns` | Register delivered neonate with APGAR & weight | Hospital / Doctor | **Supported & Typed** |
| `GET` | `/api/newborns/:id` | Fetch neonatal clinical status & conditions | Hospital / Doctor | **Supported & Typed** |
| `POST` | `/api/referrals` | Create new maternal or neonatal emergency referral | Referring MO / CHC | **Supported & Live Handled** |
| `GET` | `/api/referrals` | Fetch triage queue with status & urgency filters | All Authorized Roles | **Implemented & Live Handled** |
| `GET` | `/api/referrals/:id` | Fetch full referral dossier, vitals & timeline | All Authorized Roles | **Implemented & Live Handled** |
| `POST` | `/api/referrals/:id/accept` | Accept referral with bed reservation notes | Hospital / Doctor | **Implemented & Server Validated** |
| `POST` | `/api/referrals/:id/decline` | Decline referral with **mandatory** clinical reason | Hospital / Doctor | **Implemented & Server Validated** |
| `POST` | `/api/referrals/:id/request-info`| Request additional clinical info / observations | Hospital / Doctor | **Implemented & Server Validated** |
| `POST` | `/api/referrals/:id/confirm-arrival`| Confirm patient arrival at triage entrance | Hospital / Doctor | **Implemented & Server Validated** |
| `POST` | `/api/referrals/:id/assign-ambulance`| Mobilize and dispatch 108 emergency vehicle | Dispatcher / Coordinator| **Implemented & Server Validated** |
| `POST` | `/api/trips/:id/events` | Record trip milestone stage (En Route, Onboard) | Dispatcher / Telematics | **Implemented & Live Handled** |
| `POST` | `/api/referrals/:id/handover` | Formal clinical transfer to OT/NICU & release amb | Hospital / Doctor | **Implemented & Server Validated** |
| `GET` | `/api/facilities` | Directory of accredited healthcare facilities | All Authorized Roles | **Implemented & Live Handled** |
| `GET` | `/api/facilities/readiness` | Live capacity telemetry (Labour beds, SNCU, Blood) | All Authorized Roles | **Implemented & Live Handled** |
| `POST` | `/api/facilities/:id/readiness`| Update hospital beds, warmers, blood stocks | Hospital / Admin | **Implemented & Server Validated** |
| `GET` | `/api/ambulances/active` | Active 108 telematics fleet with GPS coordinates | Dispatcher / Hospital | **Implemented & Live Handled** |
| `GET` | `/api/activity` | Unified system activity & notification status | All Authorized Roles | **Implemented & Live Handled** |
| `GET` | `/api/admin/audit-logs` | Immutable security audit trail | Admin Only | **Implemented & Role Protected** |

---

## Dual-Mode Operation

1. **Production Mode (`NEXT_PUBLIC_API_URL` set)**:
   - All client calls in `apiClient` connect to the external Express.js backend.
   - Authentication tokens are passed via secure `Authorization: Bearer <token>` or HTTP-only cookies.
   - Backend enforces server-side database locking and audit records in MongoDB.

2. **Self-Contained Demo / Drill Mode (`NEXT_PUBLIC_API_URL` blank)**:
   - Uses the built-in Next.js App Router API endpoints and reactive local storage state store (`dataStore`).
   - All state transitions (Accept, Decline with reason, Dispatch ambulance, Update readiness, Record Handover) immediately mutate the state, log to activity timeline and audit records, and dynamically reflect across all dashboards.
   - Distinctly labeled in the UI banner as **"Operational Drill / Demo Mode"** to never confuse test records with live patient data.
