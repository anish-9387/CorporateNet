import { api } from './client';
import type {
  NetworkDesign,
  VLSMCalculationResponse,
  VLSMInput,
  TopologyData,
  RoutingInfo,
  ReportData,
} from '../types';

export const designsApi = {
  list: () => api.get<NetworkDesign[]>('/designs'),

  get: (id: string) => api.get<NetworkDesign>(`/designs/${id}`),

  create: (data: {
    name: string;
    description?: string;
    parentCidr: string;
    departments: { name: string; hostRequirement: number; reservedCapacity?: number }[];
    devices: { hostname: string; type: string; model?: string; managementIp?: string }[];
    interfaces: { deviceId: string; interfaceName: string; ipAddress?: string; subnetMask?: string; networkCidr?: string; passiveOspf?: boolean }[];
    links: { sourceDeviceId: string; sourceInterface: string; targetDeviceId: string; targetInterface: string; networkCidr: string; medium: string }[];
    ospf: { processId: number; areas: number[]; routerIds: Record<string, string> };
  }) => api.post<NetworkDesign>('/designs', data),

  update: (id: string, data: Partial<NetworkDesign>) => api.patch<NetworkDesign>(`/designs/${id}`, data),

  delete: (id: string) => api.delete<{ deleted: boolean }>(`/designs/${id}`),

  calculateVLSM: (parentCidr: string, departments: VLSMInput[]) =>
    api.post<VLSMCalculationResponse>('/vlsm/calculate', { parentCidr, departments }),

  getTopology: (id: string) => api.get<TopologyData>(`/designs/${id}/topology`),

  getRouting: (id: string) => api.get<RoutingInfo>(`/designs/${id}/routes`),

  getReport: (id: string, format?: 'json' | 'markdown') =>
    api.get<ReportData | string>(`/designs/${id}/report${format ? `?format=${format}` : ''}`),
};
