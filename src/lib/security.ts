import { supabase } from '@/integrations/supabase/client';

/**
 * Security utility functions for the application
 */

// CSRF Token Management
let csrfToken: string | null = null;

export const generateCSRFToken = (): string => {
  const token = crypto.randomUUID();
  csrfToken = token;
  sessionStorage.setItem('csrf_token', token);
  return token;
};

export const getCSRFToken = (): string => {
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem('csrf_token');
  }
  if (!csrfToken) {
    csrfToken = generateCSRFToken();
  }
  return csrfToken;
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return token === storedToken;
};

// Secure headers for API requests
export const getSecureHeaders = (): Record<string, string> => {
  return {
    'X-CSRF-Token': getCSRFToken(),
    'X-Requested-With': 'XMLHttpRequest',
  };
};

// Content Security Policy Helper
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Prevent XSS in dynamic content
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// Session timeout management (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimer: NodeJS.Timeout | null = null;

export const resetSessionTimeout = () => {
  if (sessionTimer) clearTimeout(sessionTimer);
  
  sessionTimer = setTimeout(async () => {
    console.warn('Session timeout due to inactivity');
    await supabase.auth.signOut();
    window.location.href = '/auth';
  }, SESSION_TIMEOUT);
};

// Initialize session timeout on user activity
export const initSessionTimeout = () => {
  resetSessionTimeout();
  
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetSessionTimeout, { passive: true });
  });
};

// Cleanup session timeout
export const cleanupSessionTimeout = () => {
  if (sessionTimer) clearTimeout(sessionTimer);
  
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.removeEventListener(event, resetSessionTimeout);
  });
};

// Secure storage helpers
export const secureStorage = {
  setItem: (key: string, value: string, sensitive = false) => {
    if (sensitive) {
      // Use sessionStorage for sensitive data (cleared on tab close)
      sessionStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },
  
  getItem: (key: string, sensitive = false): string | null => {
    if (sensitive) {
      return sessionStorage.getItem(key);
    }
    return localStorage.getItem(key);
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
  
  clear: () => {
    // Clear sensitive data only, preserve non-sensitive preferences
    sessionStorage.clear();
  }
};

// URL validation to prevent open redirects
export const isSafeRedirectURL = (url: string): boolean => {
  try {
    const parsedURL = new URL(url, window.location.origin);
    // Only allow same-origin redirects
    return parsedURL.origin === window.location.origin;
  } catch {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
};

// Rate limiting helper for client-side operations
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const attempts: number[] = [];
  
  return {
    check: (): boolean => {
      const now = Date.now();
      // Remove expired attempts
      const validAttempts = attempts.filter(time => now - time < config.windowMs);
      attempts.length = 0;
      attempts.push(...validAttempts);
      
      return attempts.length < config.maxAttempts;
    },
    
    record: () => {
      attempts.push(Date.now());
    },
    
    reset: () => {
      attempts.length = 0;
    }
  };
};

// Prevent timing attacks on comparisons
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};
