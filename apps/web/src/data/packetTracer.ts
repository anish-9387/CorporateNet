import type { Link } from '@/types';
import { findPath } from '@/utils/simulation';

type Kind = 'router' | 'switch' | 'server' | 'pc' | 'laptop' | 'wireless' | 'controller';
export interface LabDevice { id: string; name: string; kind: Kind; detail: string; x: number; y: number }
const device = (id: string, name: string, kind: Kind, detail: string, x: number, y: number): LabDevice => ({ id, name, kind, detail, x, y });

// Transcribed from the completed .pkt; positions preserve its server/core/ISP and departmental branches.
export const labDevices: LabDevice[] = [
  device('server1', 'server1', 'server', 'DNS · 10.10.1.66', 40, 50),
  device('server2', 'server2', 'server', 'HTTP · 10.10.1.67', 40, 150),
  device('server3', 'server3', 'server', '10.10.1.68', 40, 250),
  device('servers', 'Multilayer Switch0', 'switch', 'servers · VLAN 60', 240, 150),
  device('core', 'Multilayer Switch2', 'switch', 'core · OSPF area 0', 620, 260),
  device('edge', 'Router0', 'router', 'edge · default route', 620, 70),
  device('isp', 'ISP', 'router', '192.168.11.2/30', 900, 70),
  device('server4', 'server4', 'server', '203.0.113.2', 1150, 0),
  device('sw3', 'Switch3', 'switch', 'ISP · 192.168.13.0/24', 1150, 140),
  device('laptop10', 'Laptop10', 'laptop', '192.168.13.11', 1370, 50),
  device('wlc1', 'WLC1', 'controller', '192.168.13.2', 1370, 150),
  device('lwap1', 'LWAP1', 'wireless', 'ISP-Managed', 1140, 300),
  device('laptop9', 'Laptop9', 'laptop', '192.168.13.13', 1140, 410),
  device('wrt1', 'Wireless Router1', 'wireless', 'ISP NAT · 192.168.0.1', 1530, 250),
  device('laptop8', 'Laptop8', 'laptop', 'ISP private WLAN', 1530, 380),
  device('west', 'Multilayer Switch1', 'switch', 'dist-west · DHCP', 360, 410),
  device('east', 'Multilayer Switch3', 'switch', 'dist-east · DHCP', 870, 510),
  device('sw0', 'Switch0', 'switch', 'Administration · /26', 150, 550),
  device('lwap0', 'LWAP0', 'wireless', 'Corp-Admin', 0, 450),
  device('wlc0', 'WLC0', 'controller', '10.10.0.190', 0, 670),
  device('laptop0', 'Laptop0', 'laptop', '10.10.0.135 · DHCP', -190, 350),
  device('laptop1', 'Laptop1', 'laptop', 'Corp-Admin · DHCP', -190, 460),
  device('laptop2', 'Laptop2', 'laptop', 'Corp-Admin · DHCP', -190, 570),
  device('pc0', 'PC0', 'pc', '10.10.0.130', 150, 770),
  device('pc5', 'PC5', 'pc', '10.10.0.132', -10, 810),
  device('sw1', 'Switch1', 'switch', 'Engineering · /25', 360, 610),
  device('laptop3', 'Laptop3', 'laptop', '10.10.0.3', 260, 850),
  device('pc1', 'PC1', 'pc', '10.10.0.2', 420, 850),
  device('sw2', 'Switch2', 'switch', 'HR uplink · /27', 570, 610),
  device('wrt0', 'Wireless Router0', 'wireless', 'HR NAT · 10.10.0.226', 600, 740),
  device('laptop4', 'Laptop4', 'laptop', 'HR private WLAN', 570, 950),
  device('laptop5', 'Laptop5', 'laptop', 'HR private WLAN', 730, 950),
  device('sw5', 'Switch5', 'switch', 'Finance · VLAN 30', 800, 720),
  device('pc3', 'PC3', 'pc', '10.10.0.194', 900, 910),
  device('sw6', 'Switch6', 'switch', 'IT Support · /28', 1050, 640),
  device('ap0', 'Access Point0', 'wireless', 'Corp-IT', 1130, 790),
  device('pc4', 'PC4', 'pc', '10.10.1.2', 1000, 950),
  device('pc2', 'PC2', 'pc', '10.10.1.4', 1170, 1000),
  device('pc2b', 'PC2(1)', 'pc', 'Corp-IT · DHCP', 1340, 1000),
  device('sw7', 'Switch7', 'switch', 'Finance · VLAN 30', 1380, 580),
  device('ap1', 'Access Point1', 'wireless', 'Corp-Finance', 1480, 720),
  device('laptop6', 'Laptop6', 'laptop', 'Finance · DHCP', 1600, 900),
  device('laptop7', 'Laptop7', 'laptop', 'Finance · DHCP', 1430, 900),
];

function link(id: string, a: string, ai: string, b: string, bi: string, cidr = '', wireless = false): Link & { wireless: boolean } {
  return { linkId: id, sourceDeviceId: a, sourceInterface: ai, targetDeviceId: b, targetInterface: bi, networkCidr: cidr, medium: id === 'wan' ? 'serial' : 'ethernet', wireless };
}
export const labLinks = [
  link('dns', 'server1', 'Fa0', 'servers', 'Fa0/1'),
  link('http', 'server2', 'Fa0', 'servers', 'Fa0/2'),
  link('server3', 'server3', 'Fa0', 'servers', 'Fa0/3'),
  link('server-primary', 'core', 'Fa0/2', 'servers', 'Fa0/4', '10.10.1.24/30'),
  link('server-backup', 'core', 'Fa0/3', 'servers', 'Fa0/5', '10.10.1.28/30'),
  link('core-west', 'core', 'Fa0/1', 'west', 'Fa0/2', '10.10.1.16/30'),
  link('core-east', 'core', 'Fa0/5', 'east', 'Fa0/1', '10.10.1.20/30'),
  link('core-edge', 'core', 'Fa0/4', 'edge', 'Fa0/0', '10.10.1.112/30'),
  link('wan', 'edge', 'S0/3/0', 'isp', 'S0/3/0', '192.168.11.0/30'),
  link('external', 'isp', 'Fa0/0', 'server4', 'Fa0', '203.0.113.0/24'),
  link('isp-lan', 'isp', 'Fa0/1', 'sw3', 'Fa0/1', '192.168.13.0/24'),
  link('admin-lan', 'west', 'Fa0/1', 'sw0', 'Fa0/5', '10.10.0.128/26'),
  link('eng-lan', 'west', 'Fa0/3', 'sw1', 'Fa0/1', '10.10.0.0/25'),
  link('hr-lan', 'west', 'Fa0/4', 'sw2', 'Fa0/1', '10.10.0.224/27'),
  link('admin-ap', 'sw0', 'Fa0/1', 'lwap0', 'Gig0'),
  link('admin-wlc', 'sw0', 'Fa0/2', 'wlc0', 'Gig1'),
  link('admin-pc5', 'sw0', 'Fa0/3', 'pc5', 'Fa0'),
  link('admin-pc0', 'sw0', 'Fa0/4', 'pc0', 'Fa0'),
  link('admin-wifi0', 'lwap0', 'Radio', 'laptop0', 'Wireless0', '', true),
  link('admin-wifi1', 'lwap0', 'Radio', 'laptop1', 'Wireless0', '', true),
  link('admin-wifi2', 'lwap0', 'Radio', 'laptop2', 'Wireless0', '', true),
  link('eng-laptop', 'sw1', 'Fa0/2', 'laptop3', 'Fa0'),
  link('eng-pc', 'sw1', 'Fa0/3', 'pc1', 'Fa0'),
  link('hr-wrt', 'sw2', 'Fa0/2', 'wrt0', 'Internet'),
  link('hr-wifi4', 'wrt0', 'Radio', 'laptop4', 'Wireless0', '', true),
  link('hr-wifi5', 'wrt0', 'Radio', 'laptop5', 'Wireless0', '', true),
  link('finance-lan', 'east', 'Fa0/4', 'sw5', 'Fa0/2', '10.10.0.192/27'),
  link('finance-pc', 'sw5', 'Fa0/1', 'pc3', 'Fa0'),
  link('it-lan', 'east', 'Fa0/3', 'sw6', 'Fa0/2', '10.10.1.0/28'),
  link('it-pc', 'sw6', 'Fa0/1', 'pc4', 'Fa0'),
  link('it-ap', 'sw6', 'Fa0/3', 'ap0', 'Port0'),
  link('it-wifi2', 'ap0', 'Radio', 'pc2', 'Wireless0', '', true),
  link('it-wifi2b', 'ap0', 'Radio', 'pc2b', 'Wireless0', '', true),
  link('finance-wlan', 'east', 'Fa0/2', 'sw7', 'Fa0/2', 'VLAN 30'),
  link('finance-ap', 'sw7', 'Fa0/1', 'ap1', 'Port0'),
  link('finance-wifi6', 'ap1', 'Radio', 'laptop6', 'Wireless0', '', true),
  link('finance-wifi7', 'ap1', 'Radio', 'laptop7', 'Wireless0', '', true),
  link('isp-laptop', 'sw3', 'Fa0/2', 'laptop10', 'Fa0'),
  link('isp-wlc', 'sw3', 'Fa0/3', 'wlc1', 'Gig1'),
  link('isp-wrt', 'sw3', 'Fa0/4', 'wrt1', 'Internet'),
  link('isp-ap', 'sw3', 'Fa0/5', 'lwap1', 'Gig0'),
  link('isp-wifi9', 'lwap1', 'Radio', 'laptop9', 'Wireless0', '', true),
  link('isp-wifi8', 'wrt1', 'Radio', 'laptop8', 'Wireless0', '', true),
];

export const labSubnets = [
  { name: 'Engineering', hosts: 100, cidr: '10.10.0.0/25', gateway: '10.10.0.1' },
  { name: 'Administration', hosts: 50, cidr: '10.10.0.128/26', gateway: '10.10.0.129' },
  { name: 'Finance', hosts: 25, cidr: '10.10.0.192/27', gateway: '10.10.0.193' },
  { name: 'HR uplink', hosts: 20, cidr: '10.10.0.224/27', gateway: '10.10.0.225' },
  { name: 'IT Support', hosts: 12, cidr: '10.10.1.0/28', gateway: '10.10.1.1' },
];

export interface DemoStep { title: string; protocol: string; explanation: string; from?: string; to?: string; failedLink?: string; highlights?: string[] }
export const demoSteps: DemoStep[] = [
  { title: 'One address block. Five departments.', protocol: 'VLSM', explanation: 'Split 10.10.0.0/23 largest-first: /25 for 100 Engineering hosts, /26 for 50 Admin hosts, then /27, /27 and /28. Routed links use /30.' },
  { title: 'The client asks for an address', protocol: 'DHCP', from: 'laptop0', to: 'west', explanation: 'Illustrated DHCP Discover / Request path: Laptop0 joins Corp-Admin through LWAP0 and Switch0 to the west DHCP server. Broadcast fan-out is simplified.' },
  { title: 'DHCP returns the client configuration', protocol: 'DHCP', from: 'west', to: 'laptop0', explanation: 'Offer / ACK: Laptop0 receives 10.10.0.135/26, gateway 10.10.0.129 and DNS 10.10.1.66. This lease was observed in Packet Tracer.' },
  { title: 'The corporate backbone shares routes', protocol: 'OSPF', highlights: ['core-west', 'core-east', 'core-edge', 'server-primary', 'server-backup'], explanation: 'OSPF process 1, area 0 connects the four multilayer switches and edge router. Two routed links connect the server distribution switch. The edge advertises the ISP default route.' },
  { title: 'Resolve the intranet name', protocol: 'DNS', from: 'laptop0', to: 'server1', explanation: 'A DNS query for intranet.corporate.test follows the Admin → west → core → servers path to DNS server 10.10.1.66.' },
  { title: 'DNS returns the web server address', protocol: 'DNS', from: 'server1', to: 'laptop0', explanation: 'The DNS response maps intranet.corporate.test to 10.10.1.67. The return path reaches the same wireless client.' },
  { title: 'Open the corporate intranet', protocol: 'HTTP', from: 'laptop0', to: 'server2', explanation: 'With the name resolved, the browser can contact server2 at 10.10.1.67. Moving dots illustrate the request path; TCP handshakes are omitted.' },
  { title: 'Reach the simulated ISP', protocol: 'ICMP', from: 'pc3', to: 'server4', explanation: 'Finance PC3 uses east → core → edge → ISP to reach 203.0.113.2. The ISP has a static return route to corporate 10.10.0.0/23.' },
  { title: 'A server link goes offline', protocol: 'FAILOVER', from: 'pc3', to: 'server2', failedLink: 'server-primary', explanation: 'Core Fa0/2 is taken offline in this illustration. After route recomputation, the packet uses core Fa0/3 and the second server link. This failure was tested successfully in Packet Tracer.' },
  { title: 'Restore the link and verify the return path', protocol: 'RECOVERY', from: 'server2', to: 'pc3', explanation: 'Both server links are available again. In Packet Tracer the restored link returned up and its OSPF neighbor returned to FULL. The browser does not emulate convergence timing or equal-cost load balancing.' },
];

// shortcut: graph routes illustrate configured paths, not IOS forwarding, CAPWAP, NAT or protocol state; use the .pkt for packet-level validation.
export function stepRoute(step: DemoStep) {
  return step.from && step.to ? findPath(labLinks, step.from, step.to, step.failedLink) : [];
}
export function stepTicks(step: DemoStep) { return Math.max(5, (stepRoute(step)?.length ?? 0) + 2); }
export const demoTickMs = 900;
