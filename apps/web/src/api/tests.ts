import { api } from './client';
import type { TestRun, TestStatus, EvidenceType, ConnectivityMatrix } from '../types';

export const testsApi = {
  list: (params?: {
    designId?: string;
    testType?: string;
    status?: TestStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return api.get<{ tests: TestRun[]; total: number }>(`/designs/tests?${searchParams}`);
  },

  get: (id: string) => api.get<TestRun>(`/designs/tests/${id}`),

  create: (data: {
    designId: string;
    testType: string;
    source: string;
    destination: string;
    status: TestStatus;
    observedOutput?: string;
    evidenceType: EvidenceType;
    notes?: string;
    testedAt?: string;
  }) => api.post<TestRun>('/designs/tests', data),

  update: (id: string, data: Partial<TestRun>) => api.patch<TestRun>(`/designs/tests/${id}`, data),

  delete: (id: string) => api.delete<{ deleted: boolean }>(`/designs/tests/${id}`),

  getMatrix: (designId: string) => api.get<ConnectivityMatrix>(`/designs/tests/matrix?designId=${designId}`),
};