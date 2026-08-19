
**Product Requirements Document**

**Project 5: Event Ticketing & Attendance System**

**Executive Summary**

A blockchain-powered event platform where organizers sell tamper-proof tickets using Stellar

payments. Soroban validates ticket ownership and attendance while Corsair automates

registrations, calendars, notifications, and event management workflows.

**Problem Statement**

Traditional ticketing systems suffer from fraud, ticket duplication, delayed settlements, manual

attendee management, and disconnected event tools.

**Objectives**

Enable secure ticket sales, instant settlements, fraud-resistant ownership verification, automated

attendee management, and seamless integrations with external platforms.

**Target Users**

Event Organizers, Attendees, Sponsors, Event Staff, Platform Administrators.

**Core Features**

Event creation, ticket categories, QR-code tickets, blockchain ownership, attendance verification,

refunds, analytics dashboard, organizer portal, sponsor management.

**Technology Stack**

Frontend: Next.js. Backend: NestJS. Database: PostgreSQL. Blockchain: Stellar + Soroban.

Automation: Corsair. Storage: S3-compatible object storage.

**Stellar Integration**

Accept XLM and Stellar assets for ticket purchases, x402-secured premium event APIs, instant

organizer payouts, low-cost global payments, multisignature treasury wallets.

**Soroban Smart Contracts**

Ticket Contract, Ownership Contract, Attendance Verification Contract, Refund Contract, and Event

Settlement Contract for secure lifecycle management.

**Corsair Integrations**

Google Calendar, Gmail, Slack, Discord, CRM systems, event platforms, webhook automation,

OAuth-secured third-party integrations.

**User Flow**

Organizer creates event **→** Attendee purchases ticket through Stellar **→** Soroban issues

blockchain-backed ticket **→** QR code verified at venue **→** Attendance recorded on-chain **→** Corsair

sends confirmations and syncs external platforms.**Functional Requirements**

Authentication, wallet management, event management, ticket sales, attendance scanning,

payment processing, notifications, integrations, reporting, administration.

**Non-Functional Requirements**

High availability, scalable ticket validation, secure storage, immutable audit trail, responsive UI,

reliable payment confirmation.

**Security**

OAuth2, RBAC, encrypted secrets, signed webhooks, multisignature wallets, anti-fraud validation,

blockchain audit logging.

**API Modules**

Authentication, Events, Tickets, Attendance, Wallets, Payments, Integrations, Notifications,

Analytics, Admin.

**Database Entities**

Users, Events, Tickets, Orders, Wallets, Transactions, Attendance Records, Integrations,

Notifications, Audit Logs.

**Development Roadmap**

Phase 1: Authentication and event management. Phase 2: Stellar ticket payments. Phase 3:

Soroban ticket** **


Tech stack: Your PRD mentions Next.js + NestJS + PostgreSQL + Stellar/Soroban. My default environment uses React + FastAPI + MongoDB. Which do you prefer?

Insist on Next.js + NestJS + PostgreSQL

Blockchain/Stellar integration: Real Stellar testnet integration is complex. What level of integration do you want?

Real Stellar testnet integration (XLM payments, Soroban contracts) — needs your Stellar testnet keys

Payments: For fiat/card payments alongside crypto?

Only Stellar/XLM

Corsair Integrations: Corsair isn't a widely-known SaaS — do you mean:

Skip external integrations for MVP; add later

MVP scope priority — pick focus for first pass:

Organizer: event creation + ticket sales + QR check-in + attendee list; Attendee-focused: browse events, buy tickets, my tickets with QR


General Questions:

1. Tech stack: Your PRD mentions Next.js + NestJS + PostgreSQL + Stellar/Soroban. My default environment uses React + FastAPI + MongoDB. Which do you prefer?

Ans: Insist on Next.js + NestJS + PostgreSQL

2. Blockchain/Stellar integration: Real Stellar testnet integration is complex. What level of integration do you want?

Ans: Real Stellar testnet integration (XLM payments, Soroban contracts) — needs your Stellar testnet keys

3. Payments: For fiat/card payments alongside crypto?

Ans: Only Stellar/XLM

4. Corsair Integrations: Corsair isn't a widely-known SaaS — do you mean:

Ans: Skip external integrations for MVP; add later

5. MVP scope priority — pick focus for first pass:

Ans: Organizer: event creation + ticket sales + QR check-in + attendee list; Attendee-focused: browse events, buy tickets, my tickets with QR

Constraint Questions:

1.  **Stack constraint (important)** : My hosting/preview environment has supervisor configured for  **React (port 3000) + FastAPI (port 8001) + MongoDB** . Switching to **Next.js + NestJS + PostgreSQL** is possible but has real trade-offs:

* PostgreSQL is NOT preinstalled — I'd need to install & manage it locally in the container (may be fragile)
* Supervisor & Kubernetes ingress are tuned for React/FastAPI ports; NestJS would need port remapping
* Rebuilding the stack means slower iteration and higher chance of preview-URL issues

How do you want to proceed?

Ans: **Fastest path** : React + FastAPI + PostgreSQL (all Stellar/Soroban features fully preserved)


**2. Stellar testnet keys** — for real Stellar integration, I need:

* A **platform/treasury account** (public + secret key on testnet) that receives ticket payments.
* Do you want me to auto-generate a new testnet keypair and fund it via friendbot (I can do this)? Or will you provide one?
* For  **Soroban smart contracts** : deploying custom contracts requires the Stellar CLI + a funded contract-deployer key. Are you OK with me using an **on-chain payment memo + backend verification** model (still real Stellar testnet, no custom Soroban deploy) — OR do you want me to attempt full Soroban WASM deploys (much longer, needs Rust toolchain)?

Ans: **On-chain XLM payments + memo/hash verification** (recommended, real testnet, works today)

**3. Attendee wallets** : How do attendees pay?

Ans: Connect **Freighter** browser wallet (real user Stellar wallet, recommended)

**4. Design vibe** (still need this):

Ans: Vibrant festival (bold color blocks)
