# Run and demonstrate CorporateNet

## Fastest demo (no MongoDB installation)

Install Node.js 20 or newer. In PowerShell:

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
npm install
npm run demo
```

Open http://localhost:5173. The demo starts a real, temporary MongoDB process, seeds the five-department / three-router network, and runs both servers. The first run needs internet access to download MongoDB. Stop both servers with Ctrl+C. Demo data disappears when the temporary database stops; use the persistent setup below to keep your work.

If port 3000 or 5173 is already occupied, stop that project's previous servers first. The Vite frontend proxies `/api` to the API. Prefer `VITE_API_BASE_URL=/api/v1` in `apps/web/.env` for local use.

## Present the simulation

1. Open **Overview** and explain the routers, five departmental subnets, and address utilization. Select **Open simulation**.
2. In **Topology**, leave **From = R1**, **To = R3**, and **All links healthy**. Moving dots follow R1 → R2 → R3; the status reads **Reachable · 2 hops**.
3. Use **Pause simulation**, **Resume simulation**, and **Speed**. Drag a device, zoom, and click a router to inspect its interfaces.
4. Under **Link state**, choose **R1 ↔ R2 offline**. The failed link turns red and the route becomes **Unreachable**. The chain has no alternate route.
5. Select **Reset** to restore connectivity. Try **SW-Eng → SW-IT** to follow traffic through access switches and routers.
6. In **VLSM Studio**, change host requirements or reserved capacity. Allocation updates after a short pause. Invalid CIDRs or insufficient address space disable saving. **Save Design** creates a connected star design with one core router and an access switch per department. Other pages use the most recently created design. Restart the temporary demo to return to the original three-router network.
7. In **Routing Lab**, inspect expected OSPF neighbors and choose a router in **Route Table**. CLI output is illustrative, not collected evidence.
8. In **Diagnostics**, record a status, evidence type, and notes for a connectivity check. Notes save when you leave the field. These are recorded observations; the dashboard does not send real pings. **Mark All Passed** records a manual assessment.
9. In **Failure Scenarios**, create a documented failure using an actual link from the dropdown. Use the Topology controls to demonstrate it visually.
10. In **Reports**, select **Generate Report**, then **Export Markdown**.

The web simulation models graph reachability. It does not emulate Cisco IOS, DHCP exchanges, packet timing, or OSPF convergence timers.

## Persistent setup

Install and run MongoDB locally, or provide your MongoDB connection string. Then:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
# Edit apps/api/.env: set MONGODB_URI to your database.
npm run db:seed
npm run dev
```

Keep existing `.env` files if already configured; the copy commands above are for a fresh checkout. The seed is repeatable: it preserves an existing starter design and repairs legacy hostname/device-ID references.

- Frontend: http://localhost:5173
- API health: http://localhost:3000/api/v1/health
- API base: http://localhost:3000/api/v1

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Unit and integration tests start and clean up their own temporary database. Browser tests start a separate seeded API on port 3100 and a frontend on port 5174. They never use your configured persistent database. The first test run needs internet for the MongoDB binary; subsequent runs use its cache. Chromium installation is needed once per machine.

## Cisco Packet Tracer demonstration

There is no `.pkt` file in this checkout. Build the topology manually in Packet Tracer using three Cisco 2911 routers and five access switches. Add serial modules with the routers powered off, connect R1—R2—R3, then connect Engineering and Administration to R1, Finance and HR to R2, and IT Support to R3.

Use the commands in `network/configs/R1.txt`, `R2.txt`, and `R3.txt`; adapt interface names and set `clock rate` on the DCE ends of serial links as appropriate for your cabling. Use `network/addressing/vlsm-plan.md` for addressing. Add one PC per department, connect it to its switch, and select DHCP.

Validate on the routers:

```text
show ip interface brief
show ip ospf neighbor
show ip route ospf
show ip dhcp binding
```

From a PC, ping a PC in another department and use `tracert <remote-PC-IP>`. In Packet Tracer **Simulation** mode, filter for ICMP and use **Add Simple PDU** between two PCs. Use **Auto Capture / Play** to show the packet traversing the network. To demonstrate failure, shut a serial interface, verify the lost adjacency and failed ping, then use `no shutdown` and recheck. Save your `.pkt` and actual CLI evidence separately.
