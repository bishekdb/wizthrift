import { z } from 'zod';

// Email validation
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim();

// Password validation with strong requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .trim();

// Phone validation (Indian format)
export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number (must be 10 digits starting with 6-9)')
  .trim();

// Address validation
export const addressSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  street: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address is too long')
    .trim(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'City contains invalid characters')
    .trim(),
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'State contains invalid characters')
    .trim(),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .trim(),
});

// Sign up validation
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// Sign in validation
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Checkout validation
export const checkoutSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  street: z.string()
    .min(5, 'Street address is required')
    .max(200, 'Street address is too long')
    .trim(),
  city: z.string()
    .min(2, 'City is required')
    .max(100, 'City is too long')
    .trim(),
  state: z.string()
    .min(2, 'State is required')
    .max(100, 'State is too long')
    .trim(),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .trim(),
});

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string) as T[Extract<keyof T, string>];
    }
  }
  return sanitized;
};
