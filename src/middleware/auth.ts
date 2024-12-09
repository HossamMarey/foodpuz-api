import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/auth.types";
import { supabase } from "../config/supabase";
import { verifyToken } from "../utils/auth.utils";
import { prisma } from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: UserRole;
    token?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader?.split(" ")?.[1];
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }
    const { id } = verifyToken(token);
    if (!id) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(401).json({ error: "Authentication error" });
      return;
    }

    req.user = {
      ...user,
      token,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication error" });
    return;
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get user's role from organization_members table
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", req.user.id)
        .single();

      if (memberError || !memberData) {
        return res.status(403).json({ error: "User has no role assigned" });
      }

      const userRole = memberData.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user.role = userRole;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Authorization failed" });
    }
  };
};
