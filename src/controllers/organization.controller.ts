import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { OrganizationRole } from "@prisma/client";

export const organizationController = {
  async getAllOrganizations(req: Request, res: Response) {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      res.status(200).json(organizations);
      return;
    } catch (error) {
      console.error("Error getting organizations:", error);
      res.status(500).json({ error: "Failed to get organizations" });
      return;
    }
  },

  async getOrganizationById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      res.status(200).json(organization);
      return;
    } catch (error) {
      console.error("Error getting organization:", error);
      res.status(500).json({ error: "Failed to get organization" });
      return;
    }
  },

  async createOrganization(req: Request, res: Response) {
    const { name, description, website, logo, address, phone } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    try {
      const organization = await prisma.organization.create({
        data: {
          name,
          description,
          website,
          logo,
          address,
          phone,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: OrganizationRole.OWNER,
            },
          },
        },
        include: {
          members: true,
        },
      });

      res.status(201).json(organization);
      return;
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ error: "Failed to create organization" });
      return;
    }
  },

  async updateOrganization(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    // @ts-ignore
    const userId = req.user.id;

    try {
      // Check user permissions
      const member = await prisma.organizationUser.findFirst({
        where: {
          organizationId: id,
          userId,
          role: {
            in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      const organization = await prisma.organization.update({
        where: { id },
        data: updates,
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      res.status(200).json(organization);
      return;
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ error: "Failed to update organization" });
      return;
    }
  },

  async deleteOrganization(req: Request, res: Response) {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      if (organization.ownerId !== userId) {
        res.status(403).json({
          error: "Only the organization owner can delete the organization",
        });
        return;
      }

      await prisma.organization.delete({
        where: { id },
      });

      res.status(204).send();
      return;
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ error: "Failed to delete organization" });
      return;
    }
  },

  async addUser(req: Request, res: Response) {
    const { id } = req.params;
    const { userId: newUserId, role } = req.body;
    // @ts-ignore
    const requestingUserId = req.user.id;

    try {
      // Check permissions
      const member = await prisma.organizationUser.findFirst({
        where: {
          organizationId: id,
          userId: requestingUserId,
          role: {
            in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      // Check if user is already a member
      const existingMember = await prisma.organizationUser.findUnique({
        where: {
          organizationId_userId: {
            organizationId: id,
            userId: newUserId,
          },
        },
      });

      if (existingMember) {
        res.status(400).json({ error: "User is already a member of this organization" });
        return;
      }

      const newMember = await prisma.organizationUser.create({
        data: {
          organizationId: id,
          userId: newUserId,
          role,
        },
        include: {
          user: true,
        },
      });

      res.status(201).json(newMember);
      return;
    } catch (error) {
      console.error("Error adding user to organization:", error);
      res.status(500).json({ error: "Failed to add user to organization" });
      return;
    }
  },

  async removeUser(req: Request, res: Response) {
    const { id, userId: userToRemoveId } = req.params;
    // @ts-ignore
    const requestingUserId = req.user.id;

    try {
      // Check permissions
      const [member, organization] = await Promise.all([
        prisma.organizationUser.findFirst({
          where: {
            organizationId: id,
            userId: requestingUserId,
            role: {
              in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
            },
          },
        }),
        prisma.organization.findUnique({
          where: { id },
        }),
      ]);

      if (!member) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      if (organization?.ownerId === userToRemoveId) {
        res.status(403).json({ error: "Cannot remove the organization owner" });
        return;
      }

      await prisma.organizationUser.delete({
        where: {
          organizationId_userId: {
            organizationId: id,
            userId: userToRemoveId,
          },
        },
      });

      res.status(204).send();
      return;
    } catch (error) {
      console.error("Error removing user from organization:", error);
      res.status(500).json({ error: "Failed to remove user from organization" });
      return;
    }
  },

  async updateUserRole(req: Request, res: Response) {
    const { id, userId: userToUpdateId } = req.params;
    const { role } = req.body;

    // @ts-ignore
    const requestingUserId = req.user.id;

    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      if (organization.ownerId !== requestingUserId) {
        res.status(403).json({ error: "Only the organization owner can update user roles" });
        return;
      }

      if (organization.ownerId === userToUpdateId) {
        res.status(403).json({ error: "Cannot change the organization owner's role" });
        return;
      }

      const updatedMember = await prisma.organizationUser.update({
        where: {
          organizationId_userId: {
            organizationId: id,
            userId: userToUpdateId,
          },
        },
        data: { role },
        include: {
          user: true,
        },
      });

      res.status(200).json(updatedMember);
      return;
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
      return;
    }
  },
};

export const {
  deleteOrganization,
  getAllOrganizations,
  addUser,
  createOrganization,
  getOrganizationById,
  removeUser,
  updateOrganization,
  updateUserRole,
} = organizationController;
