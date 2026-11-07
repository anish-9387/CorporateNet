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
});
