export const initialDesign = {
  name: 'CorporateNet v1.0',
  description: 'Scalable corporate network with VLSM and OSPF - 5 departments across 3 routers',
  version: '1.0.0',
  parentCidr: '10.10.0.0/23',
  departments: [
    { name: 'Engineering', hostRequirement: 100 },
    { name: 'Administration', hostRequirement: 50 },
    { name: 'Finance', hostRequirement: 25 },
    { name: 'HR', hostRequirement: 20 },
    { name: 'IT Support', hostRequirement: 12 },
  ],
  devices: [
    { hostname: 'R1', type: 'router' as const, model: 'Cisco 2911', managementIp: '10.10.0.1' },
    { hostname: 'R2', type: 'router' as const, model: 'Cisco 2911', managementIp: '10.10.0.193' },
    { hostname: 'R3', type: 'router' as const, model: 'Cisco 2911', managementIp: '10.10.1.1' },
    { hostname: 'SW-Eng', type: 'switch' as const, model: 'Cisco 2960' },
    { hostname: 'SW-Admin', type: 'switch' as const, model: 'Cisco 2960' },
    { hostname: 'SW-Fin', type: 'switch' as const, model: 'Cisco 2960' },
    { hostname: 'SW-HR', type: 'switch' as const, model: 'Cisco 2960' },
    { hostname: 'SW-IT', type: 'switch' as const, model: 'Cisco 2960' },
  ],
  interfaces: [
    { deviceId: 'R1', interfaceName: 'G0/0', ipAddress: '10.10.0.1', subnetMask: '255.255.255.128', networkCidr: '10.10.0.0/25', passiveOspf: false },
    { deviceId: 'R1', interfaceName: 'G0/1', ipAddress: '10.10.0.129', subnetMask: '255.255.255.192', networkCidr: '10.10.0.128/26', passiveOspf: false },
    { deviceId: 'R1', interfaceName: 'S0/0/0', ipAddress: '10.10.1.17', subnetMask: '255.255.255.252', networkCidr: '10.10.1.16/30', passiveOspf: false },
    { deviceId: 'R2', interfaceName: 'G0/0', ipAddress: '10.10.0.193', subnetMask: '255.255.255.224', networkCidr: '10.10.0.192/27', passiveOspf: false },
    { deviceId: 'R2', interfaceName: 'G0/1', ipAddress: '10.10.0.225', subnetMask: '255.255.255.224', networkCidr: '10.10.0.224/27', passiveOspf: false },
    { deviceId: 'R2', interfaceName: 'S0/0/0', ipAddress: '10.10.1.18', subnetMask: '255.255.255.252', networkCidr: '10.10.1.16/30', passiveOspf: false },
    { deviceId: 'R2', interfaceName: 'S0/0/1', ipAddress: '10.10.1.21', subnetMask: '255.255.255.252', networkCidr: '10.10.1.20/30', passiveOspf: false },
    { deviceId: 'R3', interfaceName: 'G0/0', ipAddress: '10.10.1.1', subnetMask: '255.255.255.240', networkCidr: '10.10.1.0/28', passiveOspf: false },
    { deviceId: 'R3', interfaceName: 'S0/0/0', ipAddress: '10.10.1.22', subnetMask: '255.255.255.252', networkCidr: '10.10.1.20/30', passiveOspf: false },
  ],
  links: [
    { sourceDeviceId: 'R1', sourceInterface: 'G0/0', targetDeviceId: 'SW-Eng', targetInterface: 'G0/1', networkCidr: '10.10.0.0/25', medium: 'ethernet' as const },
    { sourceDeviceId: 'R1', sourceInterface: 'G0/1', targetDeviceId: 'SW-Admin', targetInterface: 'G0/1', networkCidr: '10.10.0.128/26', medium: 'ethernet' as const },
    { sourceDeviceId: 'R1', sourceInterface: 'S0/0/0', targetDeviceId: 'R2', targetInterface: 'S0/0/0', networkCidr: '10.10.1.16/30', medium: 'serial' as const },
    { sourceDeviceId: 'R2', sourceInterface: 'G0/0', targetDeviceId: 'SW-Fin', targetInterface: 'G0/1', networkCidr: '10.10.0.192/27', medium: 'ethernet' as const },
    { sourceDeviceId: 'R2', sourceInterface: 'G0/1', targetDeviceId: 'SW-HR', targetInterface: 'G0/1', networkCidr: '10.10.0.224/27', medium: 'ethernet' as const },
    { sourceDeviceId: 'R2', sourceInterface: 'S0/0/1', targetDeviceId: 'R3', targetInterface: 'S0/0/0', networkCidr: '10.10.1.20/30', medium: 'serial' as const },
    { sourceDeviceId: 'R3', sourceInterface: 'G0/0', targetDeviceId: 'SW-IT', targetInterface: 'G0/1', networkCidr: '10.10.1.0/28', medium: 'ethernet' as const },
  ],
  ospf: {
    processId: 1,
    areas: [0],
    routerIds: { R1: '1.1.1.1', R2: '2.2.2.2', R3: '3.3.3.3' },
  },
};



