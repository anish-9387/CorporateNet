# Present the Scalable Corporate Network

Updated: 4 November 2026. **Wireless bridge wiring persisted after reopening; verification is ongoing.** Laptop1 → Laptop4 returned 4/4 replies on repeat ping; Laptop8 → PC3 and Laptop8 → Laptop4 also returned 4/4. Check [the latest lab notes](../network/packet-tracer/README.md) for verified traffic and final save status before presenting. These observations do not establish that every current connection works.

## Explain the network in six zones

This is a proposed physical floor grouping that keeps the existing names and addresses. It is not a claim that the canvas has already been rearranged or that a real building has been surveyed.

| Zone | Existing devices |
|---|---|
| Core | Multilayer Switch2 (`core`) |
| Floor 1: Admin, Engineering, HR | Multilayer Switch1 (`dist-west`); Switch0, Switch1, Switch2 and their clients/APs |
| Floor 2: Finance, IT | Multilayer Switch3 (`dist-east`); Switch5, Switch6, Switch7 and their clients/APs |
| Server room | Multilayer Switch0 (`servers`); server1–server3 |
| Corporate edge | Router0 (`edge`) |
| Simulated ISP | ISP router, server4, Switch3 and its wireless/client branch |

Say: “Access switches and APs connect users. Distribution switches provide department gateways and DHCP. The core connects the floors and shared servers. The edge provides the ISP path and NAT.” Keep the ISP visually outside the company. Explain one complete client path instead of listing 43 devices.

## Start the one-click demonstration

In PowerShell, from the project folder:

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
corepack pnpm install
npm run dev
```

Open **http://localhost:5173/simulation**. If Vite prints a different port, use that port with `/simulation`. The project is frontend-only; no API, database, Atlas account, or Packet Tracer login is required for the website. Keep the terminal running; Ctrl+C stops it.

Click **Present** to hide the dashboard navigation, then click **Simulate** once. The roughly one-minute walkthrough runs automatically. Use **Pause / Resume** while explaining, **Replay simulation** to start again, and **Reset** to return to the initial topology. Escape exits presentation mode. Zoom using the map controls and click a device to inspect its address and connected ports.

Every website page uses the same local 43-device/43-link model. It is manually maintained and may lag changes to the `.pkt`; Packet Tracer remains the native evidence source. Positions are adapted for browser readability.

## What to say (about 3–5 minutes)

1. **Introduce the objective.** “Sir, this is a scalable corporate network for five departments. I used VLSM to allocate addresses, DHCP to configure clients, and OSPF area 0 to route between the corporate multilayer switches and edge router.”
2. **Point out the six zones above.** WLC0 manages Corp-Admin and WLC1 manages ISP-Managed. The WRT devices now use LAN uplinks with DHCP disabled. Their clients use upstream DHCP rather than separate private client NAT LANs; broader verification is ongoing.
3. **Click Simulate; pause on VLSM.** Explain the parent block 10.10.0.0/23. Engineering needs 100 hosts and receives /25 (126 usable); Admin needs 50 and receives /26 (62 usable); Finance and HR receive /27 (30 each), and IT receives /28 (14). Gateways appear in the five cards below the diagram. Routed corporate links use /30.
4. **Continue to DHCP.** Explain Discover → Offer → Request → ACK. The diagram groups the request and response paths. Client leases can change, so show the current address with `ipconfig`; the Admin gateway is 10.10.0.129 and DNS is 10.10.1.66. The web animation simplifies broadcast fan-out and wireless controller tunneling.
5. **Pause on OSPF.** Explain that neighbors exchange routing information in area 0. The edge advertises a default route to the ISP. Two routed links connect the core and server switch, providing an alternate path.
6. **Follow DNS and HTTP.** DNS server1 resolves intranet.corporate.test to server2 at 10.10.1.67; the client then contacts that web server. Explain that DNS converts a name to an IP address, while HTTP retrieves the page.
7. **Show ISP access and failover.** Finance PC3 reaches simulated external server 203.0.113.2 via the edge and ISP. When the primary server link turns red, traffic uses the alternate server link. The last stage restores the primary. Explain that actual OSPF convergence takes time; the website shows an illustrative route recomputation.
8. **Show the actual Packet Tracer evidence below.** Say clearly: “The browser is my explanation interface. The Cisco Packet Tracer file contains the device configuration and actual simulated protocol tests.”

## Show it in Cisco Packet Tracer

Open [Scalable_Corporate_Network_CN.pkt](../network/packet-tracer/Scalable_Corporate_Network_CN.pkt) in Packet Tracer 9.0.1 or a compatible newer version. Keep this ready before meeting your sir.

1. Select **Realtime** and wait for links, DHCP and OSPF to converge. Use fast-forward time if needed.
2. Open **PC3 → Desktop → IP Configuration**. Show DHCP, its Finance address (observed 10.10.0.194/27), gateway 10.10.0.193 and DNS 10.10.1.66. Leases can change.
3. Open its **Web Browser**: visit `http://intranet.corporate.test`, then `http://www.isp.test`. These services exist inside the lab.
4. Close the device window. Select **Simulation → Edit Filters**, show **ARP + ICMP**, and use **Add Simple PDU** (closed envelope): click Laptop0, then PC3. Click **Auto Capture/Play** for animation, or **Capture/Forward** to explain each hop. Click an event to inspect OSI/PDU details. A first packet can fail while ARP resolves; converge and retry.
5. For DHCP, enable its filter. On a client choose **Static**, then **DHCP**, and step through Discover, Offer, Request, ACK. Return to **Realtime** afterward.
6. On the core CLI, enter `enable`, then `show ip ospf neighbor` and `show ip route`. Point out OSPF neighbors/routes. On west/east, `show ip dhcp binding` shows client leases.
7. Optional failover: on core, `configure terminal`, `interface FastEthernet0/2`, `shutdown`, `end`. Wait for convergence and test PC3 → server2. The alternate server link should carry traffic. Restore immediately with `configure terminal`, `interface FastEthernet0/2`, `no shutdown`, `end`. Verify the neighbor returns FULL. Do not shut both server links. Reopen the completed copy without saving if you want to discard demonstration changes.

Representative paths, DNS/HTTP and this single server-link failover were already checked. See `network/packet-tracer/README.md` for the addressing and observed checks. Do not paste the older `network/configs/R1.txt`–`R3.txt` configurations into this topology.

Those are historical checks. Use the following short live sequence rather than claiming that every device pair works.

### Complete-path and NAT evidence

On **PC3 → Desktop → Command Prompt**, enter one command at a time:

```text
ipconfig
ping 10.10.0.193
ping 10.10.1.66
ping 10.10.1.67
ping 203.0.113.2
```

Explain the targets: gateway, DNS, intranet, external server. Immediately afterward, open **Router0 → CLI**, press Enter, and type:

```text
enable
show ip interface brief
show ip nat translations
show ip nat statistics
```

Run the `show` commands at `edge#`; if the prompt is `edge(config)#`, enter `end` first. Dynamic entries expire, so generate traffic before inspecting NAT. Inside local is the original client address; inside global is the translated address. The WAN uses `198.51.100.0/30`, edge/PAT `.1`, ISP `.2`, with corporate-to-ISP-client traffic exempted from translation. These TEST-NET documentation addresses represent the public side in a lab; they are not real Internet allocations. On 7 November, reopening confirmed the WAN address persisted; Laptop1 reached 203.0.113.2 with 4/4 replies on repeat, and Router0 showed eight ICMP translations from 10.10.0.136 to 198.51.100.1. The main project was saved. The observed `10.10.0.194 → 192.168.11.1` entry from 2 November belongs to the previous WAN addressing.

### Wireless correction and its limits

The approved correction connects both WRT devices through **LAN Ethernet 1**, with their DHCP servers disabled. They bridge wireless users into HR and the ISP client LAN; Router0 retains edge NAT. Bridging forwards within a LAN, routing connects subnets, and NAT translates selected traffic. These are different jobs. This conversion does not create guest isolation.

The last observed leases were Laptop4 `10.10.0.227/27`, Laptop5 `10.10.0.228/27`, and Laptop8 `192.168.13.11/24`. Their gateways were `10.10.0.225`, `10.10.0.225`, and `192.168.13.1`, respectively. Laptop8's earlier .15 lease was stale after reopening. **Laptop1 → Laptop4 returned 4/4 on repeat ping; Laptop8 → PC3 and Laptop8 → Laptop4 also returned 4/4.** Read current `ipconfig` before testing further pairs and reverse directions. Routed lab-client traffic also needs compatible NAT selection and return routing.

Create fresh PDUs after DHCP changes; old entries may retain obsolete addresses. A first ARP timeout can be transient, but repeated failure requires inspecting the failed event. A switch can forward frames without answering ping itself: pinging it requires reachable management addressing and a return gateway.

### Explain scalability honestly

- Add access switches/APs while a department has address, port and uplink capacity.
- Add a routed department/floor by assigning an available subnet, gateway, DHCP service, distribution uplink and OSPF advertisement.
- The `/23` has 204 free addresses in several blocks. Existing subnets cannot all expand in place.
- Core, edge, server switch and floor distribution devices remain single failure points. Dual server links protect only that link path.
- The 207 required hosts are address-sizing inputs, not demonstrated concurrent users or bandwidth capacity. Larger deployments need suitable hardware capacity, standardized wireless equipment, redundancy and access policy.

The browser's “primary/backup” server-link labels describe its example path; they do not establish active/standby OSPF routing. Actual equal-cost forwarding and convergence are outside the browser model. No exhaustive all-pairs result or measured convergence time is claimed. A complete raw CLI/screenshot evidence bundle is not supplied; capture any outputs required by your faculty before the session.

## Likely viva questions

| Question | Short answer |
|---|---|
| Why VLSM? | Different departments need different host counts; different prefix lengths use the parent block efficiently. |
| Why OSPF? | It shares routes dynamically and supports alternate paths when a routed link fails. |
| Why DHCP? | It automatically supplies a client address, subnet mask, default gateway and DNS server. |
| What is the gateway? | The Layer 3 interface used to reach other IP subnets. |
| Is this real Internet access? | No. The ISP and external web server are simulated lab devices. |
| Does the website run Cisco IOS? | No. It illustrates the configured graph; Packet Tracer performs the protocol simulation. |
| What does the WLC do? | It manages lightweight access points and their WLAN configuration. |
| Why two server links? | They provide another route if one core-to-server-distribution link fails. |
| Why bridge internal Wi-Fi instead of using NAT? | Bridging puts users on the department subnet and permits ordinary routed access to them. |
| Does NAT mean guest isolation? | No. Address translation and access policy are separate functions. |
| What is scalable here? | Departments can be expanded or added in a controlled way, within address and hardware limits. |
