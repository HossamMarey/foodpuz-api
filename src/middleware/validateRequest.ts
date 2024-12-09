import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      const body = req.body;

      Object.entries(body).forEach(([key, value]) => {
        if (typeof value === 'string') {
          let v = value.trim();
          if (v === '') {
            delete body[key];
          } else {

            body[key] =  v;
          }

        }
      });

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {


      console.log( 'VALID_ERROR' , error );
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => err.message)
          .join(', ');
        return next(new AppError(errorMessage, 400));
      }
      return next(new AppError('Validation failed', 400));
    }
  };
};
