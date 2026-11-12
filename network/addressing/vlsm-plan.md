# Scalable Corporate Network — address plan

Aligned to the configuration and audit records completed 8 November 2026. Corporate parent: **10.10.0.0/23** (10.10.0.0–10.10.1.255, 512 addresses). This describes [the lab](../packet-tracer/Scalable_Corporate_Network_CN.pkt) and `/simulation`; consult [verification notes](../packet-tracer/README.md) for tested paths and final save status.

## Department and server allocation

| Segment | Required hosts | Network | Mask | Gateway | Usable range | Broadcast | Nominal usable |
|---|---:|---|---|---|---|---|---:|
| Engineering | 100 | 10.10.0.0/25 | 255.255.255.128 | 10.10.0.1 | 10.10.0.1–126 | 10.10.0.127 | 126 |
| Administration | 50 | 10.10.0.128/26 | 255.255.255.192 | 10.10.0.129 | 10.10.0.129–190 | 10.10.0.191 | 62 |
| Finance | 25 | 10.10.0.192/27 | 255.255.255.224 | 10.10.0.193 | 10.10.0.193–222 | 10.10.0.223 | 30 |
| HR | 20 | 10.10.0.224/27 | 255.255.255.224 | 10.10.0.225 | 10.10.0.225–254 | 10.10.0.255 | 30 |
| IT Support | 12 | 10.10.1.0/28 | 255.255.255.240 | 10.10.1.1 | 10.10.1.1–14 | 10.10.1.15 | 14 |
| Servers | — | 10.10.1.64/28 | 255.255.255.240 | 10.10.1.65 | 10.10.1.65–78 | 10.10.1.79 | 14 |

Range endings abbreviate the last octet. Nominal usable addresses include gateways/infrastructure; this is not the available DHCP pool or active-client count. HR wireless clients now join this /27 directly through Wireless Router0's LAN bridge.

## Routed corporate links

All use mask **255.255.255.252 (/30)**, two usable addresses.

| Link | Subnet | Endpoint A | Endpoint B | Broadcast |
|---|---|---|---|---|
| Core–west | 10.10.1.16/30 | core Fa0/1: 10.10.1.17 | dist-west Fa0/2: 10.10.1.18 | 10.10.1.19 |
| Core–east | 10.10.1.20/30 | core Fa0/5: 10.10.1.21 | dist-east Fa0/1: 10.10.1.22 | 10.10.1.23 |
| Core–servers A | 10.10.1.24/30 | core Fa0/2: 10.10.1.25 | servers Fa0/4: 10.10.1.26 | 10.10.1.27 |
| Core–servers B | 10.10.1.28/30 | core Fa0/3: 10.10.1.29 | servers Fa0/5: 10.10.1.30 | 10.10.1.31 |
| Core–edge | 10.10.1.112/30 | core Fa0/4: 10.10.1.113 | edge Fa0/0: 10.10.1.114 | 10.10.1.115 |

## ISP and wireless client networks

| Segment | Subnet | Endpoints / gateway |
|---|---|---|
| Edge–ISP serial | 198.51.100.0/30 | edge S0/3/0: 198.51.100.1; ISP S0/3/0: 198.51.100.2 |
| ISP client LAN | 192.168.13.0/24 | ISP Fa0/1: 192.168.13.1; WLC1: 192.168.13.2 |
| Simulated external server | 203.0.113.0/24 | ISP Fa0/0: 203.0.113.1; server4: 203.0.113.2 |
| HR WLAN | 10.10.0.224/27 | Wireless Router0 LAN Ethernet1 bridge; clients use gateway 10.10.0.225 |
| ISP WLAN through WRT | 192.168.13.0/24 | Wireless Router1 LAN Ethernet1 bridge; clients use gateway 192.168.13.1 |

Both WRT devices use LAN Ethernet1 uplinks with their local DHCP servers disabled. HR wireless clients belong to the corporate HR allocation; ISP clients are outside the corporate /23. Router0 performs PAT using 198.51.100.1 for corporate traffic to 203.0.113.0/24, while ACL 101 exempts routed traffic to 192.168.13.0/24. The WAN and external-server networks are documentation ranges for simulation.

## Static services and management

| Device / service | Address | Notes |
|---|---|---|
| server1 / DNS | 10.10.1.66/28 | Gateway 10.10.1.65 |
| server2 / HTTP | 10.10.1.67/28 | intranet.corporate.test |
| server3 | 10.10.1.68/28 | Corporate server segment |
| server4 / external HTTP | 203.0.113.2/24 | www.isp.test; gateway 203.0.113.1 |
| WLC0 | 10.10.0.190/26 | Gateway 10.10.0.129; Corp-Admin; excluded from Admin DHCP |
| WLC1 | 192.168.13.2/24 | Gateway 192.168.13.1; ISP-Managed |
| Wireless Router0 | 10.10.0.230/27 | HR bridge management; gateway 10.10.0.225 |
| Wireless Router1 | 192.168.13.15/24 | ISP bridge management; gateway 192.168.13.1 |

West supplies Engineering/Admin/HR DHCP; east supplies Finance/IT; ISP supplies 192.168.13.0/24. Gateways and fixed management addresses must be excluded from their pools. Administration excludes .190 for WLC0. Client DNS is 10.10.1.66. Read current `ipconfig` before choosing a DHCP destination; recorded leases are not permanent device identities. Refer to the [dated audit](../packet-tracer/connectivity-audit-2026-11-07.md) for verification scope.

## Method and allocation totals

For ordinary LAN subnets: `prefix = 32 - ceil(log2(requiredHosts + reservedCapacity + 2))`. Allocate largest-first, align blocks, then check overlap and parent boundaries. Example: 100 hosts require 102 addresses, rounded up to a 128-address /25 with 126 nominal usable addresses.

| Metric | Value | Meaning |
|---|---:|---|
| Department address blocks | 272 | 128 + 64 + 32 + 32 + 16 |
| Department nominal usable capacity | 262 | Before gateway/infrastructure reservations |
| Requested department hosts | 207 | Requirement, not observed active-client count |
| Server block | 16 | One /28 |
| Corporate routed links | 20 | Five /30 blocks |
| **Allocated corporate addresses** | **308 / 512 (60.2%)** | Department + server + link blocks |
| **Unallocated corporate addresses** | **204 / 512 (39.8%)** | Space for future design; not configured DHCP reservations |

Exact unallocated CIDRs:

```text
10.10.1.32/27
10.10.1.80/28
10.10.1.96/28
10.10.1.116/30
10.10.1.120/29
10.10.1.128/25
```

These do not overlap the documented allocations. VLSM Studio changes do not update this lab or the local presentation model automatically.
