import { describe, expect, it } from 'vitest';
import { findPath } from '@/utils/simulation';
import { labDevices, labLinks, demoSteps, stepRoute, stepTicks } from './packetTracer';

describe('Completed Packet Tracer presentation model', () => {
  it('contains the 43 unique devices, valid port links and a connected topology', () => {
    const ids = new Set(labDevices.map((device) => device.id));
    expect(ids.size).toBe(43);
    expect(labDevices).toHaveLength(43);
    expect(labLinks).toHaveLength(43);
    expect(new Set(labLinks.map((link) => link.linkId)).size).toBe(43);
    for (const link of labLinks) {
      expect(ids.has(link.sourceDeviceId)).toBe(true);
      expect(ids.has(link.targetDeviceId)).toBe(true);
    }
    for (const device of labDevices) expect(findPath(labLinks, 'core', device.id)).not.toBeNull();
  });

  it('uses the backup server link on failure, restores the primary, and preserves the ISP path', () => {
    expect(findPath(labLinks, 'pc3', 'server2')).toContain('server-primary');
    const failure = demoSteps.find((step) => step.protocol === 'FAILOVER')!;
    expect(stepRoute(failure)).toContain('server-backup');
    expect(stepRoute(failure)).not.toContain('server-primary');
    expect(stepRoute(demoSteps[demoSteps.length - 1])).toContain('server-primary');
    expect(findPath(labLinks, 'pc3', 'server4')).toEqual(['finance-pc', 'finance-lan', 'core-east', 'core-edge', 'wan', 'external']);
  });

  it('has a reachable route and time to display every narrated packet hop', () => {
    for (const step of demoSteps) {
      expect(stepRoute(step)).not.toBeNull();
      expect(stepTicks(step)).toBeGreaterThan(stepRoute(step)!.length);
    }
  });
});
