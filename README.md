# CorporateNet

A frontend-only companion for the 43-device **Scalable Corporate Network** Packet Tracer lab. It explains the topology, every device, VLSM, OSPF, DHCP, wireless bridging, NAT/PAT, and packet paths without requiring an API or database.

## Run the website

Requires Node.js 20+.

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
corepack pnpm install
npm run dev
```

Open **http://localhost:5173**. For the one-button demonstration, open **/simulation**, select **Present**, then **Simulate**. Pause, resume, replay, reset, zoom, and device inspection are available. Press Escape to exit presentation mode.

```powershell
npm run build
npm test
npm run preview
```

The verified frontend build has 43 devices, 43 links, client-side VLSM, and no backend/API calls. If port 5173 is occupied, use the URL printed by Vite.

## Open the native lab

Open [Scalable_Corporate_Network_CN.pkt](network/packet-tracer/Scalable_Corporate_Network_CN.pkt) in Cisco Packet Tracer 9.0.1 or a compatible newer version. Let DHCP, STP, ARP, and OSPF converge before testing.

The lab contains:

- 2 routers, 4 multilayer switches, and 7 access switches
- 4 servers, 2 WLCs, 2 lightweight APs, 2 autonomous APs, and 2 WRT bridges
- 7 PCs and 11 laptops
- 43 devices and 43 wired/wireless links in total

Corporate addressing comes from `10.10.0.0/23`. The simulated WAN/public side uses RFC 5737 TEST-NET ranges; it is not the real Internet.

| Department | Required hosts | Subnet | Gateway |
|---|---:|---|---|
| Engineering | 100 | 10.10.0.0/25 | 10.10.0.1 |
| Administration | 50 | 10.10.0.128/26 | 10.10.0.129 |
| Finance | 25 | 10.10.0.192/27 | 10.10.0.193 |
| HR | 20 | 10.10.0.224/27 | 10.10.0.225 |
| IT Support | 12 | 10.10.1.0/28 | 10.10.1.1 |
| Servers | — | 10.10.1.64/28 | 10.10.1.65 |

OSPF process 1/area 0 joins west, core, east, servers, and edge. Router0 performs PAT to the ISP. Both WRT devices use LAN ports with DHCP disabled, so they act as Layer-2 wireless bridges instead of creating isolated NAT LANs.

## What the browser does

| Route | Purpose |
|---|---|
| `/` | Lab summary and addressing overview |
| `/simulation` | One-click ten-stage narrated packet demonstration |
| `/topology` | Interactive all-device path explorer and link-failure illustration |
| `/device-guide` | Purpose, justification, interfaces, and neighbors for every device |
| `/vlsm` | Client-side VLSM calculator |
| `/architecture` | Network design explanation |

The source of the browser model is [labData.ts](apps/web/src/data/labData.ts). It is a visual explanation of the saved `.pkt`; it does not emulate IOS timing or prove native connectivity. Native results belong in [connectivity-matrix.csv](network/packet-tracer/connectivity-matrix.csv) and the [lab guide](network/packet-tracer/README.md).

## Packet Tracer MCP

The `packet-tracer` MCP server and its skill are installed at user level, and `MCP-Control-Center.pts` is installed under Packet Tracer 9.0.1. Restart Codex after installation so the MCP tools load. Restart Packet Tracer, approve the one-time **MCP-Control-Center** module prompt, then open **Extensions → MCP BUILDER** before native automation.

The MCP bridge is local-only and authenticated. It can inspect interfaces, routes, OSPF, DHCP, NAT, send real pings/PDUs, step simulation, and save the `.pkt`; the website remains deliberately independent.

## Documentation

- [Presentation outline](docs/presentation-outline.md)
- [Speaking and live-demo script](docs/present-to-sir.md)
- [Run and simulation guide](docs/run-and-simulate.md)
- [Architecture](docs/architecture.md)
- [Packet Tracer lab guide](network/packet-tracer/README.md)
- [VLSM address plan](network/addressing/vlsm-plan.md)

The current native audit is evidence-based, not an assumption from the graph. Layer-2 APs without IP addresses cannot originate ICMP; verify their forwarding through associated wireless clients.
