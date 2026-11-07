# CorporateNet — faculty presentation outline

Updated: 4 November 2026. **The wireless bridge wiring persisted after reopening; verification is ongoing.** Laptop1 → Laptop4 returned 4/4 replies on repeat ping. Laptop8 → PC3 and Laptop8 → Laptop4 also returned 4/4. Earlier checks are historical observations, not proof that every current path works. Use the latest [lab notes](../network/packet-tracer/README.md) for verified traffic and final save status before presenting.

## Slide 1 — Title · 0:00–0:15

**Scalable Corporate Network: VLSM, Subnetting, OSPF and DHCP**

- CorporateNet · Computer Networks project.
- Name / register number / team / course / date.
- Visual: [the topology preview](presentation-preview.png).

Say: “This project connects five departments, corporate servers and wireless clients through a routed backbone and a simulated ISP.”

## Slide 2 — Objective · 0:15–0:35

- Allocate suitable subnet sizes using VLSM.
- Configure clients automatically using DHCP.
- Exchange corporate routes using OSPF area 0.
- Check representative connectivity and one redundant-link failure.
- Explain the topology through one browser button.

Say: “Packet Tracer contains the configurations and protocol simulation. The website explains the same network visually.” Do not call the website a live network monitor.

## Slide 3 — The actual topology · 0:35–1:00

| Device group | Count | Role |
|---|---:|---|
| Multilayer switches | 4 | Core, west, east, servers |
| Routers | 2 | Corporate edge and ISP |
| Access switches | 7 | Departmental and ISP access |
| Servers | 4 | DNS, intranet, extra corporate server, external server |
| Wireless controllers | 2 | Corp-Admin and ISP-Managed |
| Lightweight / standalone APs | 4 | Two of each |
| Wireless routers | 2 | LAN-connected wireless bridges; broader verification ongoing |
| PCs / laptops | 18 | Seven PCs and eleven laptops |
| **Total** | **43** | **43 wired/wireless links in the presentation model** |

Explain six zones instead of introducing 43 devices individually. This is a **proposed floor grouping**, preserving the existing addresses and names; it does not claim a completed canvas rearrangement or a surveyed building.

| Zone | Existing devices | Purpose |
|---|---|---|
| Core | Multilayer Switch2 (`core`) | Connect floors, servers and edge |
| Floor 1 | Multilayer Switch1 (`dist-west`); Switch0, Switch1, Switch2 | Admin, Engineering, HR |
| Floor 2 | Multilayer Switch3 (`dist-east`); Switch5, Switch6, Switch7 | Finance and IT |
| Server room | Multilayer Switch0 (`servers`); server1–server3 | Shared services |
| Corporate edge | Router0 (`edge`) | Default route and external NAT/PAT |
| Simulated ISP | ISP router, server4, Switch3 and its client/wireless branch | External test network |

Say: “Clients connect through access switches or APs. Distribution switches provide department gateways. The core joins the networks, and the edge provides the ISP path.” Access switches already perform bridging; extra standalone bridges are unnecessary. WLCs manage lightweight APs. Keep the ISP outside the corporate boundary visually.

## Slide 4 — VLSM and subnetting · 1:00–1:25

Parent: **10.10.0.0/23**, 512 addresses. Allocate largest-first.

| Department | Required hosts | Subnet | Nominal usable | Gateway |
|---|---:|---|---:|---|
| Engineering | 100 | 10.10.0.0/25 | 126 | 10.10.0.1 |
| Administration | 50 | 10.10.0.128/26 | 62 | 10.10.0.129 |
| Finance | 25 | 10.10.0.192/27 | 30 | 10.10.0.193 |
| HR | 20 | 10.10.0.224/27 | 30 | 10.10.0.225 |
| IT Support | 12 | 10.10.1.0/28 | 14 | 10.10.1.1 |

Example: 100 hosts + network/broadcast require at least 102 addresses; /25 allocates 128, of which 126 are usable. Gateways/infrastructure consume usable capacity. The intended bridge conversion puts HR wireless clients directly on the HR /27.

Including the server /28 and five corporate /30 links, **308/512 addresses are allocated (60.2%)**, and **204 are unallocated (39.8%)**. This is address-block allocation, not active-client utilization. See [the full address plan](../network/addressing/vlsm-plan.md).

## Slide 5 — DHCP · 1:25–1:45

- DORA: Discover → Offer → Request → ACK.
- West supplies Engineering, Admin and HR DHCP; east supplies Finance and IT.
- ISP supplies its client LAN. The bridge conversion disables both WRT DHCP servers so clients use the upstream DHCP service.
- Observed Laptop0 lease: **10.10.0.135/26**, gateway **10.10.0.129**, DNS **10.10.1.66**.
- Gateways are excluded; Admin also excludes WLC0's **10.10.0.190**.

Say: “DHCP supplies address, mask, gateway and DNS. A lease may change after renewal or reopening.”

## Slide 6 — OSPF · 1:45–2:05

**Process 1, area 0**, on five corporate Layer 3 devices:

| IOS hostname | Canvas device | Router ID |
|---|---|---|
| dist-west | Multilayer Switch1 | 1.1.1.1 |
| core | Multilayer Switch2 | 2.2.2.2 |
| dist-east | Multilayer Switch3 | 3.3.3.3 |
| servers | Multilayer Switch0 | 4.4.4.4 |
| edge | Router0 | 5.5.5.5 |

The core has adjacencies to west, east, edge and two links to servers. The edge advertises its static default route toward the ISP. The ISP routing table confirms static corporate return route **10.10.0.0/23 via 198.51.100.1**; the ISP is not a corporate OSPF participant. ISP → Admin gateway 10.10.0.129 returned 5/5 replies.

Verification: `show ip ospf neighbor`, `show ip route`. Do not describe the edge–ISP serial link as a corporate OSPF adjacency.

## Slide 7 — DNS and HTTP · 2:05–2:25

- server1 DNS: **10.10.1.66**.
- `intranet.corporate.test` → server2 **10.10.1.67**.
- `www.isp.test` → server4 **203.0.113.2**.
- DNS resolves a name; the browser then contacts the web server at its IP address.

These websites are inside Packet Tracer. The browser presentation illustrates paths; it does not contact those lab IPs from the host computer and omits TCP handshakes.

## Slide 8 — Wireless and ISP · 2:25–2:45

| Controller | Management | WLAN | Clients |
|---|---|---|---|
| WLC0 | 10.10.0.190/26 | Corp-Admin | Laptop0, Laptop1, Laptop2 |
| WLC1 | 192.168.13.2/24 | ISP-Managed | Laptop9 |

Both managed WLANs use WPA2 Personal. Previous sessions recorded ICMP from these laptops to PC3 and intranet access from Laptop9; retest before claiming current success. AP0 serves Corp-IT; AP1 serves Corp-Finance. The WRT conversion uses LAN Ethernet 1 and disables their DHCP servers, removing the separate private client NAT boundaries. It does not create guest isolation. Do not display lab passwords.

Distinguish the jobs: **bridging** forwards frames within a LAN; **routing** connects IP subnets; **NAT/PAT** translates selected traffic at Router0. The WAN uses edge `198.51.100.1` and ISP `198.51.100.2` on `/30`; configured PAT represents corporate clients as `198.51.100.1` toward `203.0.113.2`, while routed ISP-client traffic is exempted. These TEST-NET addresses model the public side and are not real Internet allocations. On 7 November, reopening confirmed the WAN address persisted; Laptop1 reached 203.0.113.2 with 4/4 replies on repeat, and Router0 showed eight ICMP translations from 10.10.0.136 to 198.51.100.1. The main project was saved. The 2 November translation to `192.168.11.1` is historical evidence from the prior WAN addressing.

## Slide 9 — Resilience · 2:45–3:10

- Core **Fa0/2 ↔ servers Fa0/4**: **10.10.1.24/30**.
- Alternate **core Fa0/3 ↔ servers Fa0/5**: **10.10.1.28/30**.
- Observed: disable core Fa0/2, converge, then PC3 → server2 ICMP succeeds.
- Restore Fa0/2; line protocol comes up and neighbor **4.4.4.4** returns FULL.

“Primary” and “backup” are browser example labels, not an active/standby OSPF guarantee. Actual forwarding can use equal-cost paths. The check covers one failure after convergence, not zero loss, measured convergence time or full-network redundancy.

## Slide 10 — One-click walkthrough · 3:10–4:10

Switch to `/simulation`, click **Present → Simulate**, and let the approximately one-minute sequence run:

1. VLSM allocation.
2. DHCP client request path.
3. DHCP response/configuration.
4. OSPF backbone overview.
5. DNS query.
6. DNS reply.
7. Intranet HTTP request path.
8. Finance-to-ISP ICMP path.
9. Failed server link and alternate path.
10. Restored link and return path.

Use **Pause / Resume** for questions, **Replay simulation** to restart and **Reset** to clear progress. Click a device for ports/addresses; zoom as needed. Escape exits presentation mode.

Say: “The diagram is manually maintained and can lag changes to the lab. Dots show illustrative graph paths; the website does not run Cisco IOS or control Packet Tracer.” Allow extra time if pausing. Prioritize the actual Packet Tracer evidence if time is short.

## Slide 11 — Actual Packet Tracer evidence · 4:10–4:45

Switch to the already-open `.pkt`:

1. Show PC3's current DHCP configuration and intranet page.
2. Select **Simulation → Edit Filters → ARP + ICMP**.
3. Use **Add Simple PDU** from Laptop0 to PC3, then **Auto Capture/Play** or **Capture/Forward**. Allow convergence and retry if the initial ARP lookup causes failure.

For a longer demo, show core OSPF CLI and repeat failover using [the detailed script](present-to-sir.md). Keep the saved lab available to discard demonstration changes.

For a simple complete-path test, use **PC3 → Desktop → Command Prompt**: `ipconfig`, `ping 10.10.0.193`, `ping 10.10.1.66`, `ping 10.10.1.67`, then `ping 203.0.113.2`. Explain local gateway → DNS → intranet → external server.

Immediately afterward use **Router0 → CLI**, press Enter, then `enable`, `show ip nat translations`, and `show ip nat statistics`. Dynamic entries expire. On **Multilayer Switch2 → CLI**, use `enable`, `show ip ospf neighbor`, and `show ip route`.

The last observed leases were Laptop4 `10.10.0.227/27`, Laptop5 `10.10.0.228/27`, and Laptop8 `192.168.13.11/24`. Laptop8's earlier .15 lease was stale after reopening. Laptop1 → Laptop4 returned 4/4 on repeat ping; Laptop8 → PC3 and Laptop8 → Laptop4 returned 4/4. Read current `ipconfig` and create fresh PDUs because old tests can retain obsolete addresses. A first ARP timeout can occur; repeated failures need diagnosis.

Show representative observations. Do not claim an all-green all-pairs matrix, successful traceroute or captured CLI screenshots unless you collect and show them. [The lab guide](../network/packet-tracer/README.md) records the observed checks.

## Slide 12 — Results and limits · 4:45–5:00

- A 43-device lab demonstrating VLSM, OSPF, DHCP and managed wireless; wireless corrections remain under verification.
- Historical representative paths and one server-link failure were checked; show fresh evidence for current claims.
- One-click explanation page works without API/MongoDB.
- Exhaustive all-pairs, load, security and physical-hardware testing were not performed.

Close: “The project demonstrates efficient addressing, dynamic routing, automatic client configuration and an alternate server path. Packet Tracer provides protocol simulation; the website makes it easy to explain.”

Explain scalability precisely: add access switches/APs within subnet and uplink limits, or allocate a new subnet, gateway, DHCP pool and OSPF uplink for another department/floor. The 204 free addresses are fragmented; existing subnets cannot all grow in place. Core, edge and floor distribution remain single failure points. Two server links protect a link path, not the devices themselves. The required 207 hosts are sizing inputs, not tested concurrent capacity. Larger deployments need adequate ports/bandwidth, standardized wireless equipment, redundancy and an explicit access policy.

## Q&A preparation

| Question | Answer |
|---|---|
| Why VLSM? | Different host requirements receive the smallest suitable address blocks. |
| Why /30 links? | A conventional /30 provides two usable IPv4 addresses for two endpoints. |
| Does OSPF prevent every outage? | No. An alternate route requires an alternate physical/logical path. |
| How fast does it converge? | It was not measured; browser timings are illustrative. |
| Is there a live Packet Tracer MCP connection? | The local MCP server/skill/extension are installed. After Codex and Packet Tracer restart, open Extensions → MCP BUILDER; the browser model remains separate. |
| Do other dashboard pages show this topology? | Yes. All routes use the same local 43-device model from `labData.ts`; there is no database-backed second design. |
| Can we add another department? | Recalculate/check address space, configure the network, and update documentation and the presentation model. Calculator changes do not reconfigure the .pkt. |
| Why can a switch forward packets but fail a ping to itself? | A Layer 2 switch needs a reachable management IP and return gateway to answer ping; forwarding client frames is a separate function. |
| AP versus wireless router? | An AP bridges clients into a LAN. A wireless router can create a separate routed/NAT LAN; our WRT conversion uses its LAN side for bridging. |
| Does NAT provide guest isolation? | NAT translates addresses. Guest isolation requires an explicit network and access policy. |
