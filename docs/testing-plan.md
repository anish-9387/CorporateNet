# CorporateNet Testing Plan

## Test Strategy

**Approach:** Layered testing — Unit → Integration → E2E → Manual Validation  
**Coverage Target:** ≥80% for business logic (VLSM, API), critical paths for UI  
**Tools:** Vitest (unit/integration), Supertest (API), React Testing Library (UI)

---

## 1. Unit Tests

### VLSM Engine (`apps/api/src/services/vlsm.test.ts`)

| Test Case | Description | Expected |
|-----------|-------------|----------|
| `calculates correct subnets for CorporateNet design` | Full 5-department allocation from 10.10.0.0/23 | Valid, 5 subnets, correct prefixes |
| `sorts subnets largest first` | Input unordered, output sorted by host count | Descending order |
| `detects overlap error` | Three /25 in /24 | Invalid, overlap error |
| `detects out of bounds error` | Request exceeds parent | Invalid, boundary error |
| `calculates wildcard mask correctly` | /25 → 0.0.0.127 | Correct wildcard |
| `calculates utilization percentage` | 63 hosts in /26 (62 usable) | 101.6% (or 100% capped) |
| `handles reserved capacity` | 50 hosts + 10 reserved | Larger prefix allocated |
| `validates correct allocation` | Post-calculation validation | Valid |
| `rejects invalid CIDR` | Malformed input | Invalid, error message |

### Design Service (`apps/api/src/services/design.test.ts`)

| Test Case | Description |
|-----------|-------------|
| `creates a design with calculated VLSM` | End-to-end create with subnet calc |
| `finds design by ID` | Valid ID returns document |
| `returns null for non-existent ID` | Invalid ID format throws |
| `updates design and recalculates VLSM` | Parent CIDR change triggers recalc |
| `deletes design` | Soft/hard delete works |
| `calculates VLSM via service` | Direct calculation endpoint |
| `gets topology` | Nodes/edges transformation |
| `gets routing info` | OSPF + interfaces + routes |

---

## 2. API Integration Tests

### Designs (`apps/api/src/routes/api.test.ts`)

| Endpoint | Test Cases |
|----------|------------|
| `POST /designs` | ✓ Valid create, ✗ Missing fields, ✗ Invalid CIDR, ✗ Empty departments |
| `GET /designs` | ✓ List returns array, ✓ Empty list, ✓ Pagination |
| `GET /designs/:id` | ✓ Found, ✓ 404 for missing, ✗ 400 for invalid ID |
| `PATCH /designs/:id` | ✓ Partial update, ✓ VLSM recalc on CIDR change, ✗ Invalid ID |
| `DELETE /designs/:id` | ✓ Deletes, ✓ 404 for missing |
| `POST /vlsm/calculate` | ✓ Valid calculation, ✗ Invalid input |

### Tests

| Endpoint | Test Cases |
|----------|------------|
| `POST /designs/:id/tests` | ✓ Create test, ✓ Status enum, ✓ Evidence type enum |
| `GET /designs/:id/tests` | ✓ List with filters, ✓ Pagination |
| `GET /designs/:id/tests/matrix` | ✓ Matrix shape, ✓ Symmetric entries |

### Scenarios

| Endpoint | Test Cases |
|----------|------------|
| `POST /designs/:id/scenarios` | ✓ Create, ✓ Required fields |
| `GET /designs/:id/scenarios` | ✓ List by design |
| `PATCH/DELETE` | ✓ Update, ✓ Delete |

### Health

| Endpoint | Test Cases |
|----------|------------|
| `GET /health` | ✓ Returns `{status: "ok", uptime}` |

---

## 3. Frontend Tests

### Components

| Component | Test Cases |
|-----------|------------|
| `Button` | ✓ Variants, ✓ Sizes, ✓ Loading state, ✓ Disabled |
| `Input` | ✓ Label, ✓ Error state, ✓ Helper text, ✓ Value binding |
| `Card` | ✓ Header/body/footer, ✓ Padding variants |
| `Badge` | ✓ Variants, ✓ StatusBadge mapping |
| `Table` | ✓ Columns, ✓ Empty state, ✓ Custom render, ✓ Key extractor |
| `StatusBadge` | ✓ All status variants |

### Pages

| Page | Test Cases |
|------|------------|
| `Overview` | ✓ Loading skeleton, ✓ Error state, ✓ Empty state, ✓ Stats cards, ✓ Department table, ✓ OSPF status, ✓ Quick links |
| `VLSMStudio` | ✓ Default values, ✓ Calculation trigger, ✓ Add/remove dept, ✓ Save design, ✓ Results table, ✓ Utilization bar |
| `Routing` | ✓ Tab navigation, ✓ Overview content, ✓ Neighbors table, ✓ Routes table, ✓ Evidence viewer |
| `Diagnostics` | ✓ Matrix rendering, ✓ Test checklist, ✓ Status selectors, ✓ Save test, ✓ Evidence type selector |
| `Scenarios` | ✓ List scenarios, ✓ Create/edit form, ✓ Delete confirmation, ✓ Chain vulnerability display |
| `Reports` | ✓ Generate button, ✓ Export markdown, ✓ Summary stats, ✓ Tables render |

### Hooks/Utils

| Item | Test Cases |
|------|------------|
| `useApi` | ✓ Loading/error/data states, ✓ Retry logic |
| `vlsm calculations` | ✓ Client-side matches server |

---

## 4. Packet Tracer Validation (Manual)

### Required CLI Evidence

| Command | Device | Expected Output | Screenshot |
|---------|--------|-----------------|------------|
| `show ip interface brief` | R1, R2, R3 | All interfaces up/up with correct IPs | ✓ |
| `show ip ospf neighbor` | R1, R2, R3 | FULL state on serial links | ✓ |
| `show ip route ospf` | R1, R2, R3 | All 5 department networks learned | ✓ |
| `show ip dhcp binding` | R1, R2, R3 | Leases assigned in each pool | ✓ |
| `ping <remote-PC>` | PC-Eng → PC-Admin, etc. | 5/5 success, <10ms | ✓ |
| `tracert <remote-PC>` | PC-Eng → PC-IT | Path: R1→R2→R3 | ✓ |

### Test Matrix

| Source | Destination | Test Type | Expected | Evidence |
|--------|-------------|-----------|----------|----------|
| Eng PC | Admin PC | ping | Pass | Packet Tracer |
| Eng PC | Finance PC | ping | Pass | Packet Tracer |
| Eng PC | HR PC | ping | Pass | Packet Tracer |
| Eng PC | IT PC | ping | Pass | Packet Tracer |
| Admin PC | Finance PC | ping | Pass | Packet Tracer |
| Admin PC | HR PC | ping | Pass | Packet Tracer |
| Admin PC | IT PC | ping | Pass | Packet Tracer |
| Finance PC | HR PC | ping | Pass | Packet Tracer |
| Finance PC | IT PC | ping | Pass | Packet Tracer |
| HR PC | IT PC | ping | Pass | Packet Tracer |
| R1 | R2 | ospf-neighbor | FULL | CLI |
| R2 | R3 | ospf-neighbor | FULL | CLI |
| R1 G0/0 | — | interface-status | up/up | CLI |
| R1 G0/1 | — | interface-status | up/up | CLI |
| R2 G0/0 | — | interface-status | up/up | CLI |
| R2 G0/1 | — | interface-status | up/up | CLI |
| R3 G0/0 | — | interface-status | up/up | CLI |
| R1 | Eng Pool | dhcp-lease | Assigned | CLI |
| R2 | Fin Pool | dhcp-lease | Assigned | CLI |
| R2 | HR Pool | dhcp-lease | Assigned | CLI |
| R3 | IT Pool | dhcp-lease | Assigned | CLI |

---

## 5. Failure Scenario Validation

### R2–R3 Link Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Shutdown R2 S0/0/1 | Link down |
| 2 | Wait 40s (dead timer) | OSPF adjacency drops |
| 3 | Ping R3 from R1 | Request timeout |
| 4 | Ping IT PC from Eng PC | Request timeout |
| 5 | `show ip route` on R1 | 10.10.1.0/28, 10.10.1.20/30 removed |
| 6 | Restore link | Adjacency reforms, routes return |

### R1–R2 Link Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Shutdown R1 S0/0/0 | Link down |
| 2 | Ping R2/R3 from R1 | Timeout |
| 3 | Ping Finance/HR/IT from Eng | Timeout |
| 4 | R2/R3 still communicate | Yes (R2-R3 intact) |

---

## 6. Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response (VLSM calc) | <100ms | Average of 100 runs |
| API Response (design CRUD) | <200ms | P95 |
| Frontend Load (LCP) | <2s | Lighthouse |
| Topology Render (50 nodes) | <500ms | React Flow mount |
| MongoDB Query (design list) | <50ms | Indexed query |

---

## 7. Accessibility Checklist

- [ ] Semantic HTML structure
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ≥4.5:1
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Alt text for icons (or aria-hidden)

---

## 8. Test Execution

### Automated
```bash
# All tests
npm test

# API only
npm run test --workspace=apps/api

# Frontend only
npm run test --workspace=apps/web

# Watch mode
npm run test:watch --workspace=apps/api
```

### Manual (Pre-Demo)
1. Open Packet Tracer, load `corporatenet.pkt`
2. Run all CLI commands in validation table
3. Capture screenshots → `network/evidence/`
4. Open dashboard at `http://localhost:5173`
5. Verify each page loads without errors
6. Run through demo script (Plan.md §20)

---

## 9. Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| VLSM mathematically valid | Unit tests + manual calc check |
| Addresses match Packet Tracer | CLI `show ip int brief` vs design |
| OSPF neighbors FULL | CLI `show ip ospf neighbor` |
| DHCP leases correct | CLI `show ip dhcp binding` |
| Cross-dept ping works | 10/10 pings successful |
| Website shows verified status | Badges match evidence |
| API validates all inputs | 422 on invalid payloads |
| MongoDB persists designs | CRUD survives restart |
| Report exports markdown | File opens correctly |
| Demo script runs in 5min | Timed rehearsal |