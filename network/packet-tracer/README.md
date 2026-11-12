# Scalable Corporate Network — Packet Tracer lab

Open [Scalable_Corporate_Network_CN.pkt](Scalable_Corporate_Network_CN.pkt) in Cisco Packet Tracer 9.0.1 or a compatible newer version. This is the project's only working network file.

The recorded inventory contains **43 network devices and three power objects (46 objects total)**. The browser displays 43 devices and 43 diagram links. The native audit reported 49 link entries; these are different inventories, not interchangeable counts. There are **22 IP end devices**: four servers and eighteen PCs/laptops.

## Recorded verification

The [audit completed on 8 November 2026](connectivity-audit-2026-11-07.md) recorded **231/231 unique end-device pairs passing**, with retries after initial loss where needed. Each ping checked an echo request and reply. Separately initiated reverse flows and every application were not exhaustively tested. Final recorded health was zero down links, five OSPF devices, ten FULL neighbour entries (five adjacencies), and no missing shared OSPF routes.

These are dated results, not a fresh test on every reopen. The audit did not save its in-memory state. Read current DHCP leases and allow routing to settle before demonstrating the saved file.

## Network design

| Layer | Devices and role |
|---|---|
| Access | Seven 2960 switches, access points and wireless bridges connect clients. |
| Distribution | Multilayer Switch1 (`dist-west`) serves Engineering, Administration and HR; Multilayer Switch3 (`dist-east`) serves Finance and IT. |
| Core | Multilayer Switch2 (`core`) joins distribution, shared servers and Router0. |
| Servers | Multilayer Switch0 (`servers`), VLAN 60, connects three corporate servers. |
| Edge and ISP | Router0 (`edge`) performs PAT; `isp` represents the external network. |

Corporate routing uses OSPF process 1, area 0. Router IDs are west `1.1.1.1`, core `2.2.2.2`, east `3.3.3.3`, servers `4.4.4.4` and edge `5.5.5.5`. The ISP uses static routing. Two routed core–server links provide alternate paths; core, distribution and edge devices remain single failure points.

## Addressing

See the [complete address plan](../addressing/vlsm-plan.md) for masks, ports and remaining blocks.

| Segment | Subnet | Gateway |
|---|---|---|
| Engineering | 10.10.0.0/25 | 10.10.0.1 |
| Administration | 10.10.0.128/26 | 10.10.0.129 |
| Finance | 10.10.0.192/27 | 10.10.0.193 |
| HR | 10.10.0.224/27 | 10.10.0.225 |
| IT Support | 10.10.1.0/28 | 10.10.1.1 |
| Servers | 10.10.1.64/28 | 10.10.1.65 |
| ISP clients | 192.168.13.0/24 | 192.168.13.1 |
| External server | 203.0.113.0/24 | 203.0.113.1 |

The corporate /23 allocates 308 of 512 addresses (60.2%), leaving 204 (39.8%) unallocated. Server1 is DNS `10.10.1.66`, server2 is intranet HTTP `10.10.1.67`, server3 is `10.10.1.68`, and server4 is simulated external HTTP `203.0.113.2`. The DNS names are `intranet.corporate.test` and `www.isp.test`.

## Wireless

| Equipment | Purpose | Address or upstream subnet |
|---|---|---|
| WLC0 + LWAP0 | Corp-Admin; Laptop0–Laptop2 | WLC0: 10.10.0.190/26 |
| WLC1 + LWAP1 | ISP-Managed; Laptop9 | WLC1: 192.168.13.2/24 |
| Access Point0 | IT wireless clients | 10.10.1.0/28 |
| Access Point1 | Finance wireless clients | 10.10.0.192/27 |
| Wireless Router0 | HR LAN bridge; local DHCP disabled | Management: 10.10.0.230/27 |
| Wireless Router1 | ISP LAN bridge; local DHCP disabled | Management: 192.168.13.15/24 |

Both WRT uplinks use **Ethernet1**, not Internet ports. West supplies Engineering/Admin/HR DHCP, east supplies Finance/IT, and the ISP supplies its client LAN. Laptop9 is an ordinary ISP-managed wireless client, not a transit device. No separate guest-isolation policy is established.

## NAT/PAT demonstration

Router0 uses FastEthernet0/0 as inside and Serial0/3/0 as outside. WAN addresses are edge `198.51.100.1/30` and ISP `198.51.100.2/30`. ACL 101 exempts corporate traffic to `192.168.13.0/24` and selects traffic to `203.0.113.0/24` for PAT. The ISP's corporate return route points to `198.51.100.1`. These public-side addresses are documentation ranges for simulation.

1. On PC3, choose **Desktop → Command Prompt**. Run `ipconfig`, then `ping 203.0.113.2`.
2. Immediately open **Router0 → CLI**, press Enter and type `enable`.
3. At `edge#`, enter `show ip nat translations` and `show ip nat statistics`. If at `edge(config)#`, type `end` first.

Dynamic entries expire; an empty table without active matching traffic does not by itself show a fault. The 7 November observation recorded eight ICMP PAT entries; the final 8 November readback was empty. See the audit for scope.

## Present the project

Use Realtime until DHCP and routing settle. Read client addresses with `ipconfig`; generate fresh PDUs after address changes. In Simulation, filter ARP and ICMP, use Add Simple PDU between end devices, then Capture/Forward. A Layer 2 AP without a management IP cannot originate ICMP; test its forwarding through a client.

Follow the [run guide](../../docs/run-and-simulate.md) and [presentation outline](../../docs/presentation-outline.md). The frontend illustrates the topology and does not control Packet Tracer. [representative-checks.csv](representative-checks.csv) retains 13 historical PASS observations from the earlier partial matrix; it is not the exhaustive end-device audit.
