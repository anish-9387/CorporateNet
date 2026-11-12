# Scalable Corporate Network — connectivity audit

Audit sessions: 7–8 November 2026. The filename retains the start date for existing references.

## Exhaustive end-device audit — 2026-11-08

- Active project verified as `network/packet-tracer/Scalable_Corporate_Network_CN.pkt`: 46 devices and 49 links.
- Tested all 231 unique pairs among 22 end devices (4 servers and 18 PCs/laptops) with real ICMP pings. Every pair passed after one retry where initial ARP learning caused packet loss or a timeout.
- A ping includes an echo request and its echo reply, so each successful pair proves a working forward and return path between the two endpoints.
- Laptop0 and Laptop1 had no address immediately after reopening the project. `ipconfig /renew` restored valid DHCP leases (`10.10.0.137/26` and `10.10.0.136/26`, gateway `10.10.0.129`, DNS `10.10.1.66`) before the sweep.
- Final physical health: 0 down links. The six ports reported without an IP are WLC/WRT forwarding ports that do not require host addresses.
- Final routing health: 5 OSPF devices, 10 FULL neighbours, no routing convergence gaps.
- NAT is configured on Router0 with `FastEthernet0/0` inside and `Serial0/3/0` outside. Its live translation table was empty at the final read; dynamic entries appear only while matching translated traffic is active.
- The health tool's duplicate-IP warnings are WLC internal representations: each controller reports its management address on both `Vlan1` and `management`, and both controllers use the standard shared virtual IP `192.0.2.1`.

## Verified in Packet Tracer

- Loaded topology: 46 devices and 49 links.
- Physical link health: 0 down links.
- OSPF: 5 corporate routing devices, 10 FULL neighbour entries (five adjacencies), no convergence gaps.
- 42 endpoint-to-anchor paths passed after a repeat where needed. Anchors were `server 1` (10.10.1.66) and `server 4` (203.0.113.2).
- 40 reverse paths from the two servers to 20 other clients passed.
- 38 of 38 server-to-infrastructure management pings passed. The two public-server paths that were previously pending both pass now: `server 4` → Switch6 (`10.10.1.2`) passed 4/4; `server 4` → Switch7 (`10.10.0.194`) first returned 2/4, then passed 4/4 on repeat (consistent with ARP/initial forwarding warm-up).
- Total for the earlier endpoint/server/infrastructure sweep: 120 successful real ping paths. The repeat above is an additional confirmation; simple PDU calls that only reported “added” were not counted as successful delivery.
- Laptop 9 had no lease after opening the lab. `ipconfig /renew` obtained 192.168.13.16/24, gateway 192.168.13.1, DNS 10.10.1.66; its repeat ping to server 1 passed 4/4.

## Live changes and save status

The currently open project was confirmed by Packet Tracer metadata to be `network/packet-tracer/Scalable_Corporate_Network_CN.pkt` (46 devices, 49 links). Both Linksys WRTs are acting as access points: Wireless Router0 has management address `10.10.0.230/27` and gateway `10.10.0.225`; Wireless Router1 has `192.168.13.15/24` and gateway `192.168.13.1`. Their live configs and routes were read back. This audit did not issue a save command, to avoid touching another lab file or changing the user's in-memory state; whether the current in-memory state has unsaved changes was not independently verified.

## Scope

The exhaustive matrix covers every unique pair of IP end devices. Switches, routers, controllers and access points were validated through physical-link health, routing state, management tests from the earlier sweep, and the client traffic they forwarded. Power distribution devices and interfaces without IP addresses are not ICMP endpoints.

## Supplementary recorded demonstrations

- On 7 November 2026, Laptop1 reached 203.0.113.2 with 4/4 replies on repeat. Router0 showed eight ICMP PAT entries translating 10.10.0.136 to 198.51.100.1. This observation was saved then; the final 8 November NAT readback above was empty. Dynamic entries expire.
- The recorded server-link demonstration disabled core Fa0/2, verified PC3 → server2 over the remaining link after convergence, then restored Fa0/2 and the FULL OSPF neighbour. It did not measure recovery time or establish full device redundancy.
- Managed wireless checks joined Laptop0–Laptop2 to Corp-Admin and Laptop9 to ISP-Managed. Earlier DNS/HTTP examples verified access to the intranet and simulated external web service on selected clients, not every application flow.
- [representative-checks.csv](representative-checks.csv) preserves all 13 PASS records from the earlier 1,806-row partial infrastructure matrix. Its 1,627 NOT_TESTED and 166 NOT_APPLICABLE placeholders were removed during cleanup. These 13 records are historical and are not added to the 231 unique-pair total.
