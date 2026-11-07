import { describe, expect, it } from 'vitest';
import { findPath, layoutDevices } from './simulation';
import type { Device, Link } from '@/types';

const links: Link[] = [['a', 'R1', 'R2'], ['b', 'R2', 'R3']].map(([linkId, sourceDeviceId, targetDeviceId]) => ({ linkId, sourceDeviceId, targetDeviceId, sourceInterface: '', targetInterface: '', networkCidr: '', medium: 'serial' }));
describe('Simulation reachability', () => {
  it('places routers and attached switches consistently without overlapping', () => {
    const devices: Device[] = [{ deviceId: 'R1', hostname: 'R1', type: 'router' }, { deviceId: 'R2', hostname: 'R2', type: 'router' }, { deviceId: 'S1', hostname: 'S1', type: 'switch' }];
    expect(layoutDevices(devices, [{ ...links[0], sourceDeviceId: 'R1', targetDeviceId: 'S1' }]).map((node) => node.position)).toEqual([{ x: 0, y: 50 }, { x: 320, y: 50 }, { x: 0, y: 240 }]);
  });
  it('finds forward, reverse and local routes', () => {
    expect(findPath(links, 'R1', 'R3')).toEqual(['a', 'b']);
    expect(findPath(links, 'R3', 'R1')).toEqual(['b', 'a']);
    expect(findPath(links, 'R1', 'R1')).toEqual([]);
  });
  it('partitions a chain when a link fails and finds an alternate path in a ring', () => {
    expect(findPath(links, 'R1', 'R3', 'a')).toBeNull();
    expect(findPath([...links, { ...links[0], linkId: 'c', sourceDeviceId: 'R1', targetDeviceId: 'R3' }], 'R1', 'R3', 'a')).toEqual(['c']);
    expect(findPath(links, '', 'R1')).toBeNull();
  });
});
