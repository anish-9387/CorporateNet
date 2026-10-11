# CorporateNet

## Complete Project Plan and Technical Blueprint

**Project topic:** Scalable Corporate Network Using VLSM and OSPF\
**Course:** 21CSC302J --- Computer Networks\
**Simulation:** Cisco Packet Tracer\
**Web platform:** Vite + React + TypeScript\
**Backend:** Node.js + Express + TypeScript\
**Database:** MongoDB (recommended for persistence; optional for a
static/demo-only MVP)

------------------------------------------------------------------------

## 1. Executive Summary

CorporateNet is a computer-networking project supported by a web-based
Network Intelligence Dashboard. The network simulation demonstrates
Variable Length Subnet Masking (VLSM), OSPF dynamic routing, DHCP, IPv4
addressing, connectivity testing, and selected security controls. The
website presents the design and validated evidence through an
interactive topology, subnet calculator, routing explorer, diagnostics
workspace, and report view.

**Important boundary:** Cisco Packet Tracer remains the network
simulator and source of truth for router behavior. The website must not
claim that it is reading Packet Tracer live unless a real, supported
integration is implemented and tested. For the initial release, the
website uses a shared network-design dataset and explicitly labelled
test results entered or imported after validation.

## 2. Problem Statement

Organizations need IP address plans that avoid unnecessary address waste
while allowing departments to communicate reliably. Manual routing
configuration can become difficult to maintain as a network grows.
Students also need a clear way to demonstrate the design, configuration,
and observed behavior of their simulated network.

This project designs a scalable corporate network using VLSM and OSPF
and builds a companion web application that explains the topology,
calculates subnet allocations, presents routing information, and records
validation evidence.

## 3. Objectives

1.  Design five departmental LANs with different host requirements.
2.  Allocate IPv4 subnets using VLSM and document the calculations.
3.  Configure three routers to exchange routes through single-area OSPF.
4.  Configure DHCP for automatic client addressing.
5.  Validate interface status, OSPF adjacency, learned routes, DHCP
    leases, and cross-department connectivity in Packet Tracer.
6.  Build an interactive web dashboard to explore the design and its
    evidence.
7.  Demonstrate a link-failure scenario and clearly explain the
    topology's limitations.
8.  Store network designs and test records persistently when MongoDB is
    enabled.
9.  Produce a reproducible project report and a 10--12 slide
    presentation.

## 4. Scope and Non-Goals

### In scope

-   Cisco Packet Tracer simulation and `.pkt` deliverable.
-   Five departmental subnets and two point-to-point router links.
-   VLSM calculator and subnet table.
-   Interactive topology visualization.
-   OSPF route and neighbor information display.
-   DHCP configuration checklist.
-   Connectivity test records and failure-scenario demonstration.
-   Basic configuration validation and project report.
-   Responsive frontend and REST API.
-   MongoDB persistence for designs, tests, and scenarios.

### Out of scope for the first release

-   Claiming live monitoring of Packet Tracer without a verified
    integration.
-   Automatically executing arbitrary router commands from the public
    website.
-   Exposing SSH credentials or router management interfaces to the
    browser.
-   Production-grade enterprise network monitoring.
-   Real-time performance claims unsupported by measured tests.
-   Authentication and multi-user administration unless required by the
    team.

## 5. Proposed Network Design

### 5.1 Logical topology

Use three routers in a chain:

-   **R1:** Engineering and Administration LANs.
-   **R2:** Finance and HR LANs.
-   **R3:** IT Support LAN.
-   **R1--R2:** point-to-point `/30` link.
-   **R2--R3:** point-to-point `/30` link.

Use compatible Packet Tracer routers, switches, and serial modules if
using serial links. Verify interface names on the selected model.
Ethernet router-to-router links are also acceptable if the IP plan and
configurations are adjusted consistently.

### 5.2 Department host requirements

  Department         Planned hosts   Prefix   Usable IPv4 hosts
  ---------------- --------------- -------- -------------------
  Engineering                  100      /25                 126
  Administration                50      /26                  62
  Finance                       25      /27                  30
  HR                            20      /27                  30
  IT Support                    12      /28                  14

The planned host counts are design requirements, not the number of
physical PCs that must be placed in Packet Tracer. Use two or three PCs
per LAN for a manageable demonstration, while explaining the full
planned capacity.

## 6. VLSM and IPv4 Address Plan

Use `10.10.0.0/23` as the private corporate allocation. Allocate the
largest subnet first.

  -------------------------------------------------------------------------------------------------------------------
  Network          Network/prefix     Mask                Gateway         Usable host range           Broadcast
  ---------------- ------------------ ------------------- --------------- --------------------------- ---------------
  Engineering      `10.10.0.0/25`     `255.255.255.128`   `10.10.0.1`     `10.10.0.1–10.10.0.126`     `10.10.0.127`

  Administration   `10.10.0.128/26`   `255.255.255.192`   `10.10.0.129`   `10.10.0.129–10.10.0.190`   `10.10.0.191`

  Finance          `10.10.0.192/27`   `255.255.255.224`   `10.10.0.193`   `10.10.0.193–10.10.0.222`   `10.10.0.223`

  HR               `10.10.0.224/27`   `255.255.255.224`   `10.10.0.225`   `10.10.0.225–10.10.0.254`   `10.10.0.255`

  IT Support       `10.10.1.0/28`     `255.255.255.240`   `10.10.1.1`     `10.10.1.1–10.10.1.14`      `10.10.1.15`

  R1--R2           `10.10.1.16/30`    `255.255.255.252`   R1 `.17`, R2    `.17–.18`                   `10.10.1.19`
                                                          `.18`                                       

  R2--R3           `10.10.1.20/30`    `255.255.255.252`   R2 `.21`, R3    `.21–.22`                   `10.10.1.23`
                                                          `.22`                                       
  -------------------------------------------------------------------------------------------------------------------

For a subnet with `h` host bits, ordinary IPv4 usable host capacity is
`2^h - 2`. For example, `/25` leaves seven host bits and supports 126
usable addresses. `/30` is suitable for these point-to-point links in
this educational design.

## 7. System Architecture

``` text
Browser
  |
  | HTTPS / JSON REST
  v
Vite + React + TypeScript Frontend
  |-- Overview Dashboard
  |-- Topology Explorer (React Flow)
  |-- VLSM Studio
  |-- Routing Lab
  |-- Diagnostics and Reports
  |
  v
Node.js + Express + TypeScript API
  |-- Network Design Service
  |-- VLSM Calculation Service
  |-- Topology/Route Read Service
  |-- Scenario Simulation Service
  |-- Validation and Report Service
  |
  v
MongoDB
  |-- Network designs
  |-- Test runs
  |-- Failure scenarios
  |-- Imported/entered evidence
```

**Packet Tracer relationship:** The `.pkt` file is operated and tested
separately. The same documented network specification feeds the web
dashboard. Verified outputs are recorded as evidence. Do not imply the
arrows above represent a live Packet Tracer API connection.

## 8. Technology Stack

### Frontend

-   Vite
-   React
-   TypeScript
-   React Router
-   Tailwind CSS (optional) or CSS Modules/plain CSS
-   React Flow (`@xyflow/react`) for interactive topology
-   Recharts for charts
-   Zod for client-side schema validation where useful
-   Fetch API or Axios for REST calls

**UI constraint:** Do not use shadcn/ui. Build reusable components with
accessible HTML, CSS/Tailwind, and a consistent design system.

### Backend

-   Node.js
-   Express
-   TypeScript
-   Mongoose for MongoDB schemas and validation
-   Zod for request validation
-   Helmet for security headers
-   `cors` with an explicit allowed-origin list
-   `express-rate-limit` for public API rate limiting
-   Pino or another structured logger
-   Vitest or Jest and Supertest for tests

### Database

MongoDB is suitable for storing network design documents, nested
topology metadata, and test history. It is **not required** for the
mathematical VLSM calculation itself. The MVP can calculate subnets in
the backend without a database; MongoDB adds persistence for saved
designs, scenario runs, and evidence.

Use MongoDB Atlas or a local MongoDB instance during development. Keep
connection strings in environment variables and never commit
credentials.

## 9. Frontend Information Architecture

### 9.1 Overview Dashboard (`/`)

Show: - Project name and current design version. - Number of routers,
switches, departments, and planned hosts. - Subnet allocation summary. -
OSPF status as **configured**, **validated**, or **not
verified**---never infer live state. - Most recent connectivity test
results. - Quick links to topology, VLSM, routing, and reports.

### 9.2 Topology Explorer (`/topology`)

-   Render routers, switches, LANs, and links with React Flow.
-   Use clear labels and distinct shapes/icons for router, switch, PC
    group, and server.
-   Select a node to see hostname, interface list, IP address, connected
    network, and notes.
-   Select a link to see endpoints, network/prefix, and validation
    state.
-   Add a legend and zoom/fit controls.
-   Include a "Demo mode" label when statuses are illustrative.

### 9.3 VLSM Studio (`/vlsm`)

Inputs: - Parent network in CIDR notation. - Department name and host
count. - Optional reserved capacity.

Outputs: - Network address, prefix, subnet mask, wildcard mask. -
First/last usable address and broadcast address. - Total and usable
addresses. - Validation for overlap, out-of-range allocation, invalid
CIDR, and insufficient space. - Sort largest subnet first by default. -
Show a visual address-space allocation bar. - Provide a comparison mode
for VLSM versus a selected fixed-size allocation.

Do not hardcode output values in the UI; calculate them from inputs in
the backend and test edge cases.

### 9.4 Routing Lab (`/routing`)

-   Show the documented OSPF area and router-to-router adjacencies.
-   Display imported or entered `show ip route` and
    `show ip ospf neighbor` evidence.
-   Explain OSPF route codes and what a FULL adjacency means.
-   Show expected routes derived from the design separately from
    observed routes.
-   Clearly label any route animation as an educational visualization.

### 9.5 Diagnostics (`/diagnostics`)

-   Record source, destination, timestamp, test type, result, notes, and
    evidence source.
-   Show a connectivity matrix for the departmental networks.
-   Provide a test checklist for interface state, OSPF adjacency, route
    learning, DHCP, ping, and traceroute.
-   Support `passed`, `failed`, `not-run`, and `not-applicable`.
-   Avoid fabricated latency, packet loss, or success rates.

### 9.6 Failure Scenarios (`/scenarios`)

-   Demonstrate the current chain topology's R2--R3 failure.
-   Mark the affected segment and show which destinations are expected
    to become unreachable.
-   Explain that the current chain has no alternate path.
-   Restore the simulated link in the website's educational model.
-   Keep this model separate from the actual Packet Tracer device state.

### 9.7 Reports (`/reports`)

-   Export a design summary containing the topology, addressing table,
    calculations, and test evidence.
-   Use print styles or a tested PDF-generation approach.
-   Include project version, generated date, and an explicit indication
    of which results were verified.
-   Never label unrun tests as passed.

## 10. Backend API Plan

Use `/api/v1` as the API prefix.

  ---------------------------------------------------------------------------------
  Method                  Endpoint                          Purpose
  ----------------------- --------------------------------- -----------------------
  GET                     `/api/v1/health`                  API health and database
                                                            connectivity status

  GET                     `/api/v1/designs`                 List saved network
                                                            designs

  POST                    `/api/v1/designs`                 Create a network design

  GET                     `/api/v1/designs/:id`             Retrieve a design

  PATCH                   `/api/v1/designs/:id`             Update a design

  DELETE                  `/api/v1/designs/:id`             Delete a design, if
                                                            enabled

  POST                    `/api/v1/vlsm/calculate`          Validate and calculate
                                                            subnet allocations

  GET                     `/api/v1/designs/:id/topology`    Return topology nodes
                                                            and edges

  GET                     `/api/v1/designs/:id/routes`      Return
                                                            documented/recorded
                                                            routing information

  POST                    `/api/v1/designs/:id/tests`       Record a test result

  GET                     `/api/v1/designs/:id/tests`       List test history

  POST                    `/api/v1/designs/:id/scenarios`   Create a simulation
                                                            scenario

  GET                     `/api/v1/designs/:id/scenarios`   List scenarios

  GET                     `/api/v1/designs/:id/report`      Return report-ready
                                                            data
  ---------------------------------------------------------------------------------

Use consistent JSON responses and proper HTTP status codes. Validate
route IDs, request bodies, array sizes, host counts, and CIDR inputs.
Add pagination to list endpoints if the records grow.

Example response format:

``` json
{
  "success": true,
  "data": {},
  "meta": {
    "source": "design-dataset",
    "verified": false
  }
}
```

The `verified` field must reflect actual evidence, not a default
assumption.

## 11. MongoDB Data Model

### NetworkDesign

-   `_id`
-   `name`
-   `description`
-   `version`
-   `parentCidr`
-   `departments[]`: name, hostRequirement, networkCidr, gateway,
    subnetMask
-   `devices[]`: deviceId, hostname, type, model, managementIp
-   `interfaces[]`: deviceId, interfaceName, ipAddress, subnetMask,
    networkCidr, passiveOspf
-   `links[]`: linkId, sourceDeviceId, sourceInterface, targetDeviceId,
    targetInterface, networkCidr, medium
-   `ospf`: processId, areas, routerIds
-   `createdAt`, `updatedAt`

### TestRun

-   `_id`
-   `designId`
-   `testType`
-   `source`
-   `destination`
-   `status`: `passed | failed | not-run | not-applicable`
-   `observedOutput`
-   `evidenceType`:
    `packet-tracer-cli | packet-tracer-ping | manual | simulated`
-   `notes`
-   `testedAt`

### Scenario

-   `_id`
-   `designId`
-   `name`
-   `description`
-   `failedLinkId`
-   `affectedNetworks[]`
-   `expectedBehavior`
-   `observedBehavior`
-   `isEducationalSimulation`
-   `createdAt`

Use references between designs and test runs rather than duplicating
entire design documents in every test. Add indexes on `designId`,
`testedAt`, and other fields used for filtering. Store only necessary
data.

## 12. Suggested Repository Structure

``` text
corporatenet/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── topology/
│   │   │   │   ├── charts/
│   │   │   │   └── common/
│   │   │   ├── pages/
│   │   │   ├── features/
│   │   │   │   ├── vlsm/
│   │   │   │   ├── routing/
│   │   │   │   ├── diagnostics/
│   │   │   │   └── scenarios/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   └── vite.config.ts
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── modules/
│       │   │   ├── designs/
│       │   │   ├── vlsm/
│       │   │   ├── topology/
│       │   │   ├── tests/
│       │   │   ├── scenarios/
│       │   │   └── reports/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       └── tests/
├── network/
│   ├── packet-tracer/
│   │   └── corporatenet.pkt
│   ├── configs/
│   │   ├── R1.txt
│   │   ├── R2.txt
│   │   └── R3.txt
│   ├── addressing/
│   │   └── vlsm-plan.md
│   └── evidence/
├── docs/
│   ├── architecture.md
│   ├── testing-plan.md
│   └── presentation-outline.md
├── package.json
├── README.md
└── .gitignore
```

A monorepo is recommended so the frontend, backend, network
configuration, and report materials remain in one repository. npm
workspaces can be added if the team is comfortable with them; separate
`package.json` files are also acceptable.

## 13. Environment Variables

Example backend `.env`:

``` dotenv
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/corporatenet
WEB_ORIGIN=http://localhost:5173
```

Example frontend `.env`:

``` dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Rules: - Commit `.env.example`, not `.env`. - Never expose `MONGODB_URI`
or secrets in any `VITE_*` variable; Vite variables are bundled into
client-side code. - Restrict CORS to the actual frontend origin. - Use
HTTPS in production. - Add `.env`, build outputs, `node_modules`, logs,
and local database files to `.gitignore`.

## 14. Security and Reliability

1.  Validate every request at the API boundary.
2.  Use Helmet and explicit CORS configuration.
3.  Apply rate limiting to public endpoints.
4.  Use least-privilege MongoDB credentials and restrict database
    network access.
5.  Never store router passwords in the database or frontend.
6.  Do not expose arbitrary CLI execution or SSH command endpoints.
7.  Limit request body sizes and enforce maximum host counts and subnet
    inputs.
8.  Handle database unavailability gracefully; show an honest error
    rather than fake saved state.
9.  Log server errors without logging secrets or sensitive connection
    strings.
10. Use environment variables for deployment configuration.
11. If authentication is added, use established password hashing and
    secure session/token handling rather than a homemade scheme.
12. Treat imported router output as untrusted text and escape it before
    rendering.

## 15. Testing Strategy

### Unit tests

-   CIDR parsing and validation.
-   Subnet mask and wildcard-mask calculations.
-   First usable, last usable, and broadcast address calculations.
-   VLSM allocations sorted largest-first.
-   Overlap detection and parent-network boundary validation.
-   Insufficient address-space errors.
-   API request schema validation.

### API integration tests

-   Create, retrieve, update, and list designs.
-   Calculate VLSM through the API.
-   Record and retrieve test runs.
-   Handle malformed IDs and invalid payloads.
-   Handle MongoDB disconnection.
-   Verify correct HTTP status codes.

### Frontend tests

-   Navigation and responsive layout.
-   Selecting topology nodes and links.
-   VLSM results match backend calculations.
-   Clear distinction between expected, simulated, and verified data.
-   Empty, loading, error, and successful states.

### Packet Tracer validation

-   `show ip interface brief`
-   `show ip ospf neighbor`
-   `show ip route ospf`
-   `show ip dhcp binding`
-   `ping <remote-PC-IP>`
-   `tracert <remote-PC-IP>` from a PC, where supported

Save screenshots or command output as evidence. Only mark a test as
passed after it succeeds.

## 16. Failure Demonstration and Future Redundancy

The initial R1--R2--R3 chain is intentionally simple. If the R2--R3 link
fails, R3 loses connectivity to the rest of the topology. OSPF cannot
invent an alternate path where none exists.

Optional extension: - Add an R1--R3 link with a unique, unused
point-to-point subnet. - Advertise the link in OSPF area 0. - Confirm
the new adjacency and route table. - Shut down one link and record
whether a valid alternate route remains. - Measure convergence only if
you capture it using a repeatable method.

Keep the base project stable before adding redundancy.

## 17. Development Phases

### Phase 1 --- Network baseline

-   Finalize the addressing plan.
-   Build the Packet Tracer topology.
-   Configure router interfaces, OSPF, and DHCP.
-   Verify and save the `.pkt` file.

**Exit criteria:** interdepartment connectivity works and core CLI
evidence is saved.

### Phase 2 --- Frontend foundation

-   Initialize Vite, React, and TypeScript.
-   Create routing, layout, sidebar, responsive shell, and theme.
-   Add a typed sample network dataset.
-   Build the topology page.

**Exit criteria:** the dashboard and topology work from the documented
dataset.

### Phase 3 --- Backend and database

-   Initialize Express and TypeScript.
-   Add environment configuration, health route, error middleware, and
    validation.
-   Connect Mongoose to MongoDB.
-   Implement network-design and VLSM endpoints.

**Exit criteria:** valid designs can be saved and retrieved; VLSM API
tests pass.

### Phase 4 --- Routing and diagnostics

-   Add routing evidence views.
-   Add test-run records and the connectivity matrix.
-   Add the educational failure scenario.
-   Clearly distinguish design-derived, simulated, and verified
    observations.

**Exit criteria:** a reviewer can trace displayed values to the design
or recorded evidence.

### Phase 5 --- Reports and polish

-   Add report-ready data and export/print flow.
-   Check responsive layouts, accessibility, empty/error states, and
    performance.
-   Prepare screenshots and presentation slides.

**Exit criteria:** repeatable demo and final artifacts are ready.

## 18. Team Division

For a team of 3--4:

-   **Member 1 --- Network engineer:** Packet Tracer topology, router
    configuration, OSPF, DHCP, and CLI evidence.
-   **Member 2 --- Frontend developer:** Vite app, design system,
    topology visualization, dashboard and VLSM UI.
-   **Member 3 --- Backend developer:** Express API, VLSM service,
    MongoDB models, validation and tests.
-   **Member 4 --- Integration and documentation:** test coordination,
    data consistency, report, presentation, demo script and QA.

For a smaller team, combine integration/documentation with frontend or
networking duties. Use Git branches and agree on shared TypeScript
types/API contracts early.

## 19. Final Deliverables

-   [ ] Cisco Packet Tracer `.pkt` file.
-   [ ] Router configurations for R1, R2, and R3.
-   [ ] Final VLSM and IP addressing tables.
-   [ ] Working Vite + TypeScript frontend.
-   [ ] Node.js + Express + TypeScript backend.
-   [ ] MongoDB schema and setup instructions.
-   [ ] `.env.example` files with no secrets.
-   [ ] Automated tests and test instructions.
-   [ ] Screenshots/CLI evidence from Packet Tracer.
-   [ ] Project report with the required sections.
-   [ ] 10--12 slide presentation.
-   [ ] README with installation, configuration, running, and
    troubleshooting steps.
-   [ ] Demo script showing topology, VLSM, OSPF evidence, DHCP, and
    connectivity.

## 20. Suggested 5-Minute Faculty Demonstration

1.  **0:00--0:40:** Explain the corporate network problem and the five
    departments.
2.  **0:40--1:30:** Open the topology explorer and select a router and
    departmental LAN.
3.  **1:30--2:15:** Change a host requirement in VLSM Studio and explain
    the calculated subnet.
4.  **2:15--3:10:** Show Packet Tracer CLI evidence for OSPF neighbors
    and learned routes.
5.  **3:10--4:00:** Show DHCP assignment and a successful
    cross-department ping.
6.  **4:00--4:40:** Demonstrate the R2--R3 failure scenario and explain
    why the chain has no alternate route.
7.  **4:40--5:00:** Summarize address efficiency, dynamic routing,
    validation, and future redundancy.

## 21. Acceptance Criteria

The project is ready when:

-   VLSM allocations are mathematically valid, non-overlapping, and
    inside the parent block.
-   The addressing table matches the Packet Tracer configuration.
-   OSPF neighbors and learned routes are verified using actual CLI
    output.
-   DHCP clients receive correct subnet and gateway values.
-   Cross-department tests have recorded outcomes and evidence.
-   The website distinguishes expected, simulated, and verified status.
-   The API validates inputs and handles failures without leaking
    secrets.
-   MongoDB persistence works if enabled.
-   The application can be started from documented instructions.
-   The `.pkt`, report, and 10--12 slide presentation are complete.

------------------------------------------------------------------------

## Final Recommendation

Build the project in this order: **Packet Tracer correctness → shared
typed network dataset → Vite dashboard and topology → VLSM API → MongoDB
persistence → routing evidence and scenarios → report and
presentation.**

MongoDB is a good fit for saved network designs and test history, but it
should not complicate the initial subnet calculator. Keep all
calculations deterministic and independently tested. The strongest
submission is one where every network claim shown on the website can be
explained or traced to a configuration, calculation, or recorded test.
