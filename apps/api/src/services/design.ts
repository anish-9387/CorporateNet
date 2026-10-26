import { NetworkDesignModel, TestRunModel, ScenarioModel, INetworkDesign, IDepartment, IDevice, IInterface, ILink, IOspf } from '../models';
import { calculateVLSM, SubnetInput } from './vlsm';
import { AppError } from '../utils/errors';

export interface CreateDesignInput {
  name: string;
  description?: string;
  parentCidr: string;
  departments: Omit<IDepartment, 'networkCidr' | 'gateway' | 'subnetMask'>[];
  devices: Omit<IDevice, 'deviceId'>[];
  interfaces: IInterface[];
  links: Omit<ILink, 'linkId'>[];
  ospf: IOspf;
}

export interface CreateDesignInputWithIds extends CreateDesignInput {
  devices: IDevice[];
  interfaces: IInterface[];
  links: ILink[];
}

export interface UpdateDesignInput {
  name?: string;
  description?: string;
  version?: string;
  parentCidr?: string;
  departments?: IDepartment[];
  devices?: IDevice[];
  interfaces?: IInterface[];
  links?: ILink[];
  ospf?: IOspf;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function applyVLSMToDesign(input: CreateDesignInput): IDepartment[] {
  const vlsmInputs: SubnetInput[] = input.departments.map((d) => ({
    name: d.name,
    hostCount: d.hostRequirement,
    reservedCapacity: d.reservedCapacity,
  }));

  const result = calculateVLSM(input.parentCidr, vlsmInputs);
  if (!result.isValid) {
    throw AppError.validation('VLSM calculation failed', result.errors);
  }

  return input.departments.map((dept, index) => {
    const subnet = result.subnets.find((s) => s.name === dept.name);
    if (!subnet) {
      throw AppError.internal(`Subnet not found for department ${dept.name}`);
    }
    return {
      ...dept,
      networkCidr: `${subnet.networkAddress}/${subnet.prefix}`,
      gateway: subnet.gateway,
      subnetMask: subnet.subnetMask,
    };
  });
}

export const designService = {
  async create(input: CreateDesignInput): Promise<INetworkDesign> {
    const departmentsWithSubnets = applyVLSMToDesign(input);

    const devices = input.devices.map((d) => ({
      ...d,
      deviceId: generateId(d.type),
    }));
    if (new Set(devices.map((d) => d.hostname)).size !== devices.length) {
      throw AppError.validation('Device hostnames must be unique');
    }
    const resolveDevice = (hostname: string) => {
      const device = devices.find((d) => d.hostname === hostname);
      if (!device) throw AppError.validation(`Unknown device: ${hostname}`);
      return device.deviceId;
    };

    const interfaces = input.interfaces.map((i) => ({
      ...i,
      deviceId: resolveDevice(i.deviceId),
    }));

    const links = input.links.map((l) => ({
      ...l,
      linkId: generateId('link'),
      sourceDeviceId: resolveDevice(l.sourceDeviceId),
      targetDeviceId: resolveDevice(l.targetDeviceId),
    }));

    const design = new NetworkDesignModel({
      ...input,
      departments: departmentsWithSubnets,
      devices,
      interfaces,
      links,
    });

    return design.save();
  },

  async findById(id: string): Promise<INetworkDesign | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }
    return NetworkDesignModel.findById(id).lean<INetworkDesign>().exec();
  },

  async findAll(): Promise<INetworkDesign[]> {
    return NetworkDesignModel.find().sort({ createdAt: -1 }).lean<INetworkDesign[]>().exec();
  },

  async update(id: string, input: UpdateDesignInput): Promise<INetworkDesign | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }

    const updateData = { ...input };
    if (input.parentCidr || input.departments) {
      const existing = await this.findById(id);
      if (!existing) return null;
      const departments = input.departments ?? existing.departments;
      const vlsmInputs: SubnetInput[] = departments.map((d) => ({
        name: d.name,
        hostCount: d.hostRequirement,
        reservedCapacity: d.reservedCapacity,
      }));
      const result = calculateVLSM(input.parentCidr ?? existing.parentCidr, vlsmInputs);
      if (!result.isValid) {
        throw AppError.validation('VLSM calculation failed', result.errors);
      }
      updateData.departments = departments.map((dept) => {
        const subnet = result.subnets.find((s) => s.name === dept.name);
        if (!subnet) throw AppError.internal(`Subnet not found for ${dept.name}`);
        return {
          ...dept,
          networkCidr: `${subnet.networkAddress}/${subnet.prefix}`,
          gateway: subnet.gateway,
          subnetMask: subnet.subnetMask,
        };
      });
      const allocationChanged = existing.departments.length !== updateData.departments.length || existing.departments.some((dept) => updateData.departments!.find((next) => next.name === dept.name)?.networkCidr !== dept.networkCidr);
      if (allocationChanged && (existing.interfaces.length || existing.links.length) && (!input.interfaces || !input.links)) {
        throw AppError.validation('Changing subnet allocations requires updated interfaces and links for this connected design');
      }
    }

    return NetworkDesignModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean<INetworkDesign>().exec();
  },

  async delete(id: string): Promise<boolean> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }
    const result = await NetworkDesignModel.findByIdAndDelete(id);
    if (result) await Promise.all([TestRunModel.deleteMany({ designId: id }), ScenarioModel.deleteMany({ designId: id })]);
    return result !== null;
  },

  async calculateVLSM(parentCidr: string, departments: SubnetInput[]) {
    return calculateVLSM(parentCidr, departments);
  },

  async getTopology(id: string) {
    const design = await this.findById(id);
    if (!design) throw AppError.notFound('Design not found');

    const nodes = design.devices.map((device) => ({
      id: device.deviceId,
      type: device.type,
      label: device.hostname,
      data: device,
    }));

    const edges = design.links.map((link) => ({
      id: link.linkId,
      source: link.sourceDeviceId,
      target: link.targetDeviceId,
      label: link.networkCidr,
      data: link,
    }));

    return { nodes, edges };
  },

  async getRoutingInfo(id: string) {
    const design = await this.findById(id);
    if (!design) throw AppError.notFound('Design not found');

    return {
      ospf: design.ospf,
      interfaces: design.interfaces,
      routes: design.departments.map((d) => ({
        network: d.networkCidr,
        gateway: d.gateway,
        interface: design.interfaces.find((i) => i.networkCidr === d.networkCidr)?.interfaceName,
      })),
    };
  },
};
