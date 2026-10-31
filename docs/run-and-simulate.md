# Run and demonstrate CorporateNet

## One-click presentation — no database

Requires Node.js 20+ and npm. In PowerShell:

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
npm install
npm run dev:web
```

Open **http://localhost:5173/simulation**. Use Vite's printed port if different. Click **Present → Simulate**. Ten narrated stages run in about one minute: VLSM; DHCP request/response; OSPF overview; DNS query/reply; HTTP; ISP ICMP; server-link failure; recovery.

Use Pause/Resume while explaining, Replay simulation to restart, Reset to clear progress, and Escape to leave presentation mode. Zoom and click devices for port/address details. Keep the terminal running; Ctrl+C stops it. Install dependencies in advance so installation/network access does not interrupt the session.

No API, MongoDB, Atlas account or Packet Tracer login is needed for this browser page. It uses a manually transcribed local model and does not control Packet Tracer or run IOS/protocol timers. The [presentation outline](presentation-outline.md) supplies slides/timing; [present-to-sir](present-to-sir.md) supplies the practical speaking script.

## Open and animate the actual lab

Open [Scalable_Corporate_Network_CN.pkt](../network/packet-tracer/Scalable_Corporate_Network_CN.pkt) in Packet Tracer 9.0.1 or a compatible newer version. No Node.js/MongoDB is needed for the .pkt itself.

1. Select **Realtime** and allow DHCP, spanning tree and OSPF convergence. Fast-forward time if needed.
2. Show **PC3 → Desktop → IP Configuration**: Finance /27, gateway 10.10.0.193, DNS 10.10.1.66. Observed lease was 10.10.0.194; leases can change.
3. Open its Web Browser: `http://intranet.corporate.test`, then `http://www.isp.test`. These are simulated lab services.
4. Close the device window; select **Simulation → Edit Filters → ARP + ICMP**. Use **Add Simple PDU** (closed envelope), click Laptop0 then PC3, and choose **Auto Capture/Play** or **Capture/Forward**. Click an event to inspect OSI/PDU details. Allow convergence and retry if the initial packet fails during ARP resolution.
5. To show DHCP, enable its filter and change a client from Static to DHCP; step through Discover, Offer, Request, ACK.
6. In Realtime, show core CLI `enable`, `show ip ospf neighbor`, `show ip route`; on west/east show `show ip dhcp binding`.
7. If repeating failover, follow [the detailed script](present-to-sir.md): disable only core Fa0/2, test PC3 → server2 after convergence, then restore Fa0/2 and verify FULL adjacency. “Primary/backup” are browser labels, not guaranteed active/standby routing.

Use a copy if you want to save demonstration changes. To discard changes, reopen the saved lab without saving. See [lab observations](../network/packet-tracer/README.md) and [the address plan](../network/addressing/vlsm-plan.md). Do not paste the older R1/R2/R3 text configurations into this topology.

## Optional temporary database demo

```powershell
npm run demo
```

This starts both servers and a real temporary MongoDB process, seeded with the **older R1–R2–R3 network** (eight modeled devices, seven links). First use may download a MongoDB binary. Data disappears when that process stops. Open http://localhost:5173 for the saved-design overview, or navigate directly to `/topology` to inspect this separate example. The overview's presentation button opens `/simulation`, not the saved-design graph.

On `/topology`, R1 → R3 is a two-link chain path; removing R1–R2 partitions it. This chain failure is different from the completed lab's redundant server-link demonstration. Other pages let you calculate/save designs, inspect expected routing, record manual diagnostics, document failures and export a report. None sends real ping/IOS commands. Saving a design does not update the .pkt or `/simulation`.

## Persistent database dashboard

Run MongoDB locally or supply a working MongoDB URI. Preserve existing environment files:

```powershell
if (!(Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
if (!(Test-Path apps/web/.env)) { Copy-Item apps/web/.env.example apps/web/.env }
# Edit apps/api/.env: configure MONGODB_URI for your database.
# For local proxy use, apps/web/.env can set VITE_API_BASE_URL=/api/v1.
npm run db:seed
npm run dev
```

The persistent seed preserves an existing starter design and repairs legacy hostname/device-ID references; it does not import the 43-device model. Use the temporary demo if you want disposable data.

| Setting / URL | Default |
|---|---|
| Frontend | http://localhost:5173 |
| API health | http://localhost:3000/api/v1/health |
| API base | http://localhost:3000/api/v1 |
| MONGODB_URI | mongodb://127.0.0.1:27017/corporatenet |
| WEB_ORIGIN | http://localhost:5173 |
| VITE_API_BASE_URL | /api/v1 when unset |
| Vite API_PROXY_TARGET | http://localhost:3000 when unset |

Never put a database URI/password into a VITE_* variable or shared documentation.

## Build and verify

```powershell
npm run build:web
npm run test --workspace=apps/web
```

Rehearse the browser manually: run the ten-stage sequence, pause/resume during a packet, replay, reset, inspect a device, and enter/exit presentation mode. Use the [speaking script](present-to-sir.md) for the demonstration sequence.

For both workspaces: `npm run build` and `npm test`. API tests start/clean up their own temporary MongoDB; first use may require a binary download. Do not infer current backend results from older records.

To preview the built frontend, use `npm run preview --workspace=apps/web` and its printed URL, adding `/simulation`. The built API starts with `npm run start --workspace=apps/api`; there is no root start script. Production hosting/TLS/proxy configuration is outside this local demo setup.

## Troubleshooting before presenting

| Symptom | Action |
|---|---|
| Atlas SRV/DNS connection error | Use `npm run dev:web` and `/simulation` for the presentation; this page needs no database. For saved-design pages, correct the database/network configuration or use a working local URI/temporary demo. |
| Overview reports API offline | Open `/simulation` for the local walkthrough, or start the API/database for saved-design pages. |
| Vite uses a different port | Open its printed local URL with `/simulation`; if using the API directly, keep WEB_ORIGIN consistent. |
| First Packet Tracer ping fails | Converge in Realtime and retry after ARP resolution; record retries honestly. |
| Wireless DHCP absent | Check the correct SSID/security/key and controller/AP association, then request DHCP in the expected subnet. |
| Diagram looks different from Overview | Expected: `/simulation` is the local 43-device model; other pages use the latest saved database design. |
