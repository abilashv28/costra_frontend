import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  company_name: z.string().optional().transform((value) => value?.trim() || undefined).refine(
    (value) => !value || value.length >= 2,
    {
      message: 'Company name must be at least 2 characters',
      path: ['company_name'],
    }
  ),
  company_id: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const numberValue = Number(value);
      return Number.isInteger(numberValue) ? numberValue : undefined;
    }),
  role: z.enum(["super admin", "admin"]).optional().transform((value) => value || "admin"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});