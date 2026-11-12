import { describe, expect, it } from 'vitest';
import { calculateVLSM } from '@/data/labData';

describe('calculateVLSM', () => {
  it('allocates the corporate departments largest-first without overlap', () => {
    const result = calculateVLSM('10.10.0.0/23', [
      { name: 'Engineering', hostCount: 100 },
      { name: 'Administration', hostCount: 50 },
      { name: 'Finance', hostCount: 25 },
      { name: 'HR', hostCount: 20 },
      { name: 'IT Support', hostCount: 12 },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.subnets.map(({ name, networkAddress, prefix }) => `${name}:${networkAddress}/${prefix}`)).toEqual([
      'Engineering:10.10.0.0/25',
      'Administration:10.10.0.128/26',
      'Finance:10.10.0.192/27',
      'HR:10.10.0.224/27',
      'IT Support:10.10.1.0/28',
    ]);
  });

  it('rejects invalid CIDR and insufficient address space', () => {
    expect(calculateVLSM('invalid', [{ name: 'A', hostCount: 1 }]).isValid).toBe(false);
    expect(calculateVLSM('10.0.0.0/30', [{ name: 'A', hostCount: 10 }]).isValid).toBe(false);
  });

  it('lists every remaining block and handles unsigned IPv4 addresses', () => {
    const result = calculateVLSM('192.168.1.0/24', [{ name: 'A', hostCount: 100 }]);
    expect(result.isValid).toBe(true);
    expect(result.subnets[0].networkAddress).toBe('192.168.1.0');
    expect(result.remainingAddressSpace).toEqual(['192.168.1.128/25']);
    expect(calculateVLSM('10.0.0.0/24', [{ name: 'A', hostCount: 10 }]).remainingAddressSpace).toEqual([
      '10.0.0.16/28', '10.0.0.32/27', '10.0.0.64/26', '10.0.0.128/25',
    ]);
    expect(calculateVLSM('0.0.0.0/0', [{ name: 'A', hostCount: 2 ** 32 - 2 }]).subnets[0].prefix).toBe(0);
  });

  it('rejects malformed addresses, prefixes and host counts', () => {
    for (const cidr of ['300.1.1.0/24', '10.0.0.0/33', '10.0.0.0/-1', '10.0.0.0/24x', '10.0.0/24', '10.0.0.0/24/1']) {
      expect(calculateVLSM(cidr, [{ name: 'A', hostCount: 10 }]).isValid).toBe(false);
    }
    for (const hostCount of [-1, 0, 1.5, NaN, Infinity]) {
      expect(calculateVLSM('10.0.0.0/24', [{ name: 'A', hostCount }]).isValid).toBe(false);
    }
    expect(calculateVLSM('10.0.0.0/24', [{ name: 'A', hostCount: 1, reservedCapacity: -1 }]).isValid).toBe(false);
  });
});
