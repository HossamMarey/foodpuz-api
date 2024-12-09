import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { GameTemplateType } from '@prisma/client';

export const gameTemplateController = {
  async createGameTemplate(req: Request, res: Response) {
    try {
      const { type, state, organizationId } = req.body;

      if (!Object.values(GameTemplateType).includes(type)) {
        res.status(400).json({
          error: 'Invalid game type',
          validTypes: Object.values(GameTemplateType),
        });
        return;
      }

      const gameTemplate = await prisma.gameTemplate.create({
        data: {
          type,
          state,
          organizationId,
        },
      });

      res.status(201).json({
        data: gameTemplate,
        message: 'Game template created successfully',
      });
    } catch (error) {
      console.error('Error creating game template:', error);
      res.status(500).json({ error: 'Failed to create game template' });
    }
  },

  async getOrganizationGameTemplates(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;

      const templates = await prisma.gameTemplate.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({
        data: templates,
        message: 'Game templates fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching game templates:', error);
      res.status(500).json({ error: 'Failed to fetch game templates' });
    }
  },

  async getGameTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.gameTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        res.status(404).json({ error: 'Game template not found' });
        return;
      }

      res.status(200).json({
        data: template,
        message: 'Game template fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching game template:', error);
      res.status(500).json({ error: 'Failed to fetch game template' });
    }
  },

  async updateGameTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, state, collectedData } = req.body;

      if (type && !Object.values(GameTemplateType).includes(type)) {
        res.status(400).json({
          error: 'Invalid game type',
          validTypes: Object.values(GameTemplateType),
        });
        return;
      }

      const template = await prisma.gameTemplate.update({
        where: { id },
        data: {
          type,
          state,
          collectedData,
        },
      });

      res.status(200).json({
        data: template,
        message: 'Game template updated successfully',
      });
    } catch (error) {
      console.error('Error updating game template:', error);
      res.status(500).json({ error: 'Failed to update game template' });
    }
  },

  async deleteGameTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.gameTemplate.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Game template deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting game template:', error);
      res.status(500).json({ error: 'Failed to delete game template' });
    }
  },
};
