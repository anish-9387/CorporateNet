import { connectDatabase, disconnectDatabase } from '../utils/database';
import { NetworkDesignModel } from '../models';
import { designService } from '../services/design';

import { initialDesign } from './seed-data';

const seed = async (): Promise<void> => {
  try {
    await connectDatabase();

    const existing = await NetworkDesignModel.findOne({ name: initialDesign.name });
    if (existing) {
      const resolveDevice = (id: string) => existing.devices.find((device) => device.hostname === id)?.deviceId ?? id;
      existing.interfaces.forEach((iface) => { iface.deviceId = resolveDevice(iface.deviceId); });
      existing.links.forEach((link) => {
        link.sourceDeviceId = resolveDevice(link.sourceDeviceId);
        link.targetDeviceId = resolveDevice(link.targetDeviceId);
      });
      await existing.save();
      console.log('Existing demo design retained; device references checked');
      return;
    }

    await designService.create(initialDesign);
    console.log('Initial design seeded successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

seed();
