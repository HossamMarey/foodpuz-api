import { Request, Response, NextFunction } from 'express';

export interface QueryOptions {
  allowedSortFields: string[];
  defaultSortField?: string;
  defaultLimit?: number;
  maxLimit?: number;
  searchFields?: string[];
}

export interface PaginatedQuery {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  whereClause: any;
}

// export const authenticate = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> =>

export const createQueryMiddleware = (options: QueryOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = options.defaultLimit || 10,
        search = '',
        sortBy = options.defaultSortField || 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Validate and convert pagination params
      const pageNumber = Math.max(1, parseInt(page as string));
      const limitNumber = Math.min(
        options.maxLimit || 100,
        Math.max(1, parseInt(limit as string))
      );
      const skip = (pageNumber - 1) * limitNumber;

      // Validate sort field
      const validSortField = options.allowedSortFields.includes(sortBy as string)
        ? sortBy as string
        : options.defaultSortField || 'createdAt';

      // Build search clause
      const searchClause = search
        ? {
          OR: options.searchFields?.map(field => ({
            [field]: {
              contains: search as string,
              mode: 'insensitive'
            }
          }))
        }
        : {};

      // Combine with existing where clause if any
      const existingWhere = (req as any).whereClause || {};
      const whereClause = {
        ...existingWhere,
        ...searchClause
      };

      // Attach query parameters to request object
      (req as any).queryParams = {
        page: pageNumber,
        limit: limitNumber,
        skip,
        sortBy: validSortField,
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
        search: search as string,
        whereClause
      };

      next();
    } catch (error) {
      console.error('Error in query middleware:', error);
      res.status(400).json({ error: 'Invalid query parameters' });
      return
    }
  };
};

export const formatPaginatedResponse = (data: any[], total: number, queryParams: PaginatedQuery) => {
  return {
    data,
    pagination: {
      total,
      page: queryParams.page,
      limit: queryParams.limit,
      totalPages: Math.ceil(total / queryParams.limit)
    }
  };
};

export const gameTemplateQueryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      type
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Initialize where clause
    let whereClause: any = {};

    // Add type filter if provided
    if (type) {
      whereClause.type = type;
    }

    // Attach query parameters to request object
    (req as any).queryParams = {
      skip,
      limit: limitNum,
      sortBy,
      sortOrder,
      whereClause
    };

    next();
  } catch (error) {
    console.error('Error in query middleware:', error);
    res.status(400).json({ error: 'Invalid query parameters' });
  }
};
