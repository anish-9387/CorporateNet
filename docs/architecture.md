# CorporateNet Architecture Documentation

## System Overview

CorporateNet is a full-stack network intelligence platform consisting of three primary components:

1. **Network Simulation Layer** — Cisco Packet Tracer (`.pkt`)
2. **Backend API** — Node.js/Express/TypeScript with MongoDB
3. **Frontend Dashboard** — Vite/React/TypeScript with React Flow

---

## Data Flow

```
┌─────────────┐     REST/JSON      ┌─────────────┐
│   Browser   │ ◄─────────────────► │  Frontend   │
│  (React)    │     HTTPS/JSON      │  (Vite)     │
└─────────────┘                     └──────┬──────┘
                                            │
                                    ┌───────▼───────┐
                                    │    Backend    │
                                    │  (Express)    │
                                    └───────┬───────┘
                                            │
                                    ┌───────▼───────┐
                                    │   MongoDB     │
                                    │  (Database)   │
                                    └───────────────┘

Packet Tracer (.pkt) ──► Manual Config Export ──► Shared Dataset ──► Dashboard
       ▲                                                                    │
       └────────────────── CLI Evidence Import ◄────────────────────────────┘
```

---

## Component Details

### Frontend (apps/web)

**Stack:** Vite 5, React 18, TypeScript, React Router 6, React Flow, Recharts, Tailwind CSS (via custom CSS)

**Pages:**
- `/` — Overview Dashboard
- `/topology` — Interactive Topology (React Flow)
- `/vlsm` — VLSM Calculator & Studio
- `/routing` — OSPF Routes & Evidence
- `/diagnostics` — Connectivity Tests
- `/scenarios` — Failure Simulations
- `/reports` — Export & Documentation

**State Management:** React hooks (useState, useEffect), React Query pattern via custom hooks

**API Client:** Fetch-based with typed responses, error handling, loading states

### Backend (apps/api)

**Stack:** Node.js 20, Express 4, TypeScript, Mongoose 8, Zod, Helmet, Pino

**Modules:**
- `designs` — CRUD for network designs, VLSM calculation
- `vlsm` — Subnet calculation engine (pure functions)
- `topology` — Graph data transformation
- `tests` — Test run recording, connectivity matrix
- `scenarios` — Failure scenario management
- `reports` — Markdown/JSON report generation

**Middleware:**
- `errorHandler` — Centralized error handling
- `validate` — Zod schema validation
- `rateLimit` — Express-rate-limit
- `helmet` — Security headers
- `cors` — Origin restriction

### Database (MongoDB)

**Collections:**
- `networkdesigns` — Full design documents with embedded arrays
- `testruns` — Individual test results with design reference
- `scenarios` — Failure simulations with design reference

**Indexes:**
- `networkdesigns`: name, createdAt
- `testruns`: designId, testedAt, designId+testType
- `scenarios`: designId, createdAt

---

## VLSM Calculation Engine

**Location:** `apps/api/src/services/vlsm.ts`

**Algorithm:**
1. Parse parent CIDR → network address + prefix
2. Sort departments by (hostCount + reserved) descending
3. For each department:
   - Calculate required prefix: `32 - ceil(log2(hosts + 2))`
   - Align to network boundary
   - Check overlap with existing allocations
   - Check parent boundary
4. Return sorted results with metadata

**Key Functions:**
- `calculateVLSM(parentCidr, inputs)` — Main entry point
- `validateSubnetAllocation(parentCidr, subnets)` — Validation
- `ipToNumber/numberToIp` — IPv4 arithmetic
- `cidrToMask/cidrToWildcard` — Mask conversions

---

## API Contract

**Base Path:** `/api/v1`

**Response Format:**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "source": "design-dataset",
    "verified": false,
    "timestamp": "2026-10-11T12:00:00.000Z"
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [...]
  }
}
```

**Status Codes:**
- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 422 Validation Error
- 500 Internal Error

---

## Security

- **CORS:** Explicit origin allowlist (`WEB_ORIGIN`)
- **Rate Limiting:** 100 req/15min per IP
- **Headers:** Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **Validation:** Zod schemas on all inputs
- **Secrets:** Environment variables only, never in code
- **Database:** Least-privilege user, network restrictions

---

## Deployment

### Development
```bash
npm run dev          # Concurrent API + Web
npm run dev:api      # API only (port 3000)
npm run dev:web      # Web only (port 5173)
```

### Production Build
```bash
npm run build        # Build both workspaces
npm run start        # Start API (requires built dist/)
```

### Environment
- `NODE_ENV=production`
- `MONGODB_URI` — MongoDB Atlas or managed instance
- `WEB_ORIGIN` — Production frontend URL
- `PORT` — API port (default 3000)

---

## Extensibility Points

1. **New Network Designs** — POST `/designs` with different topologies
2. **Additional Protocols** — Extend `ospf` field in design model
3. **Real-time Updates** — Add WebSocket for live topology
4. **Authentication** — JWT-based auth middleware
5. **Multi-tenancy** — Add `tenantId` to all models
6. **Packet Tracer Integration** — Netmiko/SSH or gNMI collector service