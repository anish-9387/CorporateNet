import { describe, it, expect } from 'vitest';

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

function calculateRequiredPrefix(hostCount: number): number {
  const required = hostCount + 2;
  let hostBits = 0;
  while ((1 << hostBits) < required) {
    hostBits++;
  }
  return 32 - hostBits;
}

describe('VLSM Utilities (Client-side)', () => {
  it('converts IP to number and back', () => {
    expect(numberToIp(ipToNumber('10.10.0.1'))).toBe('10.10.0.1');
    expect(numberToIp(ipToNumber('192.168.1.100'))).toBe('192.168.1.100');
    expect(numberToIp(ipToNumber('255.255.255.255'))).toBe('255.255.255.255');
  });

  it('calculates correct subnet mask from prefix', () => {
    expect(cidrToMask(24)).toBe('255.255.255.0');
    expect(cidrToMask(25)).toBe('255.255.255.128');
    expect(cidrToMask(26)).toBe('255.255.255.192');
    expect(cidrToMask(27)).toBe('255.255.255.224');
    expect(cidrToMask(28)).toBe('255.255.255.240');
    expect(cidrToMask(30)).toBe('255.255.255.252');
    expect(cidrToMask(8)).toBe('255.0.0.0');
    expect(cidrToMask(16)).toBe('255.255.0.0');
  });

  it('calculates required prefix for host count', () => {
    expect(calculateRequiredPrefix(1)).toBe(30);
    expect(calculateRequiredPrefix(2)).toBe(30);
    expect(calculateRequiredPrefix(6)).toBe(29);
    expect(calculateRequiredPrefix(14)).toBe(28);
    expect(calculateRequiredPrefix(30)).toBe(27);
    expect(calculateRequiredPrefix(62)).toBe(26);
    expect(calculateRequiredPrefix(126)).toBe(25);
    expect(calculateRequiredPrefix(254)).toBe(24);
    expect(calculateRequiredPrefix(510)).toBe(23);
  });

  it('matches CorporateNet design prefixes', () => {
    expect(calculateRequiredPrefix(100)).toBe(25); // Engineering
    expect(calculateRequiredPrefix(50)).toBe(26);  // Administration
    expect(calculateRequiredPrefix(25)).toBe(27);  // Finance
    expect(calculateRequiredPrefix(20)).toBe(27);  // HR
    expect(calculateRequiredPrefix(12)).toBe(28);  // IT Support
  });
});