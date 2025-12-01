/**
 * Standard API error responses
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ApiErrors = {
  Unauthorized: () => new ApiError(401, 'Unauthorized'),
  Forbidden: () => new ApiError(403, 'Access forbidden'),
  NotFound: (resource = 'Resource') => new ApiError(404, `${resource} not found`),
  BadRequest: (message = 'Invalid request') => new ApiError(400, message),
  InternalError: () => new ApiError(500, 'Internal server error'),
  ValidationError: (message: string) => new ApiError(400, message, 'VALIDATION_ERROR'),
} as const;
