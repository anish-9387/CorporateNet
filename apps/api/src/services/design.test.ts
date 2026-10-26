import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../utils/database';
import { designService } from '../services/design';
import { NetworkDesignModel } from '../models';

const testDesign = {
  name: 'Test Design',
  description: 'Test design for unit tests',
  parentCidr: '10.0.0.0/24',
  departments: [
    { name: 'Dept A', hostRequirement: 50 },
    { name: 'Dept B', hostRequirement: 25 },
  ],
  devices: [
    { hostname: 'R1', type: 'router' as const },
    { hostname: 'SW1', type: 'switch' as const },
  ],
  interfaces: [
    { deviceId: 'R1', interfaceName: 'G0/0', networkCidr: '10.0.0.0/26' },
    { deviceId: 'R1', interfaceName: 'G0/1', networkCidr: '10.0.0.64/27' },
  ],
  links: [
    { sourceDeviceId: 'R1', sourceInterface: 'G0/0', targetDeviceId: 'SW1', targetInterface: 'G0/1', networkCidr: '10.0.0.0/26', medium: 'ethernet' as const },
  ],
  ospf: {
    processId: 1,
    areas: [0],
    routerIds: { R1: '1.1.1.1' },
  },
};

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await NetworkDesignModel.deleteMany({ name: 'Test Design' });
  await disconnectDatabase();
});

describe('Design Service', () => {
  it('creates a design with calculated VLSM', async () => {
    const design = await designService.create(testDesign);

    expect(design).toBeDefined();
    expect(design.name).toBe('Test Design');
    expect(design.departments).toHaveLength(2);
    expect(design.departments[0].networkCidr).toBeDefined();
    expect(design.departments[0].gateway).toBeDefined();
    expect(design.departments[0].subnetMask).toBeDefined();
    expect(design.interfaces[0].deviceId).toBe(design.devices[0].deviceId);
    expect(design.links[0].sourceDeviceId).toBe(design.devices[0].deviceId);
    expect(design.links[0].targetDeviceId).toBe(design.devices[1].deviceId);
  });

  it('finds design by ID', async () => {
    const created = await designService.create(testDesign);
    const found = await designService.findById(created._id.toString());

    expect(found).toBeDefined();
    expect(found?._id.toString()).toBe(created._id.toString());
  });

  it('returns null for non-existent ID', async () => {
    const found = await designService.findById('507f1f77bcf86cd799439011');
    expect(found).toBeNull();
  });

  it('throws on invalid ID format', async () => {
    await expect(designService.findById('invalid')).rejects.toThrow('Invalid design ID format');
  });

  it('updates design and recalculates VLSM', async () => {
    const created = await designService.create({ ...testDesign, interfaces: [], links: [] });
    const updated = await designService.update(created._id.toString(), {
      parentCidr: '10.0.0.0/23',
      departments: [
        { name: 'Dept A', hostRequirement: 100, networkCidr: '', gateway: '', subnetMask: '' },
        { name: 'Dept B', hostRequirement: 50, networkCidr: '', gateway: '', subnetMask: '' },
        { name: 'Dept C', hostRequirement: 25, networkCidr: '', gateway: '', subnetMask: '' },
      ],
    });

    expect(updated).toBeDefined();
    expect(updated?.departments).toHaveLength(3);
    expect(updated?.parentCidr).toBe('10.0.0.0/23');
  });

  it('prevents subnet changes from silently leaving connected interfaces on old networks', async () => {
    const created = await designService.create(testDesign);
    await expect(designService.update(created._id.toString(), { parentCidr: '192.168.0.0/24' })).rejects.toThrow('updated interfaces and links');
    expect((await designService.findById(created._id.toString()))?.parentCidr).toBe('10.0.0.0/24');
  });

  it('deletes design', async () => {
    const created = await designService.create(testDesign);
    const deleted = await designService.delete(created._id.toString());
    expect(deleted).toBe(true);

    const found = await designService.findById(created._id.toString());
    expect(found).toBeNull();
  });

  it('calculates VLSM via service', async () => {
    const result = await designService.calculateVLSM('10.0.0.0/24', [
      { name: 'A', hostCount: 50 },
      { name: 'B', hostCount: 25 },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.subnets).toHaveLength(2);
  });

  it('gets topology', async () => {
    const created = await designService.create(testDesign);
    const topology = await designService.getTopology(created._id.toString());

    expect(topology.nodes).toHaveLength(2);
    expect(topology.edges).toHaveLength(1);
  });

  it('gets routing info', async () => {
    const created = await designService.create(testDesign);
    const routing = await designService.getRoutingInfo(created._id.toString());

    expect(routing.ospf.processId).toBe(1);
    expect(routing.interfaces).toHaveLength(2);
  });
});
