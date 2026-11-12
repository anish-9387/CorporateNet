# Present the Scalable Corporate Network

Use this as the speaking script and the [presentation outline](presentation-outline.md) for the sequence. Setup and commands are in the [run guide](run-and-simulate.md).

## Explain the design

“Sir, this project connects Engineering, Administration, Finance, HR and IT Support. VLSM fits their different address requirements into 10.10.0.0/23. DHCP supplies client settings, and OSPF area 0 shares corporate routes. Shared servers provide DNS and web services; Router0 connects to a simulated ISP and performs PAT.”

| Zone | What to point out |
|---|---|
| Department access | Switches and APs attach wired and wireless users. |
| West distribution | Multilayer Switch1 provides Engineering, Administration and HR gateways/DHCP. |
| East distribution | Multilayer Switch3 provides Finance and IT gateways/DHCP. |
| Core | Multilayer Switch2 joins distribution, the server network and Router0. |
| Server network | Multilayer Switch0 and three corporate servers use 10.10.1.64/28. |
| Edge and ISP | Router0 performs PAT; the ISP branch and server4 represent external networks. |

The floor grouping is explanatory, not a physical building survey. Laptop9 is an ISP-managed wireless client; it does not forward traffic for the company.

## Run the browser walkthrough

From the project root, run `pnpm install` and `pnpm dev`. Open the printed URL, choose **Packet simulation → Present → Simulate**.

1. Pause on VLSM: Engineering needs 100 hosts (/25), Administration 50 (/26), Finance 25 (/27), HR 20 (/27) and IT 12 (/28). These 207 hosts are sizing requirements, not simulated concurrent users.
2. Explain DHCP Discover, Offer, Request and ACK. Gateways are fixed; client leases can change.
3. Explain OSPF between the four multilayer switches and Router0. The ISP sits outside corporate OSPF.
4. Follow DNS to server1 at 10.10.1.66, then HTTP to server2 at 10.10.1.67.
5. Follow PC3 to external server4 at 203.0.113.2. Router0 translates eligible traffic to 198.51.100.1. ISP-client traffic to 192.168.13.0/24 remains routed without NAT.
6. Show one server link failing and the other carrying the illustrated route. Both links participate in native OSPF; the animation does not measure convergence or ECMP.

Click devices for their roles, open **IP addressing** to explore VLSM, and open **Architecture** for the actual topology screenshot. The browser is an explanation; native packet delivery is demonstrated in Packet Tracer.

## Show real simulated packet delivery

Open [the working .pkt](../network/packet-tracer/Scalable_Corporate_Network_CN.pkt). In Realtime, allow DHCP, STP and OSPF to settle. On PC3 choose **Desktop → Command Prompt**:

```text
ipconfig
ping 10.10.0.193
ping 10.10.1.66
ping 10.10.1.67
ping 203.0.113.2
```

These targets are the Finance gateway, DNS server, intranet server and external server. Retry initial loss after convergence; persistent loss needs investigation. For another client destination, read its current address first.

Immediately after the external ping, open **Router0 → CLI**:

```text
enable
show ip interface brief
show ip nat translations
show ip nat statistics
```

Run `show` at `edge#`; use `end` to leave configuration mode. Inside local is the client's original address; inside global is the PAT address 198.51.100.1. Dynamic entries expire. Documentation address ranges represent the public side; this is not real Internet access.

On the core, show `show ip ospf neighbor` and `show ip route`. On west/east, use `show ip dhcp binding`. In Simulation, filter ARP and ICMP, create a fresh Simple PDU between endpoints and step through Capture/Forward. For DHCP, enable its filter and renew a client lease.

## Explain results and limits

The [audit completed 8 November 2026](../network/packet-tracer/connectivity-audit-2026-11-07.md) recorded 231/231 unique pairs among 22 IP end devices passing after retries where needed. Each ping includes request and reply. Separately initiated reverse flows, every application, security controls and recovery timing were not exhaustively tested. A fresh test should read the current leases; the audit did not confirm that its in-memory state was saved.

Both WRT devices bridge clients through LAN Ethernet1 with local DHCP disabled. Wireless Router0 serves HR and Wireless Router1 serves the ISP LAN. This removes isolated WRT NAT boundaries but does not provide guest isolation.

## Close with scalability

“To add a department, allocate an available subnet, attach an access switch to distribution, configure its gateway and DHCP, then advertise its route. The /23 has 204 unallocated addresses in several blocks. Growth also requires checking ports, uplink bandwidth and wireless capacity. Dual server links protect that connection; the core, edge and distribution devices remain single failure points.”

## Viva answers

| Question | Answer |
|---|---|
| Why VLSM? | Different prefix lengths fit different department sizes and conserve addresses. |
| Why OSPF? | It learns routes dynamically and can find an alternate routed path. |
| What does DHCP provide? | An address, subnet mask, gateway and DNS server. |
| What is a gateway? | The Layer 3 interface used to reach another subnet. |
| Switch versus router? | A switch forwards local frames; routing connects IP subnets. Multilayer switches do both. |
| What does an AP do? | Bridges wireless clients onto the wired LAN. |
| What does a WLC do? | Manages lightweight APs and WLAN settings. |
| NAT versus PAT? | NAT translates addresses; PAT also distinguishes flows so clients can share one translated address. |
| Why an empty NAT table? | No matching active traffic, expired entries, or a configuration/path issue; generate traffic then inspect it. |
| Why an initial failed packet? | ARP or routing may still be settling; repeat, then investigate persistent failures. |
| Is everything redundant? | No. The server connection has two paths; several devices remain single failure points. |
