import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { organizationSchemas } from '../validators/organization.validator';
import { checkOrganizationMembership } from '../middleware/checkOrganizationMembership';
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

// Get all organizations (only show organizations where user is a member)
router.get('/', authenticate, getAllOrganizations);

// Get organization by ID
router.get('/:id', 
  authenticate, 
  checkOrganizationMembership,
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
  checkOrganizationMembership,
  validateRequest(organizationSchemas.update), 
  updateOrganization
);

// Delete organization
router.delete('/:id', 
  authenticate, 
  checkOrganizationMembership,
  validateRequest(organizationSchemas.delete), 
  deleteOrganization
);

// Organization user management routes
router.post('/:id/users', 
  authenticate, 
  checkOrganizationMembership,
  validateRequest(organizationSchemas.addUser), 
  addUser
);

router.delete('/:id/users/:userId', 
  authenticate, 
  checkOrganizationMembership,
  validateRequest(organizationSchemas.removeUser), 
  removeUser
);

router.put('/:id/users/:userId/role', 
  authenticate, 
  checkOrganizationMembership,
  validateRequest(organizationSchemas.updateUserRole), 
  updateUserRole
);

export default router;
