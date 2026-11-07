# Scalable Corporate Network — Packet Tracer topology

## Follow-up PDU check — 7 November 2026

The user reported failed Server1 → PC3 and Laptop7 → PC0 rows. Live inspection found Server1 at 10.10.1.66/28 with gateway 10.10.1.65 and PC3 currently on DHCP at 10.10.0.196/27 with gateway 10.10.0.193. Fresh Simple PDUs for both exact device pairs displayed Successful (new rows 2 and 3); repeated sends of those rows also displayed Successful. No addressing or routing change was needed for these two checks. The original failed rows remain historical evidence, not a current retest. The main project was saved with the fresh tests. This does not establish why the original individual packets failed; initial ARP resolution or an earlier address/state remains possible.

## Latest verification — 4 November 2026

Reopening the main `.pkt` confirmed both WRT LAN-bridge conversions persisted, with their DHCP servers disabled. Switch2 Fa0/2 connects to Wireless Router0 Ethernet1; Switch3 Fa0/4 connects to Wireless Router1 Ethernet1. Their Internet ports are no longer uplinks. HR clients now use 10.10.0.224/27 directly; the ISP wireless client uses 192.168.13.0/24.

Laptop1 → Laptop4 at 10.10.0.227 returned **4/4 replies on repeat ping**. The current Laptop8 `ipconfig` showed **192.168.13.11/24**; its previously observed .15 lease was stale after reopening. Laptop8 → PC3 (10.10.0.194) and Laptop8 → Laptop4 (10.10.0.227) each returned **4/4 replies**. Laptop5 was last observed at 10.10.0.228/27. DHCP leases can change; read `ipconfig` before choosing a destination. These are specific checks, not an all-client/all-pairs result.

Router0 accepted extended ACL101 and its overload rule, and `write memory` returned `[OK]`. The rule exempts corporate traffic to routed ISP clients (192.168.13.0/24) and selects corporate traffic to the simulated external server network (203.0.113.0/24) for NAT. The WAN uses 198.51.100.0/30: edge .1, ISP .2, edge default via .2 and ISP corporate return via .1. The ISP routing table showed the corporate return route via 198.51.100.1 and connected WAN/external-server networks; ISP → Admin gateway 10.10.0.129 returned **5/5 replies**. **Verified again on 7 November 2026 after reopening:** Router0 serial 198.51.100.1 was up/up and its core OSPF neighbor reached FULL. Laptop1 pinged 203.0.113.2 with 4/4 replies on repeat. The NAT table displayed eight ICMP entries translating inside-local 10.10.0.136 to inside-global 198.51.100.1, destination 203.0.113.2. The main project was saved after this check. These TEST-NET documentation addresses represent the public side in the lab; they are not real Internet allocations. Additional client and management paths remain outside the verified scope. Read dated observations below as history rather than a blanket current success claim.

## Edge PAT verification — 2 November 2026

The architecture upgrade and exhaustive connectivity checks are still incomplete. Earlier results below are historical observations, not proof that every current client works.

Edge PAT is now configured and saved: FastEthernet0/0 is NAT inside, Serial0/3/0 is NAT outside, and access-list 1 matches 10.10.0.0/23. Overload uses the existing serial address 192.168.11.1. This is a private lab WAN address, not a public Internet allocation.

Fresh checks: both connected edge interfaces were up/up. The current Finance client address observed during the audit was 10.10.0.196. Corporate-to-external traffic uses Router0 PAT address 198.51.100.1 toward 203.0.113.2. Dynamic translations expire, so generate traffic immediately before reading the table.

To reproduce: PC3 → Desktop → Command Prompt → `ping 203.0.113.2`; then Router0 → CLI → `enable` → `show ip nat translations`. Dynamic entries expire, so generate traffic before inspecting the table.

The pre-change backup is `Scalable_Corporate_Network_CN.before-nat.pkt`. It predates the wireless bridge correction. Separate guest WLAN isolation, public-address NAT and all-client checks were not established by this test.

Open [Scalable_Corporate_Network_CN.pkt](Scalable_Corporate_Network_CN.pkt) for the 43-device project. The older R1/R2/R3 text configurations elsewhere in this repository describe a different topology and must not be pasted into these devices.

For the one-click browser walkthrough, run `npm run dev` from the repository root and open **http://localhost:5173/simulation → Present → Simulate**. It uses a manually transcribed 43-device/43-link model and does not control this `.pkt`. See [the presentation outline](../../docs/presentation-outline.md), [speaking script](../../docs/present-to-sir.md) and [full address plan](../addressing/vlsm-plan.md).

## Addressing

| Segment | Subnet | Gateway | Attachment |
|---|---|---|---|
| Engineering | 10.10.0.0/25 | 10.10.0.1 | Multilayer Switch1 Fa0/3 → Switch1 |
| Administration | 10.10.0.128/26 | 10.10.0.129 | Multilayer Switch1 Fa0/1 → Switch0 |
| Finance | 10.10.0.192/27 | 10.10.0.193 | Multilayer Switch3 VLAN30 → Switch5 and Switch7 |
| HR | 10.10.0.224/27 | 10.10.0.225 | Multilayer Switch1 Fa0/4 → Switch2 → Wireless Router0 Ethernet1 |
| IT Support | 10.10.1.0/28 | 10.10.1.1 | Multilayer Switch3 Fa0/3 → Switch6 |
| Servers | 10.10.1.64/28 | 10.10.1.65 | Multilayer Switch0 VLAN60 |
| Simulated ISP clients | 192.168.13.0/24 | 192.168.13.1 | ISP Fa0/1 → Switch3 |
| Simulated external server | 203.0.113.0/24 | 203.0.113.1 | ISP Fa0/0 → server4 |

Corporate routed links use /30 masks:

The five corporate routed /30s, department blocks and server /28 allocate **308 of 512 corporate addresses (60.2%)**; **204 remain unallocated (39.8%)**. ISP segments are outside this total; HR wireless clients are included in HR. This is allocated address space, not an active-client count.

| Endpoints | Addresses |
|---|---|
| Core Fa0/1 ↔ west Fa0/2 | 10.10.1.17 ↔ 10.10.1.18 |
| Core Fa0/5 ↔ east Fa0/1 | 10.10.1.21 ↔ 10.10.1.22 |
| Core Fa0/2 ↔ servers Fa0/4 | 10.10.1.25 ↔ 10.10.1.26 |
| Core Fa0/3 ↔ servers Fa0/5 | 10.10.1.29 ↔ 10.10.1.30 |
| Core Fa0/4 ↔ Router0 Fa0/0 | 10.10.1.113 ↔ 10.10.1.114 |
| Router0 S0/3/0 ↔ ISP S0/3/0 | 198.51.100.1 ↔ 198.51.100.2 |

IOS hostnames: `core` (Multilayer Switch2), `dist-west` (Multilayer Switch1), `dist-east` (Multilayer Switch3), `servers` (Multilayer Switch0), `edge` (Router0), and `isp`. Corporate routing uses OSPF process 1, area 0. The edge advertises its static default route to the ISP. The updated WAN design uses ISP return route 10.10.0.0/23 via 198.51.100.1; see the dated verification evidence above before presenting.

Server1 is DNS at 10.10.1.66, server2 is the intranet at 10.10.1.67, server3 is 10.10.1.68, and server4 is 203.0.113.2. DNS records are `intranet.corporate.test` and `www.isp.test`. These are simulated services inside Packet Tracer, not real Internet access.

Both WRT300N devices now act as LAN-connected wireless bridges, with local DHCP disabled. This removes their former private NAT client boundaries. It does not create guest isolation. Edge PAT remains on Router0; test both traffic directions and inspect NAT selection/return routing when a routed ISP-client test fails. A Layer 2 switch needs management addressing and a return gateway to answer ping itself even when it forwards client frames correctly.

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

Historical configuration: the WRT devices still used private NAT client LANs during these tests. Their 192.168.0.x leases and Internet-port uplinks were superseded by the LAN-bridge correction above.

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

The browser labels these example links “primary” and “backup”; those labels do not guarantee active/standby routing in the actual lab. Both routed links participate in OSPF and may provide equal-cost paths. Convergence time and load-balancing behavior were not measured.

## Test scope

Representative wired, wireless, NAT, interdepartmental and ISP paths were checked, together with DHCP, DNS/HTTP, switch management reachability, and one redundant-link failure. The directed 43-device matrix contains 1,806 possible non-self pairs and remains the evidence ledger; do not claim untested rows as passes. Initial ARP/DHCP/OSPF convergence can cause a first packet to fail, so warm the path, retry, and record both outcomes.

The Packet Tracer MCP server, Codex skill, and MCP-Control-Center extension are installed. Codex and Packet Tracer must be restarted and **Extensions → MCP BUILDER** opened before the MCP can continue native automation. All ISP and web services in this file are simulated.

These are recorded session observations. A complete raw CLI/screenshot evidence bundle is not included. The latest section records the current session's specific checks; earlier sections retain their original dates and scope. Collect any evidence required by your faculty using the commands in the run guide.
