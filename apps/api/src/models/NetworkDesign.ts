import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment {
  name: string;
  hostRequirement: number;
  reservedCapacity?: number;
  networkCidr: string;
  gateway: string;
  subnetMask: string;
}

export interface IDevice {
  deviceId: string;
  hostname: string;
  type: 'router' | 'switch' | 'pc' | 'server';
  model?: string;
  managementIp?: string;
}

export interface IInterface {
  deviceId: string;
  interfaceName: string;
  ipAddress?: string;
  subnetMask?: string;
  networkCidr?: string;
  passiveOspf?: boolean;
}

export interface ILink {
  linkId: string;
  sourceDeviceId: string;
  sourceInterface: string;
  targetDeviceId: string;
  targetInterface: string;
  networkCidr: string;
  medium: 'ethernet' | 'serial' | 'fiber';
}

export interface IOspf {
  processId: number;
  areas: number[];
  routerIds: Record<string, string>;
}

export interface INetworkDesign extends Document {
  name: string;
  description?: string;
  version: string;
  parentCidr: string;
  departments: IDepartment[];
  devices: IDevice[];
  interfaces: IInterface[];
  links: ILink[];
  ospf: IOspf;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, trim: true },
  hostRequirement: { type: Number, required: true, min: 1 },
  reservedCapacity: { type: Number, min: 0 },
  networkCidr: { type: String, required: true },
  gateway: { type: String, required: true },
  subnetMask: { type: String, required: true },
});

const deviceSchema = new Schema<IDevice>({
  deviceId: { type: String, required: true },
  hostname: { type: String, required: true, trim: true },
  type: { type: String, enum: ['router', 'switch', 'pc', 'server'], required: true },
  model: { type: String, trim: true },
  managementIp: { type: String },
});

const interfaceSchema = new Schema<IInterface>({
  deviceId: { type: String, required: true },
  interfaceName: { type: String, required: true },
  ipAddress: { type: String },
  subnetMask: { type: String },
  networkCidr: { type: String },
  passiveOspf: { type: Boolean, default: false },
});

const linkSchema = new Schema<ILink>({
  linkId: { type: String, required: true },
  sourceDeviceId: { type: String, required: true },
  sourceInterface: { type: String, required: true },
  targetDeviceId: { type: String, required: true },
  targetInterface: { type: String, required: true },
  networkCidr: { type: String, required: true },
  medium: { type: String, enum: ['ethernet', 'serial', 'fiber'], required: true },
});

const ospfSchema = new Schema<IOspf>({
  processId: { type: Number, required: true },
  areas: [{ type: Number, required: true }],
  routerIds: { type: Map, of: String, required: true },
});

const networkDesignSchema = new Schema<INetworkDesign>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    version: { type: String, required: true, default: '1.0.0' },
    parentCidr: { type: String, required: true },
    departments: [departmentSchema],
    devices: [deviceSchema],
    interfaces: [interfaceSchema],
    links: [linkSchema],
    ospf: { type: ospfSchema, required: true },
  },
  { timestamps: true }
);

networkDesignSchema.index({ name: 1 });
networkDesignSchema.index({ createdAt: -1 });

export const NetworkDesignModel = mongoose.model<INetworkDesign>('NetworkDesign', networkDesignSchema);
