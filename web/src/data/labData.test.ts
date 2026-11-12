import { describe, expect, it } from 'vitest';
import { devicePositions, labDevices, labLinks, labInterfaces, labDepartments, demoSteps, stepRoute } from './labData';
import { findPath } from '@/utils/simulation';

describe('Packet Tracer topology model', () => {
  it('contains 43 uniquely positioned devices and 43 valid links', () => {
    const ids = new Set(labDevices.map((device) => device.id));
    expect(ids.size).toBe(43);
    expect(labLinks).toHaveLength(43);
    expect(Object.keys(devicePositions)).toHaveLength(43);

    for (const link of labLinks) {
      expect(ids.has(link.sourceDeviceId), link.linkId).toBe(true);
      expect(ids.has(link.targetDeviceId), link.linkId).toBe(true);
    }
  });

  it('marks every radio-to-client connection as wireless', () => {
    expect(labLinks.filter((link) => link.sourceInterface === 'Radio').every((link) => link.medium === 'wireless')).toBe(true);
  });

  it('uses the documented gateway interfaces and bridge management addresses', () => {
    for (const department of labDepartments) {
      const gateways = labInterfaces.filter(i => i.ipAddress === department.gateway);
      expect(gateways).toHaveLength(1);
      expect(gateways[0].networkCidr).toBe(department.networkCidr);
    }
    expect(labDevices.find(d => d.id === 'wrt0')?.managementIp).toBe('10.10.0.230');
    expect(labDevices.find(d => d.id === 'wrt1')?.managementIp).toBe('192.168.13.15');
  });

  it('keeps all 231 endpoint pairs reachable in the explanatory graph', () => {
    const endpoints = labDevices.filter(d => ['pc', 'laptop', 'server'].includes(d.type));
    expect(endpoints).toHaveLength(22);
    for (let i = 0; i < endpoints.length; i++) {
      for (let j = i + 1; j < endpoints.length; j++) {
        expect(findPath(labLinks, endpoints[i].id, endpoints[j].id)).not.toBeNull();
      }
    }
    for (const step of demoSteps.filter(s => s.from && s.to)) {
      expect(stepRoute(step).length).toBeGreaterThan(0);
    }
    const failure = demoSteps.find(s => s.failedLink)!;
    expect(stepRoute(failure)).toContain('server-backup');
    expect(stepRoute(failure)).not.toContain('server-primary');
  });
});
