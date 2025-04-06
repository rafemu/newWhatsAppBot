import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../../../shared/utils/appError';

export class ValidationMiddleware {
  public validate = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');
        return next(new AppError(errorMessage, 400));
      }

      next();
    };
  };

  public validateParams = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.params, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');
        return next(new AppError(errorMessage, 400));
      }

      next();
    };
  };

  public validateQuery = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.query, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');
        return next(new AppError(errorMessage, 400));
      }

      next();
    };
  };
} 