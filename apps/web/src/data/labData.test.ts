import { describe, expect, it } from 'vitest';
import { devicePositions, labDevices, labLinks } from './labData';

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
});
