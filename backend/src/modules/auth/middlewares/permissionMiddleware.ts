import { Request, Response, NextFunction } from 'express';
import { AppErrorImpl as AppError } from '../../../shared/middlewares/errorHandler';
import { logger } from '../../../shared/utils/logger';

/**
 * פונקציית מידלוואר להגבלת גישה לפי הרשאות
 * @param permissions - רשימת הרשאות נדרשות
 */
export const restrictTo = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // בדיקה אם המשתמש מחובר ויש לו מידע
    if (!req.user) {
      return next(new AppError('אינך מחובר, אנא התחבר כדי לגשת למשאב זה', 401));
    }

    // בדיקה אם יש מידע על משתמש
    logger.debug(`בדיקת הרשאות למשתמש: ${JSON.stringify(req.user)}`);

    // אם המשתמש הוא מנהל מערכת, מאפשרים גישה לכל דבר
    if (req.user.role === 'ADMIN' || req.user.role === 'admin') {
      logger.debug('משתמש הוא מנהל - גישה מאושרת');
      return next();
    }

    // בדיקה אם למשתמש יש את ההרשאות הנדרשות
    if (!req.user.permissions) {
      logger.debug('למשתמש אין הרשאות מוגדרות');
      return next(new AppError('אין לך הרשאה לבצע פעולה זו', 403));
    }

    const userPermissions = Array.isArray(req.user.permissions) 
      ? req.user.permissions 
      : [];

    logger.debug(`הרשאות משתמש: ${userPermissions.join(', ')}`);
    logger.debug(`הרשאות נדרשות: ${permissions.join(', ')}`);

    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.debug('הרשאה נדחתה');
      return next(
        new AppError(
          'אין לך הרשאה לבצע פעולה זו', 
          403
        )
      );
    }

    logger.debug('הרשאה אושרה');
    next();
  };
}; 