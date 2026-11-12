# Run and demonstrate Scalable Corporate Network

## Browser demonstration

Requirements: Node.js 22.13+, pnpm 11.13 (pinned in package.json), and an initial Internet connection for dependency installation.

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
pnpm install
pnpm dev
```

Open **http://localhost:5173/simulation** and select **Present → Simulate**. The ten stages cover VLSM, DHCP request/response, OSPF, DNS, HTTP, simulated ISP traffic, a server-link failure, and recovery.

- Pause/Resume while explaining a stage.
- Replay restarts the sequence; Reset clears it.
- Click a device to show its description and connections.
- Use the React Flow controls to zoom; Escape exits presentation mode.
- If Vite chooses another port, use the printed URL with `/simulation`.

The browser is fully local after it is built. It has no API, database, authentication, or Packet Tracer login. It illustrates graph paths; it does not execute IOS or emulate protocol timers.

## Native Packet Tracer demonstration

Open [Scalable_Corporate_Network_CN.pkt](../network/packet-tracer/Scalable_Corporate_Network_CN.pkt) in Packet Tracer 9.0.1 or newer.

1. Use **Realtime** first and allow DHCP, STP, ARP, and OSPF to converge.
2. On a client, open **Desktop → IP Configuration** or Command Prompt `ipconfig` and identify its subnet, gateway, and DNS server.
3. Open `http://intranet.corporate.test` and `http://www.isp.test` from a suitable client. These services are simulated inside the lab.
4. Switch to **Simulation**, filter for ARP and ICMP, select **Add Simple PDU**, then click a source and destination endpoint. Use **Capture/Forward** to explain each hop.
5. A first ICMP attempt may time out while ARP resolves. Retry and record both attempts honestly.
6. For DHCP, filter DHCP and renew a client lease to show Discover, Offer, Request, and ACK.
7. On the core CLI use `enable`, `show ip ospf neighbor`, and `show ip route`. On Router0 use `show ip nat translations` after generating traffic to `203.0.113.2`.

Do not expect an unmanaged Layer-2 AP with no IP address to originate a ping. Test the AP path using one of its associated wireless clients.

## MCP-assisted native audit

The Packet Tracer MCP installation has four parts:

1. `uv`/`uvx` user runtime.
2. Codex MCP entry named `packet-tracer`.
3. Packet Tracer agent skill under the user skills directory.
4. `MCP-Control-Center.pts` under Packet Tracer's extensions directory.

After installation, restart Codex so the tools load. Restart Packet Tracer and approve the one-time module prompt yourself, then open **Extensions → MCP BUILDER**. The local bridge can then inspect live state, issue host/IOS commands, send PDUs, read packet traces, and save the project.

## Build and verification

```powershell
pnpm lint
pnpm build
pnpm test
pnpm preview
```

Open the preview URL and exercise `/`, `/simulation`, `/topology`, `/device-guide`, `/vlsm`, and `/architecture`. The automated suite checks topology integrity, documented gateways, wireless links, all 231 browser graph pairs, demonstration routes, VLSM input validation and free blocks, path finding, layout, and common buttons. Browser graph checks are not native ICMP tests. See the [native audit](../network/packet-tracer/connectivity-audit-2026-11-07.md) for the recorded Packet Tracer results.

## Troubleshooting

| Symptom | Action |
|---|---|
| Vite port is occupied | Open the alternate local URL printed by Vite. |
| First Packet Tracer ping fails | Let ARP/routing converge, then retry and inspect the event list. |
| Wireless client has `169.254.x.x` | Check SSID/security, AP/controller association, DHCP scope, VLAN, and gateway. |
| MCP reports Packet Tracer disconnected | Open **Extensions → MCP BUILDER**, then retry. Restart Packet Tracer if the extension was just installed. |
| AP cannot be selected as PDU source | It has no IP address; use an associated client to verify forwarding. |
| Browser and Packet Tracer differ | Treat the `.pkt` as native truth and update `labData.ts` after verified changes. |
