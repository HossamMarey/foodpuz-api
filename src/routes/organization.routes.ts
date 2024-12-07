import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { organizationSchemas } from '../validators/organization.validator';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addUser,
  removeUser,
  updateUserRole
} from '../controllers/organization.controller';

const router = express.Router();

// Get all organizations
router.get('/', authenticate, getAllOrganizations);

// Get organization by ID
router.get('/:id', 
  authenticate, 
  validateRequest(organizationSchemas.getById), 
  getOrganizationById
);

// Create organization
router.post('/', 
  authenticate, 
  validateRequest(organizationSchemas.create), 
  createOrganization
);

// Update organization
router.put('/:id', 
  authenticate, 
  validateRequest(organizationSchemas.update), 
  updateOrganization
);

// Delete organization
router.delete('/:id', 
  authenticate, 
  validateRequest(organizationSchemas.delete), 
  deleteOrganization
);

// Organization user management routes
router.post('/:id/users', 
  authenticate, 
  validateRequest(organizationSchemas.addUser), 
  addUser
);
router.delete('/:id/users/:userId', 
  authenticate, 
  validateRequest(organizationSchemas.removeUser), 
  removeUser
);
router.put('/:id/users/:userId/role', 
  authenticate, 
  validateRequest(organizationSchemas.updateUserRole), 
  updateUserRole
);

export default router;
