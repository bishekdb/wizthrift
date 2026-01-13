/**
 * Production-safe logging utility
 * Prevents information leakage in production builds
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log info (development only)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log warnings (always shown but sanitized in production)
   */
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    } else {
      console.warn(message); // Only message, no sensitive data
    }
  },

  /**
   * Log errors (sanitized in production)
   */
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // In production, only log generic message
      console.error(message);
      
      // Send to error tracking service (e.g., Sentry) in production
      // TODO: Integrate error tracking
      if (error && typeof error === 'object') {
        // Could send to Sentry here
      }
    }
  },

  /**
   * Log debug info (development only)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

/**
 * Sanitize error for display to user
 * Removes sensitive information
 */
export const sanitizeError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  if (typeof error === 'string') {
    // Remove potential sensitive patterns
    return error
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[NUMBER]')
      .replace(/[a-f0-9]{32,}/gi, '[HASH]');
  }
  
  if (error.message) {
    return sanitizeError(error.message);
  }
  
  return 'An unexpected error occurred';
};
