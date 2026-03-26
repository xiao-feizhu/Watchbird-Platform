/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  code: string,
  message: string
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  }
}
