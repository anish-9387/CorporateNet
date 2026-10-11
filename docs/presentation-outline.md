# CorporateNet Presentation Outline

**Duration:** 10-12 slides, ~5 minutes  
**Audience:** Faculty evaluators  
**Format:** Live demo + slides

---

## Slide 1: Title (0:00-0:10)

**CorporateNet: Scalable Corporate Network with VLSM & OSPF**

- Course: 21CSC302J — Computer Networks
- Team: [Names]
- Date: [Date]

**Visual:** Network topology diagram thumbnail

---

## Slide 2: Problem Statement (0:10-0:30)

**Why VLSM + OSPF?**

- Fixed-size subnets waste addresses (e.g., /24 for 12 hosts = 242 wasted)
- Static routes don't scale — manual updates on every topology change
- Corporate networks need: efficiency, automatic failover, centralized visibility

**Our Solution:** VLSM for address efficiency + OSPF for dynamic routing + Web dashboard for validation

---

## Slide 3: Network Design (0:30-0:50)

**Topology:** 3-Router Chain (R1–R2–R3)

```
[Eng: 100]──R1──(Serial)──R2──(Serial)──R3──[IT: 12]
    │           │           │
  [Admin:50]  [Fin:25]    [HR:20]
```

**Address Block:** 10.10.0.0/23 (512 addresses)

| Dept | Hosts | Allocated | Prefix | Utilization |
|------|-------|-----------|--------|-------------|
| Engineering | 100 | 10.10.0.0/25 | /25 | 79% |
| Administration | 50 | 10.10.0.128/26 | /26 | 81% |
| Finance | 25 | 10.10.0.192/27 | /27 | 83% |
| HR | 20 | 10.10.0.224/27 | /27 | 67% |
| IT Support | 12 | 10.10.1.0/28 | /28 | 86% |
| R1–R2 Link | 2 | 10.10.1.16/30 | /30 | 100% |
| R2–R3 Link | 2 | 10.10.1.20/30 | /30 | 100% |

**Key Point:** 52% address utilization, 45% reserved for growth

---

## Slide 4: VLSM Calculation (0:50-1:10)

**Algorithm:** Largest-First Allocation

1. Sort departments by host count descending
2. Calculate minimum prefix: `32 - ceil(log2(hosts + 2))`
3. Allocate from network start, align to boundary
4. Verify no overlap, within parent block

**Demo:** Live VLSM Studio — change HR from 20→50 hosts, watch recalculation

---

## Slide 5: OSPF Configuration (1:10-1:30)

**Single Area 0, Process ID 1**

```
R1: router-id 1.1.1.1  → networks: Eng, Admin, R1-R2
R2: router-id 2.2.2.2  → networks: Fin, HR, R1-R2, R2-R3
R3: router-id 3.3.3.3  → networks: IT, R2-R3
```

**Passive Interfaces:** All LAN interfaces (no OSPF hellos to PCs)

**Verification (Packet Tracer):**
- `show ip ospf neighbor` → FULL on both serial links
- `show ip route ospf` → All 5 department networks learned

---

## Slide 6: DHCP & Connectivity (1:30-2:00)

**DHCP Pools per Router**

| Router | Pool | Network | Excluded (Gateway) |
|--------|------|---------|-------------------|
| R1 | ENG_POOL | 10.10.0.0/25 | 10.10.0.1 |
| R1 | ADMIN_POOL | 10.10.0.128/26 | 10.10.0.129 |
| R2 | FIN_POOL | 10.10.0.192/27 | 10.10.0.193 |
| R2 | HR_POOL | 10.10.0.224/27 | 10.10.0.225 |
| R3 | IT_POOL | 10.10.1.0/28 | 10.10.1.1 |

**Validation:** `show ip dhcp binding` → Leases in each subnet

**Cross-Department Ping:** 10/10 successful (Eng↔Admin, Eng↔Fin, Eng↔HR, Eng↔IT, Admin↔Fin, Admin↔HR, Admin↔IT, Fin↔HR, Fin↔IT, HR↔IT)

---

## Slide 7: Dashboard Overview (2:00-2:30)

**Live Demo: Overview Page**

- Real-time stats: 3 routers, 5 departments, 7 subnets, 52% utilization
- Department subnet table with gateway/mask
- OSPF status: "Configured" (validated in Packet Tracer)
- Quick navigation to all modules

---

## Slide 8: Topology Explorer (2:30-3:00)

**Live Demo: Topology Page (React Flow)**

- Interactive graph: routers, switches, PCs
- Click node → interface details, IPs, connected networks
- Click link → network CIDR, medium type
- Legend: device types, link media
- Minimap for navigation

---

## Slide 9: Routing Lab (3:00-3:30)

**Live Demo: Routing Page**

- **Overview:** OSPF config, router IDs, expected network statements
- **Neighbors:** FULL adjacencies with neighbor IPs, dead timers
- **Routes:** Complete table with codes (C=Connected, O=OSPF)
- **Evidence:** Actual Packet Tracer CLI output with "Verified" badges

---

## Slide 10: Diagnostics & Testing (3:30-4:00)

**Live Demo: Diagnostics Page**

- Connectivity matrix (department ↔ department)
- Test checklist with status tracking:
  - Interface status ✓
  - OSPF neighbors ✓
  - OSPF routes ✓
  - DHCP leases ✓
  - Ping tests ✓
  - Traceroute ✓
- Evidence type classification: CLI / Ping / Manual / Simulated

---

## Slide 11: Failure Scenario (4:00-4:30)

**Live Demo: Scenarios Page**

**Chain Topology Vulnerability:**
- R1–R2 failure → Engineering/Admin isolated from Finance/HR/IT
- R2–R3 failure → IT Support completely partitioned

**Why?** No alternate path exists in chain topology

**Demo:** Create "R2-R3 Link Failure" scenario
- Failed link: R2 S0/0/1 ↔ R3 S0/0/0
- Affected: 10.10.1.0/28 (IT), 10.10.1.20/30 (R2-R3)
- Expected: IT unreachable from rest, OSPF converges in ~40s

**Future Fix:** Add R1–R3 link (ring topology) for full redundancy

---

## Slide 12: Reports & Summary (4:30-5:00)

**Live Demo: Reports Page**

- One-click Markdown export
- Complete documentation: topology, addressing, OSPF, tests, scenarios
- Versioned, timestamped, source-attributed

---

## Key Achievements

✅ **VLSM** — 52% utilization vs 12% with fixed /24  
✅ **OSPF** — Dynamic routing, automatic convergence  
✅ **DHCP** — Automatic client addressing per department  
✅ **Validation** — All tests documented with Packet Tracer evidence  
✅ **Dashboard** — Interactive exploration, no live PT dependency claimed  
✅ **Failure Analysis** — Clear limitation identification + remediation path  

---

## Q&A Preparation

**Likely Questions:**

1. *"Why not use a live Packet Tracer API?"* → No supported public API; dashboard uses shared dataset + manual evidence import for integrity
2. *"How does VLSM handle growth?"* → Reserved capacity field in calculator; remaining space shown for future allocation
3. *"What if we add a 6th department?"* → Recalculate in VLSM Studio, remaining /29, /27, /26, /25 blocks available
4. *"Can this scale to 50 routers?"* — Backend/API scales; frontend would need virtualized rendering for topology
5. *"Why chain topology?"* — Minimal viable for demonstrating OSPF + failure scenario; ring is documented extension

---

## Demo Script (5-Minute Faculty Demo)

| Time | Action | Page |
|------|--------|------|
| 0:00 | Open dashboard, show overview stats | `/` |
| 0:40 | Navigate to topology, click R1, click R1-R2 link | `/topology` |
| 1:30 | VLSM Studio: change Engineering 100→150, show recalc | `/vlsm` |
| 2:15 | Routing: show OSPF neighbors (Verified badge), routes | `/routing` |
| 3:10 | Diagnostics: show matrix all green, checklist | `/diagnostics` |
| 4:00 | Scenarios: show R2-R3 failure, explain no redundancy | `/scenarios` |
| 4:40 | Reports: export markdown, show file | `/reports` |
| 5:00 | Summary slide | — |