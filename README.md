# Scalable Corporate Network

A visual walkthrough of the Computer Networks project: five departments, shared servers, wireless access, VLSM, OSPF, DHCP and NAT.

## Run

Requires Node.js 22.13+ and pnpm 11.13.

```sh
pnpm install
pnpm dev
```

Open the URL printed in the terminal (normally http://localhost:5173).

## Present

1. Start on the introduction to explain the goal and network layers.
2. Open **Packet simulation**, select **Present**, then **Simulate**.
3. Pause to explain a packet hop; click a device to show its role.
4. Use **IP addressing** for the department subnets and **Devices & roles** for viva questions.

The website illustrates packet paths. Open [the Packet Tracer project](network/packet-tracer/Scalable_Corporate_Network_CN.pkt) to show live protocol behaviour. The browser model shows 43 network devices and 43 diagram links; the native audit counted 46 objects including three power objects and 49 link entries. There are 22 IP end devices. The [audit completed 8 November 2026](network/packet-tracer/connectivity-audit-2026-11-07.md) recorded all 231 unique end-device pairs passing after retries where needed; it did not save in-memory state or test every application and separately initiated reverse flow.

## Project files

- `web/` — React frontend and simulation.
- `network/` — Packet Tracer lab and addressing plan.
- `docs/` — presentation notes, architecture and the native topology screenshot. The report is maintained outside this repository.

```sh
pnpm lint
pnpm build
pnpm test
pnpm preview
```

See the [presentation outline](docs/presentation-outline.md) and [run guide](docs/run-and-simulate.md).
