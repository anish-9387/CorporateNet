import { describe, it, expect } from 'vitest';
import { calculateVLSM, validateSubnetAllocation } from '../services/vlsm';

describe('VLSM Calculation', () => {
  it('handles high IPv4 addresses and the full /0 space without signed overflow', () => {
    const high = calculateVLSM('192.168.1.0/24', [{ name: 'LAN', hostCount: 100 }]);
    expect(high.isValid).toBe(true);
    expect(high.subnets[0].broadcast).toBe('192.168.1.127');
    expect(high.remainingAddressSpace).toEqual(['192.168.1.128/25']);
    const full = calculateVLSM('0.0.0.0/0', [{ name: 'All', hostCount: 2 ** 32 - 2 }]);
    expect(full.isValid).toBe(true);
    expect(full.subnets[0].totalAddresses).toBe(2 ** 32);
    expect(full.subnets[0].broadcast).toBe('255.255.255.255');
  });

  it('decomposes every remaining address into aligned CIDR blocks', () => {
    const result = calculateVLSM('10.0.0.0/24', [{ name: 'LAN', hostCount: 10 }]);
    expect(result.remainingAddressSpace).toEqual(['10.0.0.16/28', '10.0.0.32/27', '10.0.0.64/26', '10.0.0.128/25']);
  });

  it('rejects malformed CIDRs, duplicate names, and unsafe host counts', () => {
    for (const cidr of ['999.1.1.0/24', '10.0.0.0/33', '10.0.0.0/2x', '10.0.0.0/24/1']) {
      expect(calculateVLSM(cidr, [{ name: 'LAN', hostCount: 10 }]).isValid).toBe(false);
    }
    for (const hostCount of [-1, 0, Infinity, 2 ** 32, 1.5]) {
      expect(calculateVLSM('0.0.0.0/0', [{ name: 'LAN', hostCount }]).isValid).toBe(false);
    }
    expect(calculateVLSM('10.0.0.0/24', [{ name: 'A', hostCount: 10 }, { name: 'A', hostCount: 10 }]).isValid).toBe(false);
  });
  it('calculates correct subnets for CorporateNet design', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Engineering', hostCount: 100 },
      { name: 'Administration', hostCount: 50 },
      { name: 'Finance', hostCount: 25 },
      { name: 'HR', hostCount: 20 },
      { name: 'IT Support', hostCount: 12 },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.subnets).toHaveLength(5);

    const eng = result.subnets.find((s) => s.name === 'Engineering');
    expect(eng?.prefix).toBe(25);
    expect(eng?.networkAddress).toBe('10.10.0.0');
    expect(eng?.gateway).toBe('10.10.0.1');
    expect(eng?.usableAddresses).toBe(126);

    const admin = result.subnets.find((s) => s.name === 'Administration');
    expect(admin?.prefix).toBe(26);
    expect(admin?.networkAddress).toBe('10.10.0.128');

    const finance = result.subnets.find((s) => s.name === 'Finance');
    expect(finance?.prefix).toBe(27);
    expect(finance?.networkAddress).toBe('10.10.0.192');

    const hr = result.subnets.find((s) => s.name === 'HR');
    expect(hr?.prefix).toBe(27);
    expect(hr?.networkAddress).toBe('10.10.0.224');

    const it = result.subnets.find((s) => s.name === 'IT Support');
    expect(it?.prefix).toBe(28);
    expect(it?.networkAddress).toBe('10.10.1.0');
  });

  it('sorts subnets largest first', () => {
    const result = calculateVLSM('192.168.0.0/24', [
      { name: 'Small', hostCount: 10 },
      { name: 'Large', hostCount: 100 },
      { name: 'Medium', hostCount: 50 },
    ]);

    expect(result.subnets[0].name).toBe('Large');
    expect(result.subnets[1].name).toBe('Medium');
    expect(result.subnets[2].name).toBe('Small');
  });

  it('rejects exhausted address space', () => {
    const result = calculateVLSM('10.0.0.0/24', [
      { name: 'A', hostCount: 50 },
      { name: 'B', hostCount: 50 },
      { name: 'C', hostCount: 50 },
      { name: 'D', hostCount: 50 },
      { name: 'E', hostCount: 50 },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('boundary'))).toBe(true);
  });

  it('detects out of bounds error', () => {
    const result = calculateVLSM('10.0.0.0/24', [
      { name: 'A', hostCount: 255 },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('boundary'))).toBe(true);
  });

  it('calculates wildcard mask correctly', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Test', hostCount: 100 },
    ]);

    expect(result.subnets[0].wildcardMask).toBe('0.0.0.127');
  });

  it('calculates utilization percentage', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Test', hostCount: 63 },
    ]);

    expect(result.subnets[0].utilizationPercent).toBe(50);
  });

  it('handles reserved capacity', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Test', hostCount: 50, reservedCapacity: 10 },
    ]);

    expect(result.subnets[0].reservedCapacity).toBe(10);
    expect(result.subnets[0].prefix).toBe(26);
  });

  it('validates correct allocation', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Engineering', hostCount: 100 },
      { name: 'Administration', hostCount: 50 },
    ]);

    const validation = validateSubnetAllocation('10.10.0.0/23', result.subnets);
    expect(validation.isValid).toBe(true);
  });

  it('rejects invalid CIDR', () => {
    const result = calculateVLSM('invalid', [
      { name: 'Test', hostCount: 10 },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
