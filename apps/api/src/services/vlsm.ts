export interface SubnetInput {
  name: string;
  hostCount: number;
  reservedCapacity?: number;
}

export interface SubnetResult {
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

export interface VLSMCalculationResult {
  parentNetwork: string;
  parentPrefix: number;
  subnets: SubnetResult[];
  remainingAddressSpace: string[];
  isValid: boolean;
  errors: string[];
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

function cidrToMask(prefix: number): string {
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return numberToIp(mask);
}

function cidrToWildcard(prefix: number): string {
  const wildcard = prefix === 32 ? 0 : (~cidrToMask(prefix).split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0)) >>> 0;
  return numberToIp(wildcard);
}

function parseCidr(cidr: string): { address: number; prefix: number } {
  const [ip, prefixStr] = cidr.split('/');
  if (!ip || !prefixStr) {
    throw new Error('Invalid CIDR format');
  }
  const prefix = parseInt(prefixStr, 10);
  if (prefix < 0 || prefix > 32) {
    throw new Error('Prefix must be between 0 and 32');
  }
  return { address: ipToNumber(ip), prefix };
}

function calculateRequiredPrefix(hostCount: number): number {
  const required = hostCount + 2;
  let hostBits = 0;
  while ((1 << hostBits) < required) {
    hostBits++;
  }
  return 32 - hostBits;
}

function getNetworkAddress(address: number, prefix: number): number {
  if (prefix === 0) return 0;
  const mask = (~0 << (32 - prefix)) >>> 0;
  return address & mask;
}

function getBroadcastAddress(networkAddress: number, prefix: number): number {
  if (prefix === 32) return networkAddress;
  const hostMask = (1 << (32 - prefix)) - 1;
  return networkAddress | hostMask;
}

export function calculateVLSM(
  parentCidr: string,
  inputs: SubnetInput[]
): VLSMCalculationResult {
  const errors: string[] = [];
  let parentNetwork: number;
  let parentPrefix: number;

  try {
    const parsed = parseCidr(parentCidr);
    parentNetwork = getNetworkAddress(parsed.address, parsed.prefix);
    parentPrefix = parsed.prefix;
  } catch (error) {
    errors.push(`Invalid parent CIDR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      parentNetwork: parentCidr,
      parentPrefix: 0,
      subnets: [],
      remainingAddressSpace: [],
      isValid: false,
      errors,
    };
  }

  const parentBroadcast = getBroadcastAddress(parentNetwork, parentPrefix);
  const totalHostBits = 32 - parentPrefix;
  const maxAddresses = 1 << totalHostBits;

  const sortedInputs = [...inputs].sort((a, b) => {
    const aTotal = a.hostCount + (a.reservedCapacity ?? 0);
    const bTotal = b.hostCount + (b.reservedCapacity ?? 0);
    return bTotal - aTotal;
  });

  const results: SubnetResult[] = [];
  let currentAddress = parentNetwork;
  let usedAddresses = 0;

  for (const input of sortedInputs) {
    const totalRequired = input.hostCount + (input.reservedCapacity ?? 0) + 2;
    const prefix = calculateRequiredPrefix(totalRequired - 2);
    const subnetSize = 1 << (32 - prefix);

    const networkAddress = getNetworkAddress(currentAddress, prefix);

    if (networkAddress < parentNetwork || networkAddress > parentBroadcast) {
      errors.push(`Subnet ${input.name} exceeds parent network boundary`);
      continue;
    }

    const broadcast = getBroadcastAddress(networkAddress, prefix);
    if (broadcast > parentBroadcast) {
      errors.push(`Subnet ${input.name} exceeds parent network boundary`);
      continue;
    }

    for (const existing of results) {
      const existingNet = ipToNumber(existing.networkAddress);
      const existingPrefix = existing.prefix;
      const existingBroadcast = getBroadcastAddress(existingNet, existingPrefix);
      if (
        (networkAddress >= existingNet && networkAddress <= existingBroadcast) ||
        (broadcast >= existingNet && broadcast <= existingBroadcast)
      ) {
        errors.push(`Subnet ${input.name} overlaps with ${existing.name}`);
        break;
      }
    }

    const firstUsable = networkAddress + 1;
    const lastUsable = broadcast - 1;
    const usableAddresses = (1 << (32 - prefix)) - 2;
    const utilization = ((input.hostCount / usableAddresses) * 100);

    results.push({
      name: input.name,
      hostCount: input.hostCount,
      networkAddress: numberToIp(networkAddress),
      prefix,
      subnetMask: cidrToMask(prefix),
      wildcardMask: cidrToWildcard(prefix),
      gateway: numberToIp(firstUsable),
      firstUsable: numberToIp(firstUsable),
      lastUsable: numberToIp(lastUsable),
      broadcast: numberToIp(broadcast),
      totalAddresses: 1 << (32 - prefix),
      usableAddresses,
      reservedCapacity: input.reservedCapacity,
      utilizationPercent: Math.round(utilization * 100) / 100,
    });

    currentAddress = broadcast + 1;
    usedAddresses += subnetSize;
  }

  const remaining: string[] = [];
  let remainingStart = currentAddress;
  while (remainingStart <= parentBroadcast) {
    const remainingPrefix = calculateRequiredPrefix(parentBroadcast - remainingStart + 1);
    const remainingSize = 1 << (32 - remainingPrefix);
    if (remainingStart + remainingSize - 1 > parentBroadcast) break;
    remaining.push(`${numberToIp(remainingStart)}/${remainingPrefix}`);
    remainingStart += remainingSize;
  }

  return {
    parentNetwork: numberToIp(parentNetwork),
    parentPrefix,
    subnets: results,
    remainingAddressSpace: remaining,
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSubnetAllocation(
  parentCidr: string,
  subnets: SubnetResult[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  let parentNetwork: number;
  let parentPrefix: number;

  try {
    const parsed = parseCidr(parentCidr);
    parentNetwork = getNetworkAddress(parsed.address, parsed.prefix);
    parentPrefix = parsed.prefix;
  } catch (error) {
    errors.push(`Invalid parent CIDR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }

  const parentBroadcast = getBroadcastAddress(parentNetwork, parentPrefix);

  for (const subnet of subnets) {
    const networkAddr = ipToNumber(subnet.networkAddress);
    const broadcast = getBroadcastAddress(networkAddr, subnet.prefix);

    if (networkAddr < parentNetwork || broadcast > parentBroadcast) {
      errors.push(`Subnet ${subnet.name} (${subnet.networkAddress}/${subnet.prefix}) exceeds parent boundary`);
    }

    for (const other of subnets) {
      if (other.name === subnet.name) continue;
      const otherNet = ipToNumber(other.networkAddress);
      const otherBroadcast = getBroadcastAddress(otherNet, other.prefix);
      if (
        (networkAddr >= otherNet && networkAddr <= otherBroadcast) ||
        (broadcast >= otherNet && broadcast <= otherBroadcast)
      ) {
        errors.push(`Subnet ${subnet.name} overlaps with ${other.name}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}