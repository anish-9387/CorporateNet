import { api } from './client';
import type { ReportData } from '../types';

export const reportService = {
  generate: (designId: string) => api.get<ReportData>(`/designs/${designId}/report`),

  exportMarkdown: (designId: string) =>
    api.get<string>(`/designs/${designId}/report?format=markdown`),
};