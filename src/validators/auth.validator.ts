import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string(),
    }),
  }),

  google: z.object({
    body: z.object({
      access_token: z.string(),
    }),
  }),

  refreshToken: z.object({
    body: z.object({
      refresh_token: z.string(),
    }),
  }),

  resendVerification: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      password: z.string().min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  updateProfile: z.object({
    body: z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
      lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
      phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    }),
  }),

  updateEmail: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),
};
