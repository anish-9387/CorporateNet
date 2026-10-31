# Addressing plan — completed 43-device lab

Updated: 1 November 2026. Corporate parent: **10.10.0.0/23** (10.10.0.0–10.10.1.255, 512 addresses). This describes [the completed lab](../packet-tracer/Scalable_Corporate_Network_CN.pkt) and `/simulation`. Older R1/R2/R3 text configurations describe a separate topology.

## Department and server allocation

| Segment | Required hosts | Network | Mask | Gateway | Usable range | Broadcast | Nominal usable |
|---|---:|---|---|---|---|---|---:|
| Engineering | 100 | 10.10.0.0/25 | 255.255.255.128 | 10.10.0.1 | 10.10.0.1–126 | 10.10.0.127 | 126 |
| Administration | 50 | 10.10.0.128/26 | 255.255.255.192 | 10.10.0.129 | 10.10.0.129–190 | 10.10.0.191 | 62 |
| Finance | 25 | 10.10.0.192/27 | 255.255.255.224 | 10.10.0.193 | 10.10.0.193–222 | 10.10.0.223 | 30 |
| HR uplink | 20 | 10.10.0.224/27 | 255.255.255.224 | 10.10.0.225 | 10.10.0.225–254 | 10.10.0.255 | 30 |
| IT Support | 12 | 10.10.1.0/28 | 255.255.255.240 | 10.10.1.1 | 10.10.1.1–14 | 10.10.1.15 | 14 |
| Servers | — | 10.10.1.64/28 | 255.255.255.240 | 10.10.1.65 | 10.10.1.65–78 | 10.10.1.79 | 14 |

Range endings abbreviate the last octet. Nominal usable addresses include gateways/infrastructure; this is not the available DHCP pool or active-client count. HR clients use a private NAT LAN behind the /27 corporate uplink.

## Routed corporate links

All use mask **255.255.255.252 (/30)**, two usable addresses.

| Link | Subnet | Endpoint A | Endpoint B | Broadcast |
|---|---|---|---|---|
| Core–west | 10.10.1.16/30 | core Fa0/1: 10.10.1.17 | dist-west Fa0/2: 10.10.1.18 | 10.10.1.19 |
| Core–east | 10.10.1.20/30 | core Fa0/5: 10.10.1.21 | dist-east Fa0/1: 10.10.1.22 | 10.10.1.23 |
| Core–servers A | 10.10.1.24/30 | core Fa0/2: 10.10.1.25 | servers Fa0/4: 10.10.1.26 | 10.10.1.27 |
| Core–servers B | 10.10.1.28/30 | core Fa0/3: 10.10.1.29 | servers Fa0/5: 10.10.1.30 | 10.10.1.31 |
| Core–edge | 10.10.1.112/30 | core Fa0/4: 10.10.1.113 | edge Fa0/0: 10.10.1.114 | 10.10.1.115 |

## ISP and private NAT networks

| Segment | Subnet | Endpoints / gateway |
|---|---|---|
| Edge–ISP serial | 192.168.11.0/30 | edge S0/3/0: 192.168.11.1; ISP S0/3/0: 192.168.11.2 |
| ISP client LAN | 192.168.13.0/24 | ISP Fa0/1: 192.168.13.1; WLC1: 192.168.13.2 |
| Simulated external server | 203.0.113.0/24 | ISP Fa0/0: 203.0.113.1; server4: 203.0.113.2 |
| HR private WLAN | 192.168.0.0/24 | Wireless Router0 LAN: 192.168.0.1; WAN observed 10.10.0.226/27 |
| ISP private WLAN | 192.168.0.0/24 | Wireless Router1 LAN: 192.168.0.1; WAN uses ISP DHCP |

The two private /24s are isolated behind separate NAT routers. These networks are outside the corporate /23 totals. The ISP is simulated, not real Internet access.

## Static services and management

| Device / service | Address | Notes |
|---|---|---|
| server1 / DNS | 10.10.1.66/28 | Gateway 10.10.1.65 |
| server2 / HTTP | 10.10.1.67/28 | intranet.corporate.test |
| server3 | 10.10.1.68/28 | Corporate server segment |
| server4 / external HTTP | 203.0.113.2/24 | www.isp.test; gateway 203.0.113.1 |
| WLC0 | 10.10.0.190/26 | Gateway 10.10.0.129; Corp-Admin; excluded from Admin DHCP |
| WLC1 | 192.168.13.2/24 | Gateway 192.168.13.1; ISP-Managed |

West supplies Engineering/Admin/HR-uplink DHCP; east supplies Finance/IT; ISP supplies 192.168.13.0/24. Gateways are excluded, Admin also excludes .190, and ISP excludes .1–.9. Client DNS is 10.10.1.66. Private WLAN clients use their respective NAT router's DHCP. See [observed leases](../packet-tracer/README.md); leases can change.

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
