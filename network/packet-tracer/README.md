# Scalable Corporate Network — Packet Tracer topology

Open `Scalable_Corporate_Network_CN-completed.pkt` for the completed project. A working copy is also retained. The original file in the study-material directory is preserved. This is the supplied 43-device topology; the older R1/R2/R3 text configurations elsewhere in this repository describe a different topology and must not be pasted into these devices.

## Addressing

| Segment | Subnet | Gateway | Attachment |
|---|---|---|---|
| Engineering | 10.10.0.0/25 | 10.10.0.1 | Multilayer Switch1 Fa0/3 → Switch1 |
| Administration | 10.10.0.128/26 | 10.10.0.129 | Multilayer Switch1 Fa0/1 → Switch0 |
| Finance | 10.10.0.192/27 | 10.10.0.193 | Multilayer Switch3 VLAN30 → Switch5 and Switch7 |
| HR uplink | 10.10.0.224/27 | 10.10.0.225 | Multilayer Switch1 Fa0/4 → Switch2 → Wireless Router0 Internet |
| IT Support | 10.10.1.0/28 | 10.10.1.1 | Multilayer Switch3 Fa0/3 → Switch6 |
| Servers | 10.10.1.64/28 | 10.10.1.65 | Multilayer Switch0 VLAN60 |
| Simulated ISP clients | 192.168.13.0/24 | 192.168.13.1 | ISP Fa0/1 → Switch3 |
| Simulated external server | 203.0.113.0/24 | 203.0.113.1 | ISP Fa0/0 → server4 |

Corporate routed links use /30 masks:

| Endpoints | Addresses |
|---|---|
| Core Fa0/1 ↔ west Fa0/2 | 10.10.1.17 ↔ 10.10.1.18 |
| Core Fa0/5 ↔ east Fa0/1 | 10.10.1.21 ↔ 10.10.1.22 |
| Core Fa0/2 ↔ servers Fa0/4 | 10.10.1.25 ↔ 10.10.1.26 |
| Core Fa0/3 ↔ servers Fa0/5 | 10.10.1.29 ↔ 10.10.1.30 |
| Core Fa0/4 ↔ Router0 Fa0/0 | 10.10.1.113 ↔ 10.10.1.114 |
| Router0 S0/3/0 ↔ ISP S0/3/0 | 192.168.11.1 ↔ 192.168.11.2 |

IOS hostnames: `core` (Multilayer Switch2), `dist-west` (Multilayer Switch1), `dist-east` (Multilayer Switch3), `servers` (Multilayer Switch0), `edge` (Router0), and `isp`. Corporate routing uses OSPF process 1, area 0. The edge advertises its static default route to the ISP. The ISP has a return route for 10.10.0.0/23 via 192.168.11.1.

Server1 is DNS at 10.10.1.66, server2 is the intranet at 10.10.1.67, server3 is 10.10.1.68, and server4 is 203.0.113.2. DNS records are `intranet.corporate.test` and `www.isp.test`. These are simulated services inside Packet Tracer, not real Internet access.

The existing WRT300N uses NAT with its own 192.168.0.0/24 wireless LAN. Its HR-facing uplink obtains a 10.10.0.224/27 address. Inbound connections to wireless hosts behind NAT require additional design; outbound access is the intended test.

## Run and demonstrate

1. Open the `.pkt` in Cisco Packet Tracer 9.0.1 or a compatible newer version. No Node.js or MongoDB is needed for this file.
2. Select **Realtime** and let links, spanning tree, DHCP and OSPF converge. Use the fast-forward-time button if needed.
3. Open **PC3 → Desktop → IP Configuration**. DHCP should supply 10.10.0.194/27 (or another Finance lease), gateway 10.10.0.193, DNS 10.10.1.66.
4. Open **Desktop → Web Browser** and visit `http://intranet.corporate.test`, then `http://www.isp.test`.
5. Open **Desktop → Command Prompt** and run `ipconfig`, `ping 10.10.1.66`, and `ping www.isp.test`. A first ping may lose a packet while ARP resolves; repeat after convergence.
6. To show packet movement, select **Simulation** at the bottom right. In **Edit Filters**, select ARP and ICMP. Use **Add Simple PDU** (closed envelope), click PC3 as the source and server2 as the destination, then **Capture/Forward** to step each hop or **Auto Capture/Play** to animate it. Click an event envelope to inspect OSI layers and PDU details.
7. To show DHCP, enable the DHCP filter, then on a client select Static followed by DHCP. Step through Discover, Offer, Request and ACK.
8. To show routing, open a corporate multilayer switch's **CLI**, enter `enable`, then `show ip ospf neighbor` and `show ip route`. Use space when output pauses at `--More--`.
9. Return to **Realtime** before routine configuration, and save with Ctrl+S.

## Observed checks

- East distribution → Engineering gateway: 5/5 ICMP replies.
- Edge → ISP serial address: 5/5 ICMP replies.
- East and west formed FULL OSPF adjacency with the core.
- PC3 obtained Finance DHCP address 10.10.0.194/27 with gateway and DNS.
- PC0 obtained Administration DHCP address 10.10.0.130/26 with gateway and DNS.
- PC3 loaded the intranet by DNS name.
- PC3 resolved www.isp.test to 203.0.113.2 and received ICMP replies.

## Continuation checks — 31 October 2026

- Corrected Laptop10 from the old static subnet to DHCP: 192.168.13.11/24, gateway 192.168.13.1, DNS 10.10.1.66.
- Corrected WLC1 management to 192.168.13.2/24, gateway 192.168.13.1, DNS 10.10.1.66. LWAP1 uses DHCP and primary controller 192.168.13.2.
- PC2 (IT wireless) has 10.10.1.4/28, gateway 10.10.1.1, DNS 10.10.1.66. PC2 → PC1 (Engineering) Simple PDU ICMP succeeded on retry.
- Laptop7 (Finance wireless) → PC0 (Administration) Simple PDU ICMP succeeded on retry. Initial packets failed before address resolution completed.
- Laptop4 (HR wireless) has 192.168.0.100/24, gateway 192.168.0.1, DNS 10.10.1.66. Its router WAN is 10.10.0.226/27, gateway 10.10.0.225. The intranet loaded by DNS name from Laptop4. Two initial Simple PDU ICMP checks to PC3 failed; after replaying the scenarios in Simulation and returning to Realtime, both HR → PC3 rows reported Successful.
- Laptop8 (ISP wireless) has 192.168.0.100/24 behind its separate NAT router, gateway 192.168.0.1, DNS 10.10.1.66. It loaded http://www.isp.test after retry. The two NAT LANs are separate broadcast domains.
- Opened Simulation mode and started Auto Capture/Play with the recorded test PDUs. These are demonstrations, not an exhaustive all-pairs test.
- Laptop10 → server2 Simple PDU ICMP reported Successful, checking the ISP client's route into the corporate server subnet and the return path.

For an easy wireless demonstration, use **PC2 → PC1** or **Laptop7 → PC0** with Add Simple PDU. The existing test list contains the warm-up and retry scenarios; replay updates their Last Status. Use Realtime first to allow convergence; the first packet after reopening can fail while ARP resolves. HR can demonstrate both the intranet in Laptop4's browser and outbound ICMP to PC3 after convergence.

## Completed managed wireless — 1 November 2026

Both controller wizards were applied. WLC1 restarted after saving; client association and traffic were checked afterward. WLC0's dashboard was also reached over HTTPS from Laptop10.

| Controller | System name | Management | SSID | Clients | External DHCP |
|---|---|---|---|---|---|
| WLC0 | corp-admin-wlc | 10.10.0.190/26 | Corp-Admin | Laptop0, Laptop1, Laptop2 | 10.10.0.129 |
| WLC1 | isp-managed-wlc | 192.168.13.2/24 | ISP-Managed | Laptop9 | 192.168.13.1 |

Both WLANs use WPA2 Personal with the supplied lab Wi-Fi passphrase and the untagged Management VLAN (ID 0). LWAP0 points to 10.10.0.190; LWAP1 points to 192.168.13.2. The controller administrator username is `anish-9387`; administrator login and Wi-Fi association are separate operations. Keep passwords in your lab notes rather than this guide.

- Laptop0, Laptop1 and Laptop2 joined Corp-Admin. A Simple PDU ICMP check from each laptop to Finance PC3 reported Successful.
- Laptop0's DHCP lease was 10.10.0.135/26, gateway 10.10.0.129, DNS 10.10.1.66.
- Laptop9 joined ISP-Managed. Its DHCP lease was 192.168.13.13/24, gateway 192.168.13.1, DNS 10.10.1.66. Laptop9 → PC3 Simple PDU ICMP reported Successful.
- Laptop9 loaded `http://intranet.corporate.test`, verifying wireless access, ISP-to-corporate routing, DNS and HTTP together.
- Existing AP0/Corp-IT and AP1/Corp-Finance associations remain operational in the tested paths. Their existing security modes were preserved.

Packet Tracer does not implement the WLC Clients monitor page used during testing. Client association, DHCP values and successful traffic were checked directly instead.

## Redundant server-link test

Core Fa0/2 (10.10.1.25/30) was administratively disabled. PC3 → server2 Simple PDU ICMP reported Successful while the second server link remained available. Core Fa0/2 was then restored to On, its line protocol returned up, and its OSPF neighbor 4.4.4.4 returned to FULL. This checks one failure after convergence, not zero packet loss or every failure scenario.

## Test scope

Representative wired, wireless, NAT, interdepartmental and ISP-to-corporate paths were checked, together with DHCP, DNS/HTTP and one redundant-link failure. Exhaustive all-client/all-pairs, load and security testing were not performed. Initial ARP/DHCP/OSPF convergence can cause the first packet to fail; allow convergence and retry.

No Cisco-specific MCP connection was available in this session; the project was configured using Packet Tracer's native UI. All ISP and web services in this file are simulated.
