import express from 'express';
import { authenticate } from '../middleware/auth';
import { checkOrganizationMembership } from '../middleware/checkOrganizationMembership';
import { gameTemplateController } from '../controllers/gameTemplate.controller';

const router = express.Router();

// Game Template Routes
router.post('/templates', authenticate, gameTemplateController.createGameTemplate);
router.get('/templates/organization/:organizationId', authenticate, checkOrganizationMembership, gameTemplateController.getOrganizationGameTemplates);
router.get('/templates/:id', authenticate, gameTemplateController.getGameTemplateById);
router.put('/templates/:id', authenticate, gameTemplateController.updateGameTemplate);
router.delete('/templates/:id', authenticate, gameTemplateController.deleteGameTemplate);

export default router;
