# Presentation: Scalable Corporate Network

## 1. Introduce the problem

“Our company has Engineering, Administration, Finance, HR and IT Support. They need wired and wireless access, shared services and a connection to an ISP. The design separates departments into subnets and connects them through a common core.”

Show the website introduction. Explain the four layers: user → access switch/AP → distribution/core → destination.

## 2. Explain addressing

Open **IP addressing**. The company uses `10.10.0.0/23`.

| Department | Hosts needed | Subnet | Gateway |
|---|---:|---|---|
| Engineering | 100 | 10.10.0.0/25 | 10.10.0.1 |
| Administration | 50 | 10.10.0.128/26 | 10.10.0.129 |
| Finance | 25 | 10.10.0.192/27 | 10.10.0.193 |
| HR | 20 | 10.10.0.224/27 | 10.10.0.225 |
| IT Support | 12 | 10.10.1.0/28 | 10.10.1.1 |

“VLSM gives larger departments larger subnets. Allocating the largest requirement first avoids overlap and saves addresses.” Shared servers use `10.10.1.64/28`; routed transit links use /30 subnets.

## 3. Show the packet journey

Open **Packet simulation → Present → Simulate**. Pause at each concept:

1. DHCP provides an IP address, subnet mask, gateway and DNS server.
2. A switch forwards within a LAN; the default gateway handles traffic to another subnet.
3. OSPF shares routes between the core, distribution switches, server switch and edge router.
4. DNS resolves a name; HTTP requests the server's page.
5. NAT/PAT at Router0 translates matching traffic toward the simulated ISP.
6. The additional server uplink illustrates an alternative path when one link fails.

The website animates an explanation. Demonstrate actual packet delivery in Packet Tracer.

## 4. Explain device choices

Open **Devices & roles** and select a device.

| Device | Why it is needed |
|---|---|
| Access switch | Connects wired users within a department. |
| Multilayer switch | Connects LANs and routes between subnets. |
| Access point | Bridges wireless clients onto a wired LAN. |
| WLC | Manages lightweight access points and WLAN settings. |
| WRT bridge | Provides wireless access using a LAN uplink, with DHCP disabled. |
| Server | Provides shared DNS, web or application services. |
| Edge router | Connects the company to the ISP and performs NAT/PAT. |
| ISP router | Represents the external network inside the lab. |

## 5. Demonstrate the native lab

Open `network/packet-tracer/Scalable_Corporate_Network_CN.pkt`.

1. In Realtime, wait for DHCP and routing to settle. Check a client's address with `ipconfig`.
2. Ping another department's client or a shared server. Retry an initial ARP timeout.
3. In Simulation, filter ARP and ICMP, add a Simple PDU and use Capture/Forward to explain each hop.
4. On a routing device, show `show ip ospf neighbor` and `show ip route`.
5. On Router0, use `show ip nat translations` immediately after generating matching external traffic.

The [audit completed 8 November 2026](../network/packet-tracer/connectivity-audit-2026-11-07.md) recorded all 231 unique pairs among 22 IP end devices passing after retries where needed. This verifies request/reply connectivity for each pair; it does not cover every application or separately initiated reverse flow.

## 6. Close with scalability

“A new department can have its own access switch and subnet connected to distribution. OSPF advertises its route, while the core continues to connect shared services. Growth still requires checking subnet capacity, switch ports and uplink bandwidth.”
