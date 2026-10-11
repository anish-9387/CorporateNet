export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, 'BAD_REQUEST', details);
  }

  static notFound(message: string, details?: unknown) {
    return new AppError(404, message, 'NOT_FOUND', details);
  }

  static internal(message: string, details?: unknown) {
    return new AppError(500, message, 'INTERNAL_ERROR', details);
  }

  static validation(message: string, details?: unknown) {
    return new AppError(422, message, 'VALIDATION_ERROR', details);
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;