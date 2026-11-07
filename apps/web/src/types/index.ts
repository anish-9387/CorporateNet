export interface Department {
  name: string;
  hostRequirement: number;
  reservedCapacity?: number;
  networkCidr: string;
  gateway: string;
  subnetMask: string;
}

export interface Device {
  deviceId: string;
  hostname: string;
  type: 'router' | 'switch' | 'pc' | 'server' | 'laptop' | 'wireless' | 'controller';
  model?: string;
  managementIp?: string;
  description?: string;
}

export interface NetworkInterface {
  deviceId: string;
  interfaceName: string;
  ipAddress?: string;
  subnetMask?: string;
  networkCidr?: string;
  passiveOspf?: boolean;
}

export interface Link {
  linkId: string;
  sourceDeviceId: string;
  sourceInterface: string;
  targetDeviceId: string;
  targetInterface: string;
  networkCidr: string;
  medium: 'ethernet' | 'serial' | 'fiber' | 'wireless';
}

export interface OspfConfig {
  processId: number;
  areas: number[];
  routerIds: Record<string, string>;
}

export interface VLSMInput {
  name: string;
  hostCount: number;
  reservedCapacity?: number;
}

export interface VLSMResult {
  name: string;
  hostCount: number;
  networkAddress: string;
  prefix: number;
  subnetMask: string;
  wildcardMask: string;
  gateway: string;
  firstUsable: string;
  lastUsable: string;
  broadcast: string;
  totalAddresses: number;
  usableAddresses: number;
  reservedCapacity?: number;
  utilizationPercent: number;
}

export interface VLSMCalculationResponse {
  parentNetwork: string;
  parentPrefix: number;
  subnets: VLSMResult[];
  remainingAddressSpace: string[];
  isValid: boolean;
  errors: string[];
}

