# CorporateNet

Scalable Corporate Network using VLSM and OSPF — Network Intelligence Dashboard

## Overview

CorporateNet is a computer networking project demonstrating Variable Length Subnet Masking (VLSM), OSPF dynamic routing, DHCP, and IPv4 addressing across a simulated corporate topology. The project includes:

- **Cisco Packet Tracer simulation** (`.pkt` file) with 3 routers, 5 departments, and validated configurations
- **Web-based Network Intelligence Dashboard** (Vite + React + TypeScript) for interactive exploration
- **REST API** (Node.js + Express + TypeScript) with MongoDB persistence
- **VLSM Calculator** with visual subnet allocation
- **Topology Explorer** with interactive graph visualization
- **Diagnostics workspace** for connectivity testing and validation
- **Failure scenario simulation** demonstrating chain topology limitations

## Network Design

### Topology

```
[Engineering LAN] ── SW-Eng ── R1 ──(Serial)── R2 ──(Serial)── R3 ── SW-IT ── [IT Support LAN]
                          │                                    │
                          SW-Admin                              SW-Fin ── [Finance LAN]
                          │                                    │
                        [Admin LAN]                             SW-HR ── [HR LAN]
```

### VLSM Address Plan (10.10.0.0/23)

| Department | Hosts | Network | Gateway | Mask | Usable |
|------------|-------|---------|---------|------|--------|
| Engineering | 100 | 10.10.0.0/25 | 10.10.0.1 | 255.255.255.128 | 126 |
| Administration | 50 | 10.10.0.128/26 | 10.10.0.129 | 255.255.255.192 | 62 |
| Finance | 25 | 10.10.0.192/27 | 10.10.0.193 | 255.255.255.224 | 30 |
| HR | 20 | 10.10.0.224/27 | 10.10.0.225 | 255.255.255.224 | 30 |
| IT Support | 12 | 10.10.1.0/28 | 10.10.1.1 | 255.255.255.240 | 14 |
| R1—R2 Link | 2 | 10.10.1.16/30 | — | 255.255.255.252 | 2 |
| R2—R3 Link | 2 | 10.10.1.20/30 | — | 255.255.255.252 | 2 |

### OSPF Configuration

- **Process ID**: 1
- **Area**: 0 (single area)
- **Router IDs**: R1=1.1.1.1, R2=2.2.2.2, R3=3.3.3.3

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 6+ (local or Atlas)
- Cisco Packet Tracer 8.x (for `.pkt` file)

### Installation

```bash
# Clone and install dependencies
cd CorporateNet
npm install

# Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start MongoDB (if local)
mongod

# Seed database with initial design
npm run db:seed

# Start development servers (API + Web)
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/api/v1/health

## Project Structure

```
CorporateNet/
├── apps/
│   ├── api/                    # Express + TypeScript backend
│   │   ├── src/
│   │   │   ├── config/         # Environment configuration
│   │   │   ├── middleware/     # Error handling, validation
│   │   │   ├── models/         # Mongoose schemas
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── services/       # Business logic (VLSM, design, tests)
│   │   │   ├── utils/          # Logger, database, responses
│   │   │   ├── app.ts          # Express app setup
│   │   │   └── server.ts       # Entry point
│   │   └── tests/              # API integration tests
│   └── web/                    # Vite + React + TypeScript frontend
│       ├── src/
│       │   ├── api/            # API client & endpoints
│       │   ├── components/     # Reusable UI components
│       │   │   ├── common/     # Button, Input, Card, Table, Badge
│       │   │   └── layout/     # Sidebar, Header, Layout
│       │   ├── pages/          # Page components
│       │   ├── types/          # TypeScript interfaces
│       │   ├── styles/         # Global CSS
│       │   ├── App.tsx         # Routing
│       │   └── main.tsx        # Entry point
│       └── index.html
├── network/
│   ├── packet-tracer/          # .pkt simulation file
│   ├── configs/                # Router configuration exports
│   ├── addressing/             # VLSM plan documentation
│   └── evidence/               # CLI output screenshots
├── docs/                       # Architecture, testing plan, presentation
├── package.json                # Workspace root
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/designs` | List designs |
| POST | `/api/v1/designs` | Create design |
| GET | `/api/v1/designs/:id` | Get design |
| PATCH | `/api/v1/designs/:id` | Update design |
| DELETE | `/api/v1/designs/:id` | Delete design |
| POST | `/api/v1/vlsm/calculate` | Calculate VLSM |
| GET | `/api/v1/designs/:id/topology` | Get topology graph |
| GET | `/api/v1/designs/:id/routes` | Get routing info |
| GET | `/api/v1/designs/:id/report` | Generate report |
| POST | `/api/v1/designs/:id/tests` | Record test result |
| GET | `/api/v1/designs/:id/tests` | List test history |
| GET | `/api/v1/designs/:id/tests/matrix` | Connectivity matrix |
| POST | `/api/v1/designs/:id/scenarios` | Create scenario |
| GET | `/api/v1/designs/:id/scenarios` | List scenarios |

## Key Features

### VLSM Studio (`/vlsm`)
- Input parent CIDR and department host requirements
- Automatic largest-first subnet allocation
- Visual address space utilization bar
- Overlap detection and boundary validation
- Export calculated design to database

### Topology Explorer (`/topology`)
- Interactive React Flow graph
- Device nodes with interface details
- Link selection with network information
- Legend and minimap navigation
- Demo mode indicator

### Routing Lab (`/routing`)
- OSPF configuration overview
- Neighbor adjacency table (from Packet Tracer evidence)
- Expected route table with codes (C/O)
- CLI evidence viewer with verification badges

### Diagnostics (`/diagnostics`)
- Connectivity matrix (department-to-department)
- Test checklist with status tracking
- Evidence type classification (CLI, ping, manual, simulated)
- Bulk operations for test recording

### Failure Scenarios (`/scenarios`)
- Link failure simulation (R1-R2, R2-R3)
- Affected network identification
- Educational explanation of chain topology limitation
- Scenario CRUD with educational simulation flag

### Reports (`/reports`)
- Markdown export with full design documentation
- Test results summary
- Scenario documentation
- Version and timestamp tracking

## Testing

```bash
# Run all tests
npm test

# API tests only
npm run test --workspace=apps/api

# Frontend tests only
npm run test --workspace=apps/web
```

## Packet Tracer Validation

Required CLI evidence to collect:

```bash
# On each router
show ip interface brief
show ip ospf neighbor
show ip route ospf
show ip dhcp binding

# From PCs
ping <remote-department-IP>
tracert <remote-department-IP>
```

Save outputs as evidence in `network/evidence/`.

## Environment Variables

### Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/corporatenet
WEB_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`apps/web/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Security Notes

- Never commit `.env` files
- CORS restricted to `WEB_ORIGIN`
- Rate limiting on all API endpoints
- Helmet security headers enabled
- Input validation with Zod schemas
- No router credentials stored in database

## Deliverables Checklist

- [ ] Cisco Packet Tracer `.pkt` file
- [ ] Router configurations (R1, R2, R3)
- [ ] Final VLSM and IP addressing tables
- [ ] Working Vite + TypeScript frontend
- [ ] Node.js + Express + TypeScript backend
- [ ] MongoDB schema and setup instructions
- [ ] `.env.example` files (no secrets)
- [ ] Automated tests
- [ ] Packet Tracer CLI evidence screenshots
- [ ] Project report
- [ ] 10-12 slide presentation
- [ ] README with installation steps