import type { ApiError } from '@/types/api';

/**
 * Error code types that can be mapped to friendly messages
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'ECONNREFUSED'
  | 'ENOTFOUND'
  | 'ETIMEDOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Friendly error information structure
 */
export interface FriendlyErrorInfo {
  code: ErrorCode;
  title: string;
  titleKey: string;
  message: string;
  messageKey: string;
  causes: string[];
  causesKey: string;
  solutions: string[];
  solutionsKey: string;
  canAutoFix: boolean;
  autoFixAction?: 'startBackend' | 'checkNetwork' | 'refreshToken' | 'retry';
}

/**
 * Map HTTP status codes and error codes to friendly error information
 */
const errorMap: Record<string, FriendlyErrorInfo> = {
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Network Connection Failed',
    titleKey: 'errors.network.title',
    message: 'Unable to connect to the server. Please check your network settings.',
    messageKey: 'errors.network.message',
    causes: [
      'No internet connection',
      'Firewall blocking the connection',
      'DNS resolution failed',
      'Network proxy misconfigured',
    ],
    causesKey: 'errors.network.causes',
    solutions: [
      'Check your internet connection',
      'Disable VPN or proxy temporarily',
      'Verify firewall settings',
      'Try again in a few moments',
    ],
    solutionsKey: 'errors.network.solutions',
    canAutoFix: true,
    autoFixAction: 'checkNetwork',
  },
  ECONNREFUSED: {
    code: 'ECONNREFUSED',
    title: 'Backend Service Not Running',
    titleKey: 'errors.connectionRefused.title',
    message: 'The backend service is not started. Please click to start it.',
    messageKey: 'errors.connectionRefused.message',
    causes: [
      'Backend server is not running',
      'Backend server crashed',
      'Port is occupied by another process',
      'Server configuration error',
    ],
    causesKey: 'errors.connectionRefused.causes',
    solutions: [
      'Start the backend service',
      'Check server logs for errors',
      'Verify port availability',
      'Restart the application',
    ],
    solutionsKey: 'errors.connectionRefused.solutions',
    canAutoFix: true,
    autoFixAction: 'startBackend',
  },
  ENOTFOUND: {
    code: 'ENOTFOUND',
    title: 'Server Not Found',
    titleKey: 'errors.notFound.title',
    message: 'The server address could not be resolved.',
    messageKey: 'errors.notFound.message',
    causes: [
      'Invalid server URL',
      'DNS resolution failed',
      'Server hostname changed',
    ],
    causesKey: 'errors.notFound.causes',
    solutions: [
      'Check the server URL configuration',
      'Verify DNS settings',
      'Contact administrator',
    ],
    solutionsKey: 'errors.notFound.solutions',
    canAutoFix: false,
  },
  ETIMEDOUT: {
    code: 'ETIMEDOUT',
    title: 'Request Timeout',
    titleKey: 'errors.timeout.title',
    message: 'The request took too long to complete.',
    messageKey: 'errors.timeout.message',
    causes: [
      'Server is overloaded',
      'Network latency is too high',
      'Request size is too large',
    ],
    causesKey: 'errors.timeout.causes',
    solutions: [
      'Try again later',
      'Check network speed',
      'Reduce request size',
    ],
    solutionsKey: 'errors.timeout.solutions',
    canAutoFix: true,
    autoFixAction: 'retry',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    title: 'Invalid or Expired API Key',
    titleKey: 'errors.unauthorized.title',
    message: 'Your API key is invalid or has expired.',
    messageKey: 'errors.unauthorized.message',
    causes: [
      'API key has expired',
      'API key was revoked',
      'Incorrect API key provided',
      'Session has timed out',
    ],
    causesKey: 'errors.unauthorized.causes',
    solutions: [
      'Check your API key in settings',
      'Generate a new API key',
      'Re-authenticate your session',
      'Contact administrator for access',
    ],
    solutionsKey: 'errors.unauthorized.solutions',
    canAutoFix: true,
    autoFixAction: 'refreshToken',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    title: 'Access Denied',
    titleKey: 'errors.forbidden.title',
    message: 'You do not have permission to perform this action.',
    messageKey: 'errors.forbidden.message',
    causes: [
      'Insufficient user privileges',
      'Resource access restricted',
      'Account suspended',
      'Feature not enabled',
    ],
    causesKey: 'errors.forbidden.causes',
    solutions: [
      'Contact administrator for access',
      'Verify your account status',
      'Check subscription plan',
      'Request necessary permissions',
    ],
    solutionsKey: 'errors.forbidden.solutions',
    canAutoFix: false,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: 'Resource Not Found',
    titleKey: 'errors.resourceNotFound.title',
    message: 'The requested resource does not exist.',
    messageKey: 'errors.resourceNotFound.message',
    causes: [
      'Resource was deleted',
      'Invalid resource ID',
      'Resource moved to different location',
      'Typo in the URL',
    ],
    causesKey: 'errors.resourceNotFound.causes',
    solutions: [
      'Verify the resource ID',
      'Check if resource was moved',
      'Navigate to the list and find the resource',
      'Refresh the page',
    ],
    solutionsKey: 'errors.resourceNotFound.solutions',
    canAutoFix: false,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    title: 'Server Error',
    titleKey: 'errors.serverError.title',
    message: 'An internal server error occurred. Please try again later.',
    messageKey: 'errors.serverError.message',
    causes: [
      'Server encountered an unexpected error',
      'Database connection failed',
      'Service dependency unavailable',
      'Bug in the server code',
    ],
    causesKey: 'errors.serverError.causes',
    solutions: [
      'Wait a moment and try again',
      'Contact support if the problem persists',
      'Check server logs for details',
      'Try a different operation',
    ],
    solutionsKey: 'errors.serverError.solutions',
    canAutoFix: true,
    autoFixAction: 'retry',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Service Unavailable',
    titleKey: 'errors.serviceUnavailable.title',
    message: 'The service is temporarily unavailable. Please try again later.',
    messageKey: 'errors.serviceUnavailable.message',
    causes: [
      'Server is under maintenance',
      'Server is overloaded',
      'Service temporarily disabled',
    ],
    causesKey: 'errors.serviceUnavailable.causes',
    solutions: [
      'Wait and try again later',
      'Check service status page',
      'Contact support',
    ],
    solutionsKey: 'errors.serviceUnavailable.solutions',
    canAutoFix: true,
    autoFixAction: 'retry',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    titleKey: 'errors.validation.title',
    message: 'The submitted data is invalid. Please check your input.',
    messageKey: 'errors.validation.message',
    causes: [
      'Required field missing',
      'Invalid data format',
      'Data exceeds size limit',
      'Invalid characters in input',
    ],
    causesKey: 'errors.validation.causes',
    solutions: [
      'Review the form for errors',
      'Check field requirements',
      'Ensure correct data format',
      'Remove invalid characters',
    ],
    solutionsKey: 'errors.validation.solutions',
    canAutoFix: false,
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    title: 'Unexpected Error',
    titleKey: 'errors.unknown.title',
    message: 'An unexpected error occurred. Please try again.',
    messageKey: 'errors.unknown.message',
    causes: [
      'Unknown error occurred',
      'System encountered an issue',
    ],
    causesKey: 'errors.unknown.causes',
    solutions: [
      'Try again',
      'Refresh the page',
      'Contact support if problem persists',
    ],
    solutionsKey: 'errors.unknown.solutions',
    canAutoFix: true,
    autoFixAction: 'retry',
  },
};

/**
 * HTTP status code to error code mapping
 */
const httpStatusMap: Record<number, ErrorCode> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  500: 'INTERNAL_ERROR',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'ETIMEDOUT',
};

/**
 * Network error code mapping
 */
const networkErrorMap: Record<string, ErrorCode> = {
  ECONNREFUSED: 'ECONNREFUSED',
  ENOTFOUND: 'ENOTFOUND',
  ETIMEDOUT: 'ETIMEDOUT',
  ECONNRESET: 'NETWORK_ERROR',
  ENETUNREACH: 'NETWORK_ERROR',
  EHOSTUNREACH: 'NETWORK_ERROR',
};

/**
 * Get error code from various error types
 */
export function getErrorCode(error: unknown): ErrorCode {
  // Check if it's an API error with code
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;

    // Check for explicit error code
    if (apiError.code) {
      const upperCode = apiError.code.toUpperCase();
      if (errorMap[upperCode]) {
        return upperCode as ErrorCode;
      }
      if (networkErrorMap[upperCode]) {
        return networkErrorMap[upperCode];
      }
    }

    // Check for HTTP status
    const httpStatus = (apiError as unknown as Record<string, unknown>).status as number;
    if (httpStatus && httpStatusMap[httpStatus]) {
      return httpStatusMap[httpStatus];
    }

    // Check for axios error
    const axiosError = error as Record<string, unknown>;
    if (axiosError.isAxiosError) {
      const response = axiosError.response as Record<string, unknown> | undefined;
      if (response?.status && httpStatusMap[response.status as number]) {
        return httpStatusMap[response.status as number];
      }

      // Check for network errors in axios
      const code = axiosError.code as string;
      if (code) {
        const upperCode = code.toUpperCase();
        if (networkErrorMap[upperCode]) {
          return networkErrorMap[upperCode];
        }
      }

      // No response means network error
      if (!response) {
        return 'NETWORK_ERROR';
      }
    }

    // Check error message for common patterns
    const message = apiError.message?.toLowerCase() || '';
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'ETIMEDOUT';
    }
    if (message.includes('refused') || message.includes('econnrefused')) {
      return 'ECONNREFUSED';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get friendly error information from an error
 */
export function getFriendlyError(error: unknown): FriendlyErrorInfo {
  const code = getErrorCode(error);
  return errorMap[code] || errorMap.UNKNOWN_ERROR;
}

/**
 * Check if error indicates backend is not running
 */
export function isBackendNotRunning(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === 'ECONNREFUSED' || code === 'NETWORK_ERROR';
}

/**
 * Check if error can be auto-fixed
 */
export function canAutoFixError(error: unknown): boolean {
  const friendlyError = getFriendlyError(error);
  return friendlyError.canAutoFix;
}

/**
 * Get auto-fix action for error
 */
export function getAutoFixAction(error: unknown): FriendlyErrorInfo['autoFixAction'] {
  const friendlyError = getFriendlyError(error);
  return friendlyError.autoFixAction;
}

export { errorMap };
