import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validateRequestSchema = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // ביצוע כל פעולות הוולידציה
    await Promise.all(validations.map(validation => validation.run(req)));

    // בדיקה אם יש שגיאות
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // החזרת שגיאות אם יש
    return res.status(400).json({
      status: 'error',
      message: 'נתונים לא תקינים',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  };
}; 