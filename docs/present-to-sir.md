# Present the Scalable Corporate Network

## Start the one-click demonstration

In PowerShell, from the project folder:

```powershell
cd "D:\CODING\Web Developing\CorporateNet"
npm install
npm run dev:web
```

Open **http://localhost:5173/simulation**. If Vite prints a different port, use that port with `/simulation`. No API, MongoDB, Atlas account or Packet Tracer login is required for this page. Keep the terminal running; Ctrl+C stops it. Dependencies need to be installed once, before the presentation.

Click **Present** to hide the dashboard navigation, then click **Simulate** once. The roughly one-minute walkthrough runs automatically. Use **Pause / Resume** while explaining, **Replay simulation** to start again, and **Reset** to return to the initial topology. Escape exits presentation mode. Zoom using the map controls and click a device to inspect its address and connected ports.

The page reproduces the completed lab's 43 devices and 43 physical/wireless connections, including the redundant server links, ISP, controllers, access points and clients. Positions are adapted for browser readability. It is a manually transcribed companion visualization, not a connection to the running .pkt. Other dashboard pages still display their saved database design, which may be the earlier three-router example.

## What to say (about 3–5 minutes)

1. **Introduce the objective.** “Sir, this is a scalable corporate network for five departments. I used VLSM to allocate addresses, DHCP to configure clients, and OSPF area 0 to route between the corporate multilayer switches and edge router.”
2. **Point out the structure.** Servers are at the upper left, the core is in the middle, and the ISP is at the upper right. The lower branches connect departmental switches and wired/wireless clients. WLC0 manages Corp-Admin and WLC1 manages ISP-Managed. The two WRT routers have separate private NAT LANs.
3. **Click Simulate; pause on VLSM.** Explain the parent block 10.10.0.0/23. Engineering needs 100 hosts and receives /25 (126 usable); Admin needs 50 and receives /26 (62 usable); Finance and HR receive /27 (30 each), and IT receives /28 (14). Gateways appear in the five cards below the diagram. Routed corporate links use /30.
4. **Continue to DHCP.** Explain Discover → Offer → Request → ACK. The diagram groups the request and response paths. Laptop0's observed configuration is 10.10.0.135/26, gateway 10.10.0.129, DNS 10.10.1.66. The web animation simplifies broadcast fan-out and wireless controller tunneling.
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
