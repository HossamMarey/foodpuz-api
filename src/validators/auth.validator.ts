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
};
