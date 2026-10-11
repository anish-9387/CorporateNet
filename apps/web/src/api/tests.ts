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
    return api.get<{ tests: TestRun[]; total: number }>(`/tests?${searchParams}`);
  },

  get: (id: string) => api.get<TestRun>(`/tests/${id}`),

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
  }) => api.post<TestRun>('/tests', data),

  update: (id: string, data: Partial<TestRun>) => api.patch<TestRun>(`/tests/${id}`, data),

  delete: (id: string) => api.delete<{ deleted: boolean }>(`/tests/${id}`),

  getMatrix: (designId: string) => api.get<ConnectivityMatrix>(`/tests/matrix?designId=${designId}`),
};