export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    source: string;
    verified: boolean;
    timestamp: string;
    [key: string]: unknown;
  };
}

export const successResponse = <T>(
  data: T,
  meta?: Partial<ApiResponse<T>['meta']>
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    source: 'design-dataset',
    verified: false,
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const errorResponse = (
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> => ({
  success: false,
  error: { code, message, details },
  meta: {
    source: 'api',
    verified: false,
    timestamp: new Date().toISOString(),
  },
});