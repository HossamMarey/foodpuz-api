import { Express } from 'express';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import campaignRoutes from './campaign.routes';
import gameRoutes from './game.routes';

export const setupRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/organizations', organizationRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/games', gameRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
};
