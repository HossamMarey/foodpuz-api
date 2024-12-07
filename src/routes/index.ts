import { Router } from 'express';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import campaignRoutes from './campaign.routes';
import gameRoutes from './game.routes';

export const setupRoutes = () => {
  const router = Router();

  // Mount routes
  router.use('/auth', authRoutes);
  router.use('/organizations', organizationRoutes);
  router.use('/campaigns', campaignRoutes);
  router.use('/games', gameRoutes);
  
  // API health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return router;
};
