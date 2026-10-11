import { api } from './client';
import type { Scenario } from '../types';

export const scenariosApi = {
  list: (designId: string) => api.get<Scenario[]>(`/designs/scenarios?designId=${designId}`),

  get: (id: string) => api.get<Scenario>(`/designs/scenarios/${id}`),

  create: (data: {
    designId: string;
    name: string;
    description?: string;
    failedLinkId: string;
    affectedNetworks: string[];
    expectedBehavior: string;
    observedBehavior?: string;
    isEducationalSimulation?: boolean;
  }) => api.post<Scenario>('/designs/scenarios', data),

  update: (id: string, data: Partial<Scenario>) => api.patch<Scenario>(`/designs/scenarios/${id}`, data),

  delete: (id: string) => api.delete<{ deleted: boolean }>(`/designs/scenarios/${id}`),
};