# Scalable Corporate Network - verified evidence

Updated 12 November 2026 after resolving and retesting the earlier evidence findings. Open index.html for the offline gallery; screenshots/ contains the native images and logs/ contains supporting outputs. manifest.csv lists the current evidence.

## Resolved findings

- Laptop9 now associates with its ISP-managed AP and renews 192.168.13.16/24, gateway 192.168.13.1, DNS 10.10.1.66. Fresh intranet and external pings both returned 4/4 replies. The earlier missing lease is no longer present; no wireless reconfiguration was required during this pass.
- The two HTTP servers had identical default pages, making one browser result inconclusive. Their index pages now identify the corporate intranet (server2) and simulated external service (server4) separately. Both names loaded the correct distinct pages on PC3.
- Server3 to Laptop7 returned 4/4 replies. A fresh native PDU run completed; screenshot 43 shows all four PDU rows Successful.
- The issues folder and its obsolete failed screenshots were removed only after the replacement checks passed. Earlier raw command logs remain available for chronology; they are not current failure results.

## Best screenshots for Review 2

1. 08-active-nat-table: live mappings from 10.10.0.197 to 198.51.100.1 toward 203.0.113.2.
2. 09-external-repeat and 10-intranet-ping: successful external and corporate packet transfers.
3. 12-core-ospf and 27-core-routing-table: FULL neighbours, learned routes and dual server next hops.
4. 14-west-dhcp and 36-laptop9-dhcp-retest: DHCP server bindings and current wireless client settings.
5. 35-laptop9-intranet-pass and 37-laptop9-external-pass: repaired/recovered wireless path, 4/4 replies each.
6. 38-intranet-http-retest and 39-external-http-retest: distinct working DNS/HTTP destinations.
7. 15-18, 19-finance-to-admin-retry, 25 and 26: representative wired, interdepartmental and wireless successes.
8. 40-server3-finance-wireless-retest and 43-pdu-retest: successful Finance wireless path and all-success native PDU list.
9. 45-final-topology: current native topology with Laptop9 associated.

## Saved state and remaining scope

The updated main file network/packet-tracer/Scalable_Corporate_Network_CN.pkt was saved successfully after the tests. The topology still has 46 objects and 49 native link entries. Packet Tracer was returned to Realtime. A pre-change backup is retained temporarily in .tmp/before-evidence-fixes.pkt.

Final readbacks showed zero down cabled links and no route convergence gaps. The generic health flag still reports WLC internal duplicated address representations and six WLC/WRT forwarding ports without host IPs. Those are simulator/interface representations, not failures repaired by inventing addresses. Unused router ports remain administratively down.

NAT rewrites replies on selected external paths; the earlier inbound-private-address probe displayed the translated reply source. It is not proof of arbitrary inbound public services. No NAT policy change was made to hide this expected translation behaviour.

No new exhaustive 231-pair sweep, throughput measurement, security audit or disruptive failover test was run. Historical audit records are under historical/. The current gallery contains verified representative results; it does not establish that every possible feature and flow was tested. DHCP leases and NAT translations remain dynamic.
