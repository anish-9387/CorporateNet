import { findPath } from '@/utils/simulation';
import type { Department, Device, Link, NetworkInterface, VLSMInput, VLSMResult, VLSMCalculationResponse } from '@/types';

export interface LabDevice {
  id: string;
  name: string;
  type: Device['type'];
  model?: string;
  managementIp?: string;
  description: string;
}

// ============================================================================
// PACKET TRACER LAB DATA (43-device topology)
// ============================================================================

export const labDevices: readonly LabDevice[] = [
  { id: 'server1', name: 'server1', type: 'server', model: 'DNS Server', managementIp: '10.10.1.66', description: 'DNS server for intranet.corporate.test' },
  { id: 'server2', name: 'server2', type: 'server', model: 'HTTP Server', managementIp: '10.10.1.67', description: 'Corporate intranet web server (intranet.corporate.test)' },
  { id: 'server3', name: 'server3', type: 'server', model: 'App Server', managementIp: '10.10.1.68', description: 'Additional corporate application server' },
  { id: 'servers', name: 'Multilayer Switch0', type: 'switch', model: 'Cisco 3560', managementIp: '10.10.1.65', description: 'Server farm distribution switch (VLAN 60)' },
  { id: 'core', name: 'Multilayer Switch2', type: 'switch', model: 'Cisco 3560', managementIp: '10.10.1.17', description: 'Core distribution switch (OSPF Area 0)' },
  { id: 'edge', name: 'Router0', type: 'router', model: 'Cisco 2811', managementIp: '10.10.1.114', description: 'Edge router with PAT to ISP (default route)' },
  { id: 'isp', name: 'ISP', type: 'router', model: 'Cisco 2811', managementIp: '198.51.100.2', description: 'Simulated ISP router' },
  { id: 'server4', name: 'server4', type: 'server', model: 'External Web', managementIp: '203.0.113.2', description: 'Simulated external web server (www.isp.test)' },
  { id: 'sw3', name: 'Switch3', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'ISP client LAN access switch; management address learned by DHCP' },
  { id: 'laptop10', name: 'Laptop10', type: 'laptop', managementIp: '', description: 'ISP wired DHCP client; verify the current lease with ipconfig' },
  { id: 'wlc1', name: 'WLC1', type: 'controller', model: 'WLC 2504', managementIp: '192.168.13.2', description: 'ISP wireless LAN controller (ISP-Managed SSID)' },
  { id: 'lwap1', name: 'LWAP1', type: 'wireless', model: 'AP 1140', managementIp: '', description: 'ISP-managed lightweight access point' },
  { id: 'laptop9', name: 'Laptop9', type: 'laptop', managementIp: '', description: 'ISP wireless client (ISP-Managed SSID)' },
  { id: 'wrt1', name: 'Wireless Router1', type: 'wireless', model: 'WRT300N', managementIp: '192.168.13.15', description: 'ISP LAN bridge - DHCP disabled' },
  { id: 'laptop8', name: 'Laptop8', type: 'laptop', managementIp: '', description: 'ISP wireless DHCP client via WRT1 bridge' },
  { id: 'west', name: 'Multilayer Switch1', type: 'switch', model: 'Cisco 3560', managementIp: '10.10.1.18', description: 'Distribution West - DHCP for Admin/Eng/HR' },
  { id: 'east', name: 'Multilayer Switch3', type: 'switch', model: 'Cisco 3560', managementIp: '10.10.1.22', description: 'Distribution East - DHCP for Finance/IT' },
  { id: 'sw0', name: 'Switch0', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'Administration access switch; management address learned by DHCP' },
  { id: 'lwap0', name: 'LWAP0', type: 'wireless', model: 'AP 1140', managementIp: '', description: 'Corporate Admin wireless AP (Corp-Admin SSID)' },
  { id: 'wlc0', name: 'WLC0', type: 'controller', model: 'WLC 2504', managementIp: '10.10.0.190', description: 'Corporate wireless LAN controller (Corp-Admin SSID)' },
  { id: 'laptop0', name: 'Laptop0', type: 'laptop', managementIp: '', description: 'Admin wireless DHCP client' },
  { id: 'laptop1', name: 'Laptop1', type: 'laptop', managementIp: '', description: 'Admin wireless client (DHCP)' },
  { id: 'laptop2', name: 'Laptop2', type: 'laptop', managementIp: '', description: 'Admin wireless client (DHCP)' },
  { id: 'pc0', name: 'PC0', type: 'pc', managementIp: '10.10.0.130', description: 'Admin wired PC (static 10.10.0.130)' },
  { id: 'pc5', name: 'PC5', type: 'pc', managementIp: '10.10.0.132', description: 'Admin wired PC (static 10.10.0.132)' },
  { id: 'sw1', name: 'Switch1', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'Engineering access switch; management address learned by DHCP' },
  { id: 'laptop3', name: 'Laptop3', type: 'laptop', managementIp: '10.10.0.3', description: 'Engineering wired laptop (static 10.10.0.3)' },
  { id: 'pc1', name: 'PC1', type: 'pc', managementIp: '10.10.0.2', description: 'Engineering wired PC (static 10.10.0.2)' },
  { id: 'sw2', name: 'Switch2', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'HR access switch; management address learned by DHCP' },
  { id: 'wrt0', name: 'Wireless Router0', type: 'wireless', model: 'WRT300N', managementIp: '10.10.0.230', description: 'HR LAN bridge - DHCP disabled' },
  { id: 'laptop4', name: 'Laptop4', type: 'laptop', managementIp: '', description: 'HR wireless DHCP client via WRT0 bridge' },
  { id: 'laptop5', name: 'Laptop5', type: 'laptop', managementIp: '', description: 'HR wireless DHCP client via WRT0 bridge' },
  { id: 'sw5', name: 'Switch5', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'Finance VLAN 30 access switch; management address learned by DHCP' },
  { id: 'pc3', name: 'PC3', type: 'pc', managementIp: '', description: 'Finance wired DHCP client; read the current lease in Packet Tracer' },
  { id: 'sw6', name: 'Switch6', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'IT Support access switch; management address learned by DHCP' },
  { id: 'ap0', name: 'Access Point0', type: 'wireless', model: 'AP 1140', managementIp: '', description: 'Corporate IT wireless AP (Corp-IT SSID)' },
  { id: 'pc4', name: 'PC4', type: 'pc', managementIp: '10.10.1.2', description: 'IT wired PC (static 10.10.1.2)' },
  { id: 'pc2', name: 'PC2', type: 'pc', managementIp: '10.10.1.4', description: 'IT wireless PC (static 10.10.1.4)' },
  { id: 'pc2b', name: 'PC2(1)', type: 'pc', managementIp: '', description: 'IT wireless client (DHCP)' },
  { id: 'sw7', name: 'Switch7', type: 'switch', model: 'Cisco 2960', managementIp: '', description: 'Finance wireless VLAN 30 access switch; management address learned by DHCP' },
  { id: 'ap1', name: 'Access Point1', type: 'wireless', model: 'AP 1140', managementIp: '', description: 'Corporate Finance wireless AP (Corp-Finance SSID)' },
  { id: 'laptop6', name: 'Laptop6', type: 'laptop', managementIp: '', description: 'Finance wireless client (DHCP)' },
  { id: 'laptop7', name: 'Laptop7', type: 'laptop', managementIp: '', description: 'Finance wireless client (DHCP)' },
];

export const labLinks: readonly Link[] = [
  { linkId: 'dns', sourceDeviceId: 'server1', sourceInterface: 'Fa0', targetDeviceId: 'servers', targetInterface: 'Fa0/1', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'http', sourceDeviceId: 'server2', sourceInterface: 'Fa0', targetDeviceId: 'servers', targetInterface: 'Fa0/2', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'server3', sourceDeviceId: 'server3', sourceInterface: 'Fa0', targetDeviceId: 'servers', targetInterface: 'Fa0/3', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'server-primary', sourceDeviceId: 'core', sourceInterface: 'Fa0/2', targetDeviceId: 'servers', targetInterface: 'Fa0/4', networkCidr: '10.10.1.24/30', medium: 'ethernet' as const },
  { linkId: 'server-backup', sourceDeviceId: 'core', sourceInterface: 'Fa0/3', targetDeviceId: 'servers', targetInterface: 'Fa0/5', networkCidr: '10.10.1.28/30', medium: 'ethernet' as const },
  { linkId: 'core-west', sourceDeviceId: 'core', sourceInterface: 'Fa0/1', targetDeviceId: 'west', targetInterface: 'Fa0/2', networkCidr: '10.10.1.16/30', medium: 'ethernet' as const },
  { linkId: 'core-east', sourceDeviceId: 'core', sourceInterface: 'Fa0/5', targetDeviceId: 'east', targetInterface: 'Fa0/1', networkCidr: '10.10.1.20/30', medium: 'ethernet' as const },
  { linkId: 'core-edge', sourceDeviceId: 'core', sourceInterface: 'Fa0/4', targetDeviceId: 'edge', targetInterface: 'Fa0/0', networkCidr: '10.10.1.112/30', medium: 'ethernet' as const },
  { linkId: 'wan', sourceDeviceId: 'edge', sourceInterface: 'S0/3/0', targetDeviceId: 'isp', targetInterface: 'S0/3/0', networkCidr: '198.51.100.0/30', medium: 'serial' as const },
  { linkId: 'external', sourceDeviceId: 'isp', sourceInterface: 'Fa0/0', targetDeviceId: 'server4', targetInterface: 'Fa0', networkCidr: '203.0.113.0/24', medium: 'ethernet' as const },
  { linkId: 'isp-lan', sourceDeviceId: 'isp', sourceInterface: 'Fa0/1', targetDeviceId: 'sw3', targetInterface: 'Fa0/1', networkCidr: '192.168.13.0/24', medium: 'ethernet' as const },
  { linkId: 'admin-lan', sourceDeviceId: 'west', sourceInterface: 'Fa0/1', targetDeviceId: 'sw0', targetInterface: 'Fa0/5', networkCidr: '10.10.0.128/26', medium: 'ethernet' as const },
  { linkId: 'eng-lan', sourceDeviceId: 'west', sourceInterface: 'Fa0/3', targetDeviceId: 'sw1', targetInterface: 'Fa0/1', networkCidr: '10.10.0.0/25', medium: 'ethernet' as const },
  { linkId: 'hr-lan', sourceDeviceId: 'west', sourceInterface: 'Fa0/4', targetDeviceId: 'sw2', targetInterface: 'Fa0/1', networkCidr: '10.10.0.224/27', medium: 'ethernet' as const },
  { linkId: 'admin-ap', sourceDeviceId: 'sw0', sourceInterface: 'Fa0/1', targetDeviceId: 'lwap0', targetInterface: 'Gig0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'admin-wlc', sourceDeviceId: 'sw0', sourceInterface: 'Fa0/2', targetDeviceId: 'wlc0', targetInterface: 'Gig1', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'admin-pc5', sourceDeviceId: 'sw0', sourceInterface: 'Fa0/3', targetDeviceId: 'pc5', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'admin-pc0', sourceDeviceId: 'sw0', sourceInterface: 'Fa0/4', targetDeviceId: 'pc0', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'admin-wifi0', sourceDeviceId: 'lwap0', sourceInterface: 'Radio', targetDeviceId: 'laptop0', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'admin-wifi1', sourceDeviceId: 'lwap0', sourceInterface: 'Radio', targetDeviceId: 'laptop1', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'admin-wifi2', sourceDeviceId: 'lwap0', sourceInterface: 'Radio', targetDeviceId: 'laptop2', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'eng-laptop', sourceDeviceId: 'sw1', sourceInterface: 'Fa0/2', targetDeviceId: 'laptop3', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'eng-pc', sourceDeviceId: 'sw1', sourceInterface: 'Fa0/3', targetDeviceId: 'pc1', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'hr-wrt', sourceDeviceId: 'sw2', sourceInterface: 'Fa0/2', targetDeviceId: 'wrt0', targetInterface: 'Ethernet1', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'hr-wifi4', sourceDeviceId: 'wrt0', sourceInterface: 'Radio', targetDeviceId: 'laptop4', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'hr-wifi5', sourceDeviceId: 'wrt0', sourceInterface: 'Radio', targetDeviceId: 'laptop5', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'finance-lan', sourceDeviceId: 'east', sourceInterface: 'Fa0/4', targetDeviceId: 'sw5', targetInterface: 'Fa0/2', networkCidr: '10.10.0.192/27', medium: 'ethernet' as const },
  { linkId: 'finance-pc', sourceDeviceId: 'sw5', sourceInterface: 'Fa0/1', targetDeviceId: 'pc3', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'it-lan', sourceDeviceId: 'east', sourceInterface: 'Fa0/3', targetDeviceId: 'sw6', targetInterface: 'Fa0/2', networkCidr: '10.10.1.0/28', medium: 'ethernet' as const },
  { linkId: 'it-pc', sourceDeviceId: 'sw6', sourceInterface: 'Fa0/1', targetDeviceId: 'pc4', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'it-ap', sourceDeviceId: 'sw6', sourceInterface: 'Fa0/3', targetDeviceId: 'ap0', targetInterface: 'Port0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'it-wifi2', sourceDeviceId: 'ap0', sourceInterface: 'Radio', targetDeviceId: 'pc2', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'it-wifi2b', sourceDeviceId: 'ap0', sourceInterface: 'Radio', targetDeviceId: 'pc2b', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'finance-wlan', sourceDeviceId: 'east', sourceInterface: 'Fa0/2', targetDeviceId: 'sw7', targetInterface: 'Fa0/2', networkCidr: 'VLAN 30', medium: 'ethernet' as const },
  { linkId: 'finance-ap', sourceDeviceId: 'sw7', sourceInterface: 'Fa0/1', targetDeviceId: 'ap1', targetInterface: 'Port0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'finance-wifi6', sourceDeviceId: 'ap1', sourceInterface: 'Radio', targetDeviceId: 'laptop6', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'finance-wifi7', sourceDeviceId: 'ap1', sourceInterface: 'Radio', targetDeviceId: 'laptop7', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'isp-laptop', sourceDeviceId: 'sw3', sourceInterface: 'Fa0/2', targetDeviceId: 'laptop10', targetInterface: 'Fa0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'isp-wlc', sourceDeviceId: 'sw3', sourceInterface: 'Fa0/3', targetDeviceId: 'wlc1', targetInterface: 'Gig1', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'isp-wrt', sourceDeviceId: 'sw3', sourceInterface: 'Fa0/4', targetDeviceId: 'wrt1', targetInterface: 'Ethernet1', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'isp-ap', sourceDeviceId: 'sw3', sourceInterface: 'Fa0/5', targetDeviceId: 'lwap1', targetInterface: 'Gig0', networkCidr: '', medium: 'ethernet' as const },
  { linkId: 'isp-wifi9', sourceDeviceId: 'lwap1', sourceInterface: 'Radio', targetDeviceId: 'laptop9', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
  { linkId: 'isp-wifi8', sourceDeviceId: 'wrt1', sourceInterface: 'Radio', targetDeviceId: 'laptop8', targetInterface: 'Wireless0', networkCidr: '', medium: 'wireless' as const },
];

export const labInterfaces: readonly NetworkInterface[] = [
  // Servers
  { deviceId: 'server1', interfaceName: 'Fa0', ipAddress: '10.10.1.66', subnetMask: '255.255.255.240', networkCidr: '10.10.1.64/28' },
  { deviceId: 'server2', interfaceName: 'Fa0', ipAddress: '10.10.1.67', subnetMask: '255.255.255.240', networkCidr: '10.10.1.64/28' },
  { deviceId: 'server3', interfaceName: 'Fa0', ipAddress: '10.10.1.68', subnetMask: '255.255.255.240', networkCidr: '10.10.1.64/28' },
  { deviceId: 'servers', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'servers', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'servers', interfaceName: 'Fa0/3', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'servers', interfaceName: 'Fa0/4', ipAddress: '10.10.1.26', subnetMask: '255.255.255.252', networkCidr: '10.10.1.24/30' },
  { deviceId: 'servers', interfaceName: 'Fa0/5', ipAddress: '10.10.1.30', subnetMask: '255.255.255.252', networkCidr: '10.10.1.28/30' },
  { deviceId: 'servers', interfaceName: 'VLAN60', ipAddress: '10.10.1.65', subnetMask: '255.255.255.240', networkCidr: '10.10.1.64/28' },
  // Core
  { deviceId: 'core', interfaceName: 'Fa0/1', ipAddress: '10.10.1.17', subnetMask: '255.255.255.252', networkCidr: '10.10.1.16/30' },
  { deviceId: 'core', interfaceName: 'Fa0/2', ipAddress: '10.10.1.25', subnetMask: '255.255.255.252', networkCidr: '10.10.1.24/30' },
  { deviceId: 'core', interfaceName: 'Fa0/3', ipAddress: '10.10.1.29', subnetMask: '255.255.255.252', networkCidr: '10.10.1.28/30' },
  { deviceId: 'core', interfaceName: 'Fa0/4', ipAddress: '10.10.1.113', subnetMask: '255.255.255.252', networkCidr: '10.10.1.112/30' },
  { deviceId: 'core', interfaceName: 'Fa0/5', ipAddress: '10.10.1.21', subnetMask: '255.255.255.252', networkCidr: '10.10.1.20/30' },
  // Edge
  { deviceId: 'edge', interfaceName: 'Fa0/0', ipAddress: '10.10.1.114', subnetMask: '255.255.255.252', networkCidr: '10.10.1.112/30' },
  { deviceId: 'edge', interfaceName: 'S0/3/0', ipAddress: '198.51.100.1', subnetMask: '255.255.255.252', networkCidr: '198.51.100.0/30' },
  // ISP
  { deviceId: 'isp', interfaceName: 'S0/3/0', ipAddress: '198.51.100.2', subnetMask: '255.255.255.252', networkCidr: '198.51.100.0/30' },
  { deviceId: 'isp', interfaceName: 'Fa0/0', ipAddress: '203.0.113.1', subnetMask: '255.255.255.0', networkCidr: '203.0.113.0/24' },
  { deviceId: 'isp', interfaceName: 'Fa0/1', ipAddress: '192.168.13.1', subnetMask: '255.255.255.0', networkCidr: '192.168.13.0/24' },
  // West
  { deviceId: 'west', interfaceName: 'Fa0/1', ipAddress: '10.10.0.129', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26' },
  { deviceId: 'west', interfaceName: 'Fa0/2', ipAddress: '10.10.1.18', subnetMask: '255.255.255.252', networkCidr: '10.10.1.16/30' },
  { deviceId: 'west', interfaceName: 'Fa0/3', ipAddress: '10.10.0.1', subnetMask: '255.255.255.128', networkCidr: '10.10.0.0/25' },
  { deviceId: 'west', interfaceName: 'Fa0/4', ipAddress: '10.10.0.225', subnetMask: '255.255.255.224', networkCidr: '10.10.0.224/27' },



  // East
  { deviceId: 'east', interfaceName: 'Fa0/1', ipAddress: '10.10.1.22', subnetMask: '255.255.255.252', networkCidr: '10.10.1.20/30' },
  { deviceId: 'east', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: 'VLAN 30' },
  { deviceId: 'east', interfaceName: 'Fa0/3', ipAddress: '10.10.1.1', subnetMask: '255.255.255.240', networkCidr: '10.10.1.0/28' },
  { deviceId: 'east', interfaceName: 'Fa0/4', ipAddress: '', subnetMask: '', networkCidr: '10.10.0.192/27' },
  { deviceId: 'east', interfaceName: 'VLAN30', ipAddress: '10.10.0.193', subnetMask: '255.255.255.224', networkCidr: '10.10.0.192/27' },

  // Access switches
  { deviceId: 'sw0', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw0', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw0', interfaceName: 'Fa0/3', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw0', interfaceName: 'Fa0/4', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw0', interfaceName: 'Fa0/5', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw1', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw1', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw1', interfaceName: 'Fa0/3', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw2', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw2', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw5', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw5', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw6', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw6', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw6', interfaceName: 'Fa0/3', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw7', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw7', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw3', interfaceName: 'Fa0/1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw3', interfaceName: 'Fa0/2', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw3', interfaceName: 'Fa0/3', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw3', interfaceName: 'Fa0/4', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'sw3', interfaceName: 'Fa0/5', ipAddress: '', subnetMask: '', networkCidr: '' },
  // Wireless
  { deviceId: 'wlc0', interfaceName: 'Gig1', ipAddress: '10.10.0.190', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26' },
  { deviceId: 'wlc1', interfaceName: 'Gig1', ipAddress: '192.168.13.2', subnetMask: '255.255.255.0', networkCidr: '192.168.13.0/24' },
  { deviceId: 'lwap0', interfaceName: 'Gig0', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'lwap1', interfaceName: 'Gig0', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'ap0', interfaceName: 'Port0', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'ap1', interfaceName: 'Port0', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'wrt0', interfaceName: 'Ethernet1', ipAddress: '', subnetMask: '', networkCidr: '' },
  { deviceId: 'wrt1', interfaceName: 'Ethernet1', ipAddress: '', subnetMask: '', networkCidr: '' },
  // End devices
  { deviceId: 'pc0', interfaceName: 'Fa0', ipAddress: '10.10.0.130', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26' },
  { deviceId: 'pc5', interfaceName: 'Fa0', ipAddress: '10.10.0.132', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26' },
  { deviceId: 'laptop3', interfaceName: 'Fa0', ipAddress: '10.10.0.3', subnetMask: '255.255.255.128', networkCidr: '10.10.0.0/25' },
  { deviceId: 'pc1', interfaceName: 'Fa0', ipAddress: '10.10.0.2', subnetMask: '255.255.255.128', networkCidr: '10.10.0.0/25' },
  { deviceId: 'laptop4', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '255.255.255.224', networkCidr: '10.10.0.224/27' },
  { deviceId: 'laptop5', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '255.255.255.224', networkCidr: '10.10.0.224/27' },
  { deviceId: 'pc3', interfaceName: 'Fa0', ipAddress: '', subnetMask: '255.255.255.224', networkCidr: '10.10.0.192/27' },
  { deviceId: 'pc4', interfaceName: 'Fa0', ipAddress: '10.10.1.2', subnetMask: '255.255.255.240', networkCidr: '10.10.1.0/28' },
  { deviceId: 'pc2', interfaceName: 'Wireless0', ipAddress: '10.10.1.4', subnetMask: '255.255.255.240', networkCidr: '10.10.1.0/28' },
  { deviceId: 'pc2b', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '', networkCidr: '10.10.1.0/28' },
  { deviceId: 'laptop0', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26' },
  { deviceId: 'laptop1', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '', networkCidr: '10.10.0.128/26' },
  { deviceId: 'laptop2', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '', networkCidr: '10.10.0.128/26' },
  { deviceId: 'laptop6', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '', networkCidr: '10.10.0.192/27' },
  { deviceId: 'laptop7', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '', networkCidr: '10.10.0.192/27' },
  { deviceId: 'laptop8', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '255.255.255.0', networkCidr: '192.168.13.0/24' },
  { deviceId: 'laptop9', interfaceName: 'Wireless0', ipAddress: '', subnetMask: '255.255.255.0', networkCidr: '192.168.13.0/24' },
  { deviceId: 'laptop10', interfaceName: 'Fa0', ipAddress: '', subnetMask: '255.255.255.0', networkCidr: '192.168.13.0/24' },
  { deviceId: 'server4', interfaceName: 'Fa0', ipAddress: '203.0.113.2', subnetMask: '255.255.255.0', networkCidr: '203.0.113.0/24' },
];

export const labDepartments = [
  { name: 'Engineering', hostRequirement: 100, reservedCapacity: 0, networkCidr: '10.10.0.0/25', gateway: '10.10.0.1', subnetMask: '255.255.255.128' },
  { name: 'Administration', hostRequirement: 50, reservedCapacity: 0, networkCidr: '10.10.0.128/26', gateway: '10.10.0.129', subnetMask: '255.255.255.192' },
  { name: 'Finance', hostRequirement: 25, reservedCapacity: 0, networkCidr: '10.10.0.192/27', gateway: '10.10.0.193', subnetMask: '255.255.255.224' },
  { name: 'HR', hostRequirement: 20, reservedCapacity: 0, networkCidr: '10.10.0.224/27', gateway: '10.10.0.225', subnetMask: '255.255.255.224' },
  { name: 'IT Support', hostRequirement: 12, reservedCapacity: 0, networkCidr: '10.10.1.0/28', gateway: '10.10.1.1', subnetMask: '255.255.255.240' },
] as const satisfies readonly Department[];

export const labSubnets = labDepartments.map((department) => ({
  name: department.name,
  cidr: department.networkCidr,
  hosts: department.hostRequirement,
  gateway: department.gateway,
}));

// ============================================================================
// DEVICE EXPLANATIONS - Why each device is chosen
// ============================================================================

export const deviceExplanations: Record<string, { purpose: string; whyChosen: string; role: string }> = {
  // Core Infrastructure
  'core': {
    purpose: 'Core distribution switch - central routing hub for all corporate traffic',
    whyChosen: 'Multilayer switch (L3) enables inter-VLAN routing and OSPF participation without a dedicated router. High port density for aggregation.',
    role: 'OSPF Area 0 backbone; connects servers, west, east, and edge'
  },
  'servers': {
    purpose: 'Server farm distribution switch hosting DNS, HTTP, and application servers',
    whyChosen: 'Separates server traffic from user traffic. VLAN 60 isolates services. Dual uplinks to core provide redundancy.',
    role: 'Hosts critical services (DNS, Intranet, Apps); dual-homed to core'
  },
  'west': {
    purpose: 'Distribution switch for Floor 1 (Admin, Engineering, HR)',
    whyChosen: 'Aggregates three departmental access switches. Runs DHCP for three department subnets. Single uplink to core.',
    role: 'Layer 3 gateway for Admin/Eng/HR; DHCP server; OSPF speaker'
  },
  'east': {
    purpose: 'Distribution switch for Floor 2 (Finance, IT Support)',
    whyChosen: 'Aggregates Finance (VLAN 30 across two switches) and IT Support. Runs DHCP for two department subnets.',
    role: 'Layer 3 gateway for Finance/IT; DHCP server; OSPF speaker'
  },
  'edge': {
    purpose: 'Edge router connecting corporate network to ISP',
    whyChosen: 'Only device with serial WAN interface. Performs PAT (NAT overload) for simulated external access. Advertises default route via OSPF.',
    role: 'NAT/PAT gateway; default route origin; ISP peering'
  },
  'isp': {
    purpose: 'Simulated Internet Service Provider router',
    whyChosen: 'Provides WAN connectivity and hosts simulated external services. Runs return route for corporate network.',
    role: 'WAN peer; hosts external server; provides ISP client LAN'
  },

  // Servers
  'server1': {
    purpose: 'DNS server (10.10.1.66) resolving intranet.corporate.test',
    whyChosen: 'Critical infrastructure service. All clients use this for name resolution.',
    role: 'Authoritative DNS for corporate.test zone'
  },
  'server2': {
    purpose: 'HTTP/Intranet server (10.10.1.67) hosting corporate web portal',
    whyChosen: 'Primary business application. Demonstrates DNS → HTTP flow.',
    role: 'Corporate intranet web server'
  },
  'server3': {
    purpose: 'Additional application server (10.10.1.68)',
    whyChosen: 'Represents other corporate services (file, app, database).',
    role: 'Generic application server'
  },
  'server4': {
    purpose: 'External web server (203.0.113.2) simulating Internet destination',
    whyChosen: 'TEST-NET address (RFC 5737) for documentation. Tests NAT and external connectivity.',
    role: 'www.isp.test - external destination for PAT verification'
  },

  // Wireless Controllers & APs
  'wlc0': {
    purpose: 'Corporate Wireless LAN Controller (10.10.0.190) managing Corp-Admin SSID',
    whyChosen: 'Centralized management for LWAP0. Provides CAPWAP tunnel, client authentication, and roaming.',
    role: 'Controls LWAP0; manages Admin wireless clients (Laptop0-2)'
  },
  'wlc1': {
    purpose: 'ISP Wireless LAN Controller (192.168.13.2) managing ISP-Managed SSID',
    whyChosen: 'Separate controller for ISP segment. Demonstrates multi-controller architecture.',
    role: 'Controls LWAP1; manages ISP wireless client (Laptop9)'
  },
  'lwap0': {
    purpose: 'Lightweight Access Point (Corp-Admin SSID) bridged to Administration LAN',
    whyChosen: 'Enterprise-grade AP requiring WLC. No local config - all managed by WLC0.',
    role: 'Wireless access for Admin department; CAPWAP to WLC0'
  },
  'lwap1': {
    purpose: 'Lightweight Access Point (ISP-Managed SSID) in ISP segment',
    whyChosen: 'Demonstrates wireless in ISP-managed space.',
    role: 'Wireless access for ISP client; CAPWAP to WLC1'
  },
  'ap0': {
    purpose: 'Autonomous Access Point (Corp-IT SSID) for IT Support wireless',
    whyChosen: 'Standalone AP (no WLC) for smaller deployment. Simpler configuration.',
    role: 'IT Support wireless (PC2, PC2b); bridges to IT LAN'
  },
  'ap1': {
    purpose: 'Autonomous Access Point (Corp-Finance SSID) for Finance wireless',
    whyChosen: 'Standalone AP for Finance department wireless.',
    role: 'Finance wireless (Laptop6, Laptop7); bridges to Finance VLAN'
  },

  // Wireless Routers (Bridge Mode)
  'wrt0': {
    purpose: 'Wireless Router in bridge mode for HR wireless',
    whyChosen: 'Repurposed SOHO router as AP. DHCP disabled - clients get corporate DHCP from west. Ethernet1 uplink bridges to HR LAN.',
    role: 'HR wireless bridge (Laptop4, Laptop5); no NAT'
  },
  'wrt1': {
    purpose: 'Wireless Router in bridge mode for ISP wireless',
    whyChosen: 'Same bridge concept in ISP segment. Clients get ISP DHCP (192.168.13.0/24).',
    role: 'ISP wireless bridge (Laptop8); no NAT'
  },

  // Access Switches
  'sw0': { purpose: 'Administration access switch', whyChosen: '2960 for end-user ports. Connects PCs, WLC0, LWAP0.', role: 'Administration LAN access layer' },
  'sw1': { purpose: 'Engineering access switch', whyChosen: '2960 for Engineering wired endpoints.', role: 'Engineering LAN access layer' },
  'sw2': { purpose: 'HR access switch', whyChosen: '2960 connecting WRT0 (HR wireless bridge).', role: 'HR LAN access layer' },
  'sw5': { purpose: 'Finance access switch (primary)', whyChosen: '2960 for Finance wired PC.', role: 'Finance VLAN 30 access layer' },
  'sw7': { purpose: 'Finance access switch (secondary)', whyChosen: '2960 for Finance wireless AP.', role: 'Finance VLAN 30 access layer (extended)' },
  'sw6': { purpose: 'IT Support access switch', whyChosen: '2960 for IT wired PC and wireless AP.', role: 'IT Support LAN access layer' },
  'sw3': { purpose: 'ISP client LAN switch', whyChosen: '2960 in ISP segment connecting ISP router, WLC1, WRT1, LWAP1.', role: 'ISP 192.168.13.0/24 access layer' },

  // End Devices
  'pc0': { purpose: 'Admin wired PC (static 10.10.0.130)', whyChosen: 'Represents stationary admin workstation.', role: 'Admin user endpoint' },
  'pc5': { purpose: 'Admin wired PC (static 10.10.0.132)', whyChosen: 'Second admin workstation.', role: 'Admin user endpoint' },
  'laptop0': { purpose: 'Admin wireless DHCP client', whyChosen: 'Demonstrates wireless DHCP and mobility.', role: 'Admin wireless client' },
  'laptop1': { purpose: 'Admin wireless (DHCP)', whyChosen: 'Additional wireless client.', role: 'Admin wireless client' },
  'laptop2': { purpose: 'Admin wireless (DHCP)', whyChosen: 'Additional wireless client.', role: 'Admin wireless client' },
  'laptop3': { purpose: 'Engineering laptop (static 10.10.0.3)', whyChosen: 'Engineering wired endpoint.', role: 'Engineering user endpoint' },
  'pc1': { purpose: 'Engineering PC (static 10.10.0.2)', whyChosen: 'Engineering wired workstation.', role: 'Engineering user endpoint' },
  'pc3': { purpose: 'Finance PC (DHCP; current lease varies)', whyChosen: 'Primary Finance client for testing.', role: 'Finance user endpoint' },
  'pc4': { purpose: 'IT Support PC (static 10.10.1.2)', whyChosen: 'IT wired workstation.', role: 'IT user endpoint' },
  'pc2': { purpose: 'IT wireless PC (static 10.10.1.4)', whyChosen: 'IT wireless via autonomous AP.', role: 'IT wireless client' },
  'pc2b': { purpose: 'IT wireless client (DHCP)', whyChosen: 'Additional IT wireless.', role: 'IT wireless client' },
  'laptop4': { purpose: 'HR wireless DHCP client', whyChosen: 'HR wireless via WRT0 bridge.', role: 'HR wireless client' },
  'laptop5': { purpose: 'HR wireless DHCP client', whyChosen: 'Second HR wireless client.', role: 'HR wireless client' },
  'laptop6': { purpose: 'Finance wireless (DHCP)', whyChosen: 'Finance wireless via AP1.', role: 'Finance wireless client' },
  'laptop7': { purpose: 'Finance wireless (DHCP)', whyChosen: 'Second Finance wireless.', role: 'Finance wireless client' },
  'laptop8': { purpose: 'ISP wireless DHCP client via WRT1', whyChosen: 'ISP segment wireless client.', role: 'ISP wireless client' },
  'laptop9': { purpose: 'ISP wireless via LWAP1 (DHCP)', whyChosen: 'ISP managed wireless client.', role: 'ISP managed wireless client' },
  'laptop10': { purpose: 'ISP wired client (DHCP)', whyChosen: 'ISP wired endpoint for testing.', role: 'ISP wired client' },
};

// ============================================================================
// ARCHITECTURE DOCUMENTATION
// ============================================================================

// ============================================================================
// VLSM CALCULATION (Client-side)
// ============================================================================

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numberToIp(num: number): string {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
}

function calculatePrefix(hostCount: number): number {
  const needed = hostCount + 2; // network + broadcast
  return 32 - Math.ceil(Math.log2(needed));
}

function alignNetwork(ipNum: number, prefix: number): number {
  const blockSize = 2 ** (32 - prefix);
  return Math.floor(ipNum / blockSize) * blockSize;
}

export function calculateVLSM(parentCidr: string, departments: VLSMInput[]): VLSMCalculationResponse {
  const errors: string[] = [];
  const [parentIp, parentPrefixStr] = parentCidr.split('/');
  const parentPrefix = Number(parentPrefixStr);
  const octets = parentIp.split('.');
  if (parentCidr.split('/').length !== 2 || !/^\d+$/.test(parentPrefixStr ?? '') ||
      !Number.isInteger(parentPrefix) || parentPrefix < 0 || parentPrefix > 32 ||
      octets.length !== 4 || octets.some(o => !/^\d{1,3}$/.test(o) || Number(o) > 255)) {
    errors.push('Enter a valid IPv4 network and prefix, such as 10.10.0.0/23.');
  }
  for (const department of departments) {
    const reserved = department.reservedCapacity ?? 0;
    if (!Number.isSafeInteger(department.hostCount) || department.hostCount < 1 ||
        !Number.isSafeInteger(reserved) || reserved < 0 || department.hostCount + reserved > 2 ** 32 - 2) {
      errors.push(`${department.name}: host count must be a positive integer and reserved capacity a non-negative integer.`);
    }
  }
  if (errors.length) return { parentNetwork: parentCidr, parentPrefix, subnets: [], remainingAddressSpace: [], isValid: false, errors };
  const parentNetNum = alignNetwork(ipToNumber(parentIp), parentPrefix);
  const parentBroadcast = parentNetNum + 2 ** (32 - parentPrefix) - 1;

  // Sort by total required (hosts + reserved) descending
  const sorted = [...departments].map(d => ({
    ...d,
    totalRequired: d.hostCount + (d.reservedCapacity ?? 0)
  })).sort((a, b) => b.totalRequired - a.totalRequired);

  const subnets: VLSMResult[] = [];
  let currentNetNum = parentNetNum;

  for (const dept of sorted) {
    const prefix = calculatePrefix(dept.totalRequired);
    const blockSize = 2 ** (32 - prefix);
    
    // Align
    currentNetNum = alignNetwork(currentNetNum, prefix);
    
    // Check bounds
    const broadcast = currentNetNum + blockSize - 1;
    if (broadcast > parentBroadcast) {
      errors.push(`Insufficient address space for ${dept.name} (needs /${prefix})`);
      continue;
    }

    const networkAddress = numberToIp(currentNetNum);
    const gateway = numberToIp(currentNetNum + 1);
    const firstUsable = gateway;
    const lastUsable = numberToIp(broadcast - 1);
    const broadcastAddr = numberToIp(broadcast);
    const subnetMask = numberToIp(2 ** 32 - blockSize);
    const wildcardMask = numberToIp(blockSize - 1);
    const totalAddresses = blockSize;
    const usableAddresses = blockSize - 2;
    const utilizationPercent = Math.round((dept.totalRequired / usableAddresses) * 100);

    subnets.push({
      name: dept.name,
      hostCount: dept.hostCount,
      networkAddress,
      prefix,
      subnetMask,
      wildcardMask,
      gateway,
      firstUsable,
      lastUsable,
      broadcast: broadcastAddr,
      totalAddresses,
      usableAddresses,
      reservedCapacity: dept.reservedCapacity,
      utilizationPercent,
    });

    currentNetNum = broadcast + 1;
  }

  // Calculate remaining space
  const remaining: string[] = [];
  let scanNum = currentNetNum;
  while (scanNum <= parentBroadcast) {
    let prefix = 32 - Math.floor(Math.log2(parentBroadcast - scanNum + 1));
    while (alignNetwork(scanNum, prefix) !== scanNum) prefix++;
    remaining.push(`${numberToIp(scanNum)}/${prefix}`);
    scanNum += 2 ** (32 - prefix);
  }

  return {
    parentNetwork: parentCidr,
    parentPrefix,
    subnets,
    remainingAddressSpace: remaining,
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// DEVICE POSITIONS (for React Flow topology)
// ============================================================================

export const devicePositions: Record<string, { x: number; y: number }> = {
  // Server row (left)
  server1: { x: 40, y: 50 },
  server2: { x: 40, y: 150 },
  server3: { x: 40, y: 250 },
  servers: { x: 240, y: 150 },
  
  // Core row (center)
  core: { x: 620, y: 260 },
  edge: { x: 620, y: 70 },
  
  // ISP row (right)
  isp: { x: 900, y: 70 },
  server4: { x: 1150, y: 0 },
  sw3: { x: 1150, y: 140 },
  laptop10: { x: 1370, y: 50 },
  wlc1: { x: 1370, y: 150 },
  lwap1: { x: 1140, y: 300 },
  laptop9: { x: 1140, y: 410 },
  wrt1: { x: 1530, y: 250 },
  laptop8: { x: 1530, y: 380 },
  
  // West distribution (lower left)
  west: { x: 360, y: 410 },
  sw0: { x: 150, y: 550 },
  lwap0: { x: 0, y: 450 },
  wlc0: { x: 0, y: 670 },
  laptop0: { x: -190, y: 350 },
  laptop1: { x: -190, y: 460 },
  laptop2: { x: -190, y: 570 },
  pc0: { x: 150, y: 770 },
  pc5: { x: -10, y: 810 },
  sw1: { x: 360, y: 610 },
  laptop3: { x: 260, y: 850 },
  pc1: { x: 420, y: 850 },
  sw2: { x: 570, y: 610 },
  wrt0: { x: 600, y: 740 },
  laptop4: { x: 570, y: 950 },
  laptop5: { x: 730, y: 950 },
  
  // East distribution (lower right)
  east: { x: 870, y: 510 },
  sw5: { x: 800, y: 720 },
  pc3: { x: 900, y: 910 },
  sw6: { x: 1050, y: 640 },
  ap0: { x: 1130, y: 790 },
  pc4: { x: 1000, y: 950 },
  pc2: { x: 1170, y: 1000 },
  pc2b: { x: 1340, y: 1000 },
  sw7: { x: 1380, y: 580 },
  ap1: { x: 1480, y: 720 },
  laptop6: { x: 1600, y: 900 },
  laptop7: { x: 1430, y: 900 },
};

// ============================================================================
// PRESENTATION DEMO STEPS
// ============================================================================

export interface DemoStep {
  title: string;
  protocol: string;
  explanation: string;
  from?: string;
  to?: string;
  failedLink?: string;
  highlights?: string[];
}

export const demoSteps: DemoStep[] = [
  { title: 'One address block. Five departments.', protocol: 'VLSM', explanation: 'Split 10.10.0.0/23 largest-first: /25 for 100 Engineering hosts, /26 for 50 Admin hosts, then /27, /27 and /28. Routed links use /30.' },
  { title: 'The client asks for an address', protocol: 'DHCP', from: 'laptop0', to: 'west', explanation: 'Illustrated DHCP Discover / Request path: Laptop0 joins Corp-Admin through LWAP0 and Switch0 to the west DHCP server. Broadcast fan-out is simplified.' },
  { title: 'DHCP returns the client configuration', protocol: 'DHCP', from: 'west', to: 'laptop0', explanation: 'Offer / ACK: Laptop0 receives an address from 10.10.0.128/26, gateway 10.10.0.129 and DNS 10.10.1.66. Read the current DHCP lease in Packet Tracer.' },
  { title: 'The corporate backbone shares routes', protocol: 'OSPF', highlights: ['core-west', 'core-east', 'core-edge', 'server-primary', 'server-backup'], explanation: 'OSPF process 1, area 0 connects the four multilayer switches and edge router. Two routed links connect the server distribution switch. The edge advertises the ISP default route.' },
  { title: 'Resolve the intranet name', protocol: 'DNS', from: 'laptop0', to: 'server1', explanation: 'A DNS query for intranet.corporate.test follows the Admin → west → core → servers path to DNS server 10.10.1.66.' },
  { title: 'DNS returns the web server address', protocol: 'DNS', from: 'server1', to: 'laptop0', explanation: 'The DNS response maps intranet.corporate.test to 10.10.1.67. The return path reaches the same wireless client.' },
  { title: 'Open the corporate intranet', protocol: 'HTTP', from: 'laptop0', to: 'server2', explanation: 'With the name resolved, the browser can contact server2 at 10.10.1.67. Moving dots illustrate the request path; TCP handshakes are omitted.' },
  { title: 'Reach the simulated ISP', protocol: 'ICMP', from: 'pc3', to: 'server4', explanation: 'Finance PC3 uses east → core → edge → ISP to reach 203.0.113.2. The updated design uses edge PAT address 198.51.100.1 and exempts routed ISP-client traffic. These TEST-NET addresses represent the public side in a lab; they are not real Internet allocations.' },
  { title: 'A server link goes offline', protocol: 'FAILOVER', from: 'pc3', to: 'server2', failedLink: 'server-primary', explanation: 'Core Fa0/2 is taken offline in this illustration. After route recomputation, the packet uses core Fa0/3 and the second server link. This failure was tested successfully in Packet Tracer.' },
  { title: 'Restore the link and verify the return path', protocol: 'RECOVERY', from: 'server2', to: 'pc3', explanation: 'Both server links are available again. In Packet Tracer the restored link returned up and its OSPF neighbor returned to FULL. The browser does not emulate convergence timing or equal-cost load balancing.' },
];

export function stepRoute(step: DemoStep): string[] {
  return step.from && step.to ? findPath(labLinks, step.from, step.to, step.failedLink) ?? [] : [];
}

export function stepTicks(step: DemoStep): number {
  return Math.max(5, (stepRoute(step)?.length ?? 0) + 2);
}

export const demoTickMs = 900;
