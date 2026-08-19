# TicketStar 🎟️ ⭐

> **Stellar Pay Event Ticketing & Attendance System**  
> *Non-custodial, Soroban-anchored event ticketing platform with XLM payments, QR code check-in verification, Supabase PostgreSQL persistence, and x402 telemetry.*

---

## 📌 Deployed Smart Contract (Stellar Testnet)

The Soroban smart contract is compiled to WebAssembly (`wasm32v1-none`), deployed live, and initialized on the **Stellar Testnet**.

| Parameter | Value / Link |
|---|---|
| **Contract ID** | `CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX` |
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |
| **RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Deployer Wallet** | `GBOLJPO3RL5OZHCH2YYSMO43KWMHV6VK5VR7N4UKLQQ3RFRNFADMNHCR` |
| **Stellar Expert Explorer** | [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX) |
| **Stellar Lab Explorer** | [Interact on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX) |

---

## 🌟 Key Features

1. **Non-Custodial Stellar Sign-In**:
   - Log in using **Freighter Browser Extension Wallet** (`@stellar/freighter-api`) or direct Stellar Public Key (`G...`). No password required.
2. **On-Chain Soroban Event Creation & Ticketing**:
   - Organizers initialize events on-chain with defined ticket limits and price per ticket in XLM.
3. **Immutable Ticket Purchases**:
   - Attendees purchase tickets with on-chain XLM transactions. Each ticket issues a unique QR code and is recorded on-chain.
4. **QR Code Attendance Check-In**:
   - Verification devices scan attendee QR codes and call on-chain `check_in` contract functions.
5. **Supabase PostgreSQL & Prisma ORM**:
   - Full persistence for users, events, tickets, webhook logs, and x402 telemetry scan logs.
6. **Corsair Integration & Webhooks**:
   - Triggers automated webhooks to Gmail, Slack, Discord, and Stripe on ticket purchase and check-in.

---

## 🏗️ Architecture Overview

```
 ┌───────────────────────────────────────────────────────────┐
 │                   Next.js Frontend                        │
 │  - Pages Router, Freighter Wallet API, Coinbase UI Design │
 └─────────────┬───────────────────────────────┬─────────────┘
               │                               │
               ▼ REST API                      ▼ On-Chain RPC
 ┌─────────────────────────────┐   ┌─────────────────────────┐
 │       NestJS Backend        │   │  Soroban Smart Contract │
 │  - Prisma ORM + Supabase    │   │  - Stellar Testnet      │
 └─────────────────────────────┘   └─────────────────────────┘
```

---

## 📜 Soroban Smart Contract Specification

The smart contract is written in **Rust** using `soroban-sdk 22.0.1`.

### Contract Methods

```rust
pub fn initialize(env: Env, admin: Address)
```
- Sets the platform administrator/verifier authority on-chain.

```rust
pub fn create_event(
    env: Env,
    event_id: u32,
    organizer: Address,
    ticket_price: i128,
    max_tickets: u32,
)
```
- Creates an event record on-chain. Requires signature (`organizer.require_auth()`). Emits `ev_creat` event.

```rust
pub fn buy_ticket(
    env: Env,
    event_id: u32,
    ticket_id: u32,
    buyer: Address,
    paid_amount: i128,
)
```
- Purchases a ticket for an event. Verifies max capacity, records ticket ownership, and emits `tk_buy` event.

```rust
pub fn check_in(env: Env, ticket_id: u32, verifier: Address)
```
- Marks a ticket as `CheckedIn` on-chain. Requires verifier/admin authorization. Emits `tk_chkin` event.

```rust
pub fn refund_ticket(env: Env, ticket_id: u32, buyer: Address)
```
- Updates ticket status to `Refunded` and adjusts event fund balance.

```rust
pub fn settle_event(env: Env, event_id: u32, organizer: Address)
```
- Finalizes an event and marks ticket revenue as settled for payout.

---

## 🔌 Smart Contract & Frontend Integration

The frontend connects directly to Stellar wallets and the Soroban contract using `@stellar/freighter-api` and `@stellar/stellar-sdk`.

### Key Integration Files:

1. **[frontend/src/lib/freighter.ts](file:///Users/abhraneelkarmakar/Codes/Proj5/frontend/src/lib/freighter.ts)**:
   Handles browser extension wallet detection, permission requests (`setAllowed`), and retrieval of user public keys (`getUserInfo`).

   ```typescript
   import { isConnected, setAllowed, getUserInfo } from '@stellar/freighter-api';

   export async function connectFreighter(): Promise<string> {
     const installed = await isFreighterInstalled();
     if (!installed) {
       throw new Error('Freighter extension not detected.');
     }
     await setAllowed();
     const userInfo = await getUserInfo();
     return userInfo.publicKey;
   }
   ```

2. **[frontend/src/lib/config.ts](file:///Users/abhraneelkarmakar/Codes/Proj5/frontend/src/lib/config.ts)**:
   Centralizes contract address and network configuration:

   ```typescript
   export const config = {
     contractId: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX',
     network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
     horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
     apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
   };
   ```

3. **[frontend/src/pages/signin.tsx](file:///Users/abhraneelkarmakar/Codes/Proj5/frontend/src/pages/signin.tsx)**:
   Implements the dedicated Stellar Wallet authentication portal using `connectFreighter()` or direct public key input.

---

## 🛠️ Environment Variable Matrix

| Variable | Scope | Description | Value |
|---|---|---|---|
| `SOROBAN_CONTRACT_ID` | Contract / Backend | Deployed Soroban Smart Contract ID | `CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX` |
| `NEXT_PUBLIC_SOROBAN_CONTRACT_ID` | Frontend | Contract address exposed to Next.js | `CDUHFTZNWCSV5EB4R3VZQFYG7XPLH7HNONOSTY22PAGFUNCXJN3YEFYX` |
| `STELLAR_NETWORK` | Backend / Frontend | Target Stellar network | `TESTNET` |
| `STELLAR_HORIZON_URL` | All | Stellar Horizon REST node | `https://horizon-testnet.stellar.org` |
| `DATABASE_URL` | Backend | Supabase PostgreSQL connection | `postgresql://postgres...aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Backend | Supabase direct migration connection | `postgresql://postgres...aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `PORT` | Backend | NestJS HTTP server port | `3001` |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL | `http://localhost:3001/api` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Rust & Cargo** (v1.75+) with target `wasm32v1-none`:
  ```bash
  rustup target add wasm32v1-none
  ```
- **Stellar CLI**:
  ```bash
  cargo install --locked soroban-cli
  ```

---

### 1. Smart Contract Development & Testing

```bash
# Navigate to contract directory
cd contract

# Run unit tests (3 passing unit tests)
cargo test

# Build release WASM binary
cargo build --target wasm32v1-none --release
```

---

### 2. Backend Setup (NestJS + Prisma + Supabase)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Sync schema with Supabase PostgreSQL
npx prisma db push

# Seed demo users & events
npx ts-node prisma/seed.ts

# Start NestJS dev server (listening on port 3001)
npm run start:dev
```

---

### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js dev server (listening on port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser to access TicketStar, or **`http://localhost:3000/signin`** for the Stellar Wallet Sign-In page.

---

## 🧪 Testing & Verification

- **Rust Smart Contract Unit Tests**:
  ```bash
  cd contract && cargo test
  ```
- **Backend Build**:
  ```bash
  cd backend && npm run build
  ```
- **Frontend Build**:
  ```bash
  cd frontend && npm run build
  ```

---

## 📄 License

UNLICENSED — Free for development and demonstration purposes.
