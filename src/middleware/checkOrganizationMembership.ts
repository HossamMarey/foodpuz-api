import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { OrganizationRole } from '@prisma/client';

// Extend the Request type to include organizationMembership
declare global {
  namespace Express {
    interface Request {
      organizationMembership?: {
        organizationId: string;
        userId: string;
        role: OrganizationRole;
      };
    }
  }
}

export const checkOrganizationMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.params.id;
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
       res.status(401).json({ error: 'User not authenticated' });
       return
    }

    const membership = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!membership) {
       res.status(403).json({ error: 'User is not a member of this organization' });
       return
    }

    // Add membership info to the request for potential role checks later
    req.organizationMembership = membership;
    next();
  } catch (error) {
    console.error('Error checking organization membership:', error);
     res.status(500).json({ error: 'Internal server error' });
     return
  }
};
