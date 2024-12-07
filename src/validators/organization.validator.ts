import { z } from 'zod';
import { OrganizationRole } from '../types/organization.types';

// Convert enum values to an array of strings
const organizationRolesArray = Object.values(OrganizationRole) as [string, ...string[]];

export const organizationSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(2, 'Organization name must be at least 2 characters'),
      description: z.string().optional(),
      website: z.string().url('Invalid website URL').optional(),
      logo: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
    }),
    body: z.object({
      name: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
      description: z.string().optional(),
      website: z.string().url('Invalid website URL').optional(),
      logo: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    }),
  }),

  getById: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
    }),
  }),

  delete: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
    }),
  }),

  addUser: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
    }),
    body: z.object({
      user_id: z.string().uuid('Invalid user ID'),
      role: z.enum(organizationRolesArray, {
        errorMap: () => ({ message: 'Invalid role. Must be one of: ' + organizationRolesArray.join(', ') })
      }),
    }),
  }),

  removeUser: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
      userId: z.string().uuid('Invalid user ID'),
    }),
  }),

  updateUserRole: z.object({
    params: z.object({
      id: z.string().uuid('Invalid organization ID'),
      userId: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
      role: z.enum(organizationRolesArray, {
        errorMap: () => ({ message: 'Invalid role. Must be one of: ' + organizationRolesArray.join(', ') })
      }),
    }),
  }),
};
