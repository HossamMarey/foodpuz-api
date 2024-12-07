import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';
import { supabase } from '../config/supabase';

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
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: user.role as UserRole,
      token
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
    return;
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get user's role from organization_members table
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', req.user.id)
        .single();

      if (memberError || !memberData) {
        return res.status(403).json({ error: 'User has no role assigned' });
      }

      const userRole = memberData.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user.role = userRole;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
