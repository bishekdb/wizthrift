// Centralized CORS configuration for edge functions

// Get allowed origins from environment or use defaults
// In production, MUST set ALLOWED_ORIGINS environment variable
const ALLOWED_ORIGINS_ENV = Deno.env.get('ALLOWED_ORIGINS');

const getAllowedOrigins = (): string[] => {
  if (ALLOWED_ORIGINS_ENV) {
    return ALLOWED_ORIGINS_ENV.split(',').map(origin => origin.trim());
  }
  // Default origins including production
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://wizthrift.app',
    'https://www.wizthrift.app',
    'https://wizthrift.vercel.app',
  ];
};

const allowedOrigins = getAllowedOrigins();

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Check if the request origin is allowed
  const origin = requestOrigin || '';
  
  // STRICT: Only allow exact matches or explicitly configured domains
  // Do NOT use wildcard matching in production
  const isAllowed = allowedOrigins.some(allowed => origin === allowed);
  
  // For development, also allow lovable domains
  const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
  const isLovable = isDev && (
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app')
  );
  
  const finalOrigin = (isAllowed || isLovable) ? origin : allowedOrigins[0] || 'null';
  
  return {
    'Access-Control-Allow-Origin': finalOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST',  // Only POST for most functions
    'Access-Control-Max-Age': '3600',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Vary': 'Origin',
  };
}

export function handleCorsPreflightRequest(requestOrigin: string | null): Response {
  return new Response(null, { 
    headers: getCorsHeaders(requestOrigin),
    status: 204,
  });
}
