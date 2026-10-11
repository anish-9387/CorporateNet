export interface NetworkDesign {
  _id: string;
  name: string;
  description?: string;
  version: string;
  parentCidr: string;
  departments: Department[];
  devices: Device[];
  interfaces: NetworkInterface[];
  links: Link[];
  ospf: OspfConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  name: string;
  hostRequirement: number;
  networkCidr: string;
  gateway: string;
  subnetMask: string;
}

export interface Device {
  deviceId: string;
  hostname: string;
  type: 'router' | 'switch' | 'pc' | 'server';
  model?: string;
  managementIp?: string;
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
  medium: 'ethernet' | 'serial' | 'fiber';
}

export interface OspfConfig {
  processId: number;
  areas: number[];
  routerIds: Record<string, string>;
}

export interface TestRun {
  _id: string;
  designId: string;
  testType: string;
  source: string;
  destination: string;
  status: TestStatus;
  observedOutput?: string;
  evidenceType: EvidenceType;
  notes?: string;
  testedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TestStatus = 'passed' | 'failed' | 'not-run' | 'not-applicable';
export type EvidenceType = 'packet-tracer-cli' | 'packet-tracer-ping' | 'manual' | 'simulated';

export interface Scenario {
  _id: string;
  designId: string;
  name: string;
  description?: string;
  failedLinkId: string;
  affectedNetworks: string[];
  expectedBehavior: string;
  observedBehavior?: string;
  isEducationalSimulation: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface TopologyNode {
  id: string;
  type: string;
  label: string;
  data: Device;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  data: Link;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface RoutingInfo {
  ospf: OspfConfig;
  interfaces: NetworkInterface[];
  routes: RouteInfo[];
}

export interface RouteInfo {
  network: string;
  gateway: string;
  interface?: string;
}

export interface ConnectivityMatrix {
  [source: string]: {
    [destination: string]: TestStatus;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    source: string;
    verified: boolean;
    timestamp: string;
    total?: number;
  };
}

export interface ReportData {
  design: NetworkDesign;
  tests: TestRun[];
  scenarios: Scenario[];
  generatedAt: string;
  version: string;
}