import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { GameTemplateType } from '@prisma/client';
import { createQueryMiddleware, formatPaginatedResponse } from '../middleware/queryMiddleware';

// Define query options for game templates
export const gameTemplateQueryOptions = {
  allowedSortFields: ['createdAt', 'updatedAt', 'name'],
  allowedFilterFields: ['type', 'name'],
  defaultSort: { field: 'createdAt', order: 'desc' },
  defaultLimit: 10
};

// Create middleware instance
const gameTemplateQueryMiddleware = createQueryMiddleware(gameTemplateQueryOptions);

export { gameTemplateQueryMiddleware };
export const gameTemplateController = {
  async createGameTemplate(req: Request, res: Response) {
    try {
      const { type, state, organizationId, name } = req.body;

      if (!Object.values(GameTemplateType).includes(type)) {
        res.status(400).json({
          error: 'Invalid game type',
          validTypes: Object.values(GameTemplateType),
        });
        return;
      }

      const gameTemplate = await prisma.gameTemplate.create({
        data: {
          name,
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
      const { whereClause, ...queryParams } = (req as any).queryParams;

      // Add organizationId to where clause
      const finalWhereClause = {
        ...whereClause,
        organizationId
      };

      // Get total count for pagination
      const totalCount = await prisma.gameTemplate.count({
        where: finalWhereClause
      });

      // Get paginated and filtered results
      const templates = await prisma.gameTemplate.findMany({
        where: finalWhereClause,
        orderBy: {
          [queryParams.sortBy]: queryParams.sortOrder
        },
        skip: queryParams.skip,
        take: queryParams.limit
      });

      res.status(200).json({
        ...formatPaginatedResponse(templates, totalCount, { ...queryParams, whereClause: finalWhereClause }),
        message: 'Game templates fetched successfully'
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
      const { type, state, collectedData, name } = req.body;

      if (type && !Object.values(GameTemplateType).includes(type)) {
        res.status(400).json({
          error: 'Invalid game type',
          validTypes: Object.values(GameTemplateType),
        });
        return;
      }

      const updateData: any = {};
      if (type !== undefined) updateData.type = type;
      if (state !== undefined) updateData.state = state;
      if (collectedData !== undefined) updateData.collectedData = collectedData;
      if (name !== undefined) updateData.name = name;

      const template = await prisma.gameTemplate.update({
        where: { id },
        data: updateData,
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
