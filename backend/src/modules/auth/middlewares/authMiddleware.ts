import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { AppError } from '../../../shared/utils/appError';
import { config } from '../../../config';
import { Permission, hasPermission } from '../config/permissions';
import { logger } from '../../../shared/utils/logger';

// הרחבת הטיפוס Request להכיל מידע על המשתמש
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        permissions?: string[];
      };
    }
  }
}

interface DecodedToken {
  id: string;
  role: UserRole;
  permissions?: string[];
  iat: number;
  exp: number;
}

interface AuthRequest extends Request {
  user?: DecodedToken;
}

export class AuthMiddleware {
  /**
   * מידלוור לאימות משתמש לפי טוקן JWT
   */
  static authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      // קבלת טוקן מה-header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          status: 'error',
          message: 'אין הרשאה, נדרש אימות'
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      // אימות טוקן
      const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
      
      // הוספת מידע המשתמש לבקשה
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('שגיאת אימות:', error);
      res.status(401).json({
        status: 'error',
        message: 'אין הרשאה, נדרש אימות'
      });
    }
  }

  /**
   * בדיקת הרשאות לפי תפקיד
   */
  static authorize(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'אין הרשאה, נדרש אימות'
        });
        return;
      }

      if (!roles.includes(req.user.role as string)) {
        res.status(403).json({
          status: 'error',
          message: 'אין הרשאה לגשת למשאב זה'
        });
        return;
      }

      next();
    };
  }

  /**
   * בדיקת אימות משתמש
   */
  static protect = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // בדיקת קיום טוקן
      let token;
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        throw new AppError('נא להתחבר כדי לגשת למשאב זה', 401);
      }

      // אימות הטוקן
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        role: UserRole;
        permissions?: string[];
      };

      // בדיקה שהמשתמש עדיין קיים
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('המשתמש אינו קיים יותר', 401);
      }

      // הוספת מידע המשתמש לבקשה
      req.user = {
        id: decoded.id,
        role: decoded.role,
        permissions: decoded.permissions || []
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * הגבלת גישה לתפקידים מסוימים
   */
  static restrictTo = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('נא להתחבר כדי לגשת למשאב זה', 401));
      }

      if (!roles.includes(req.user.role)) {
        return next(new AppError('אין לך הרשאה לבצע פעולה זו', 403));
      }

      next();
    };
  };

  /**
   * בדיקת הרשאה ספציפית
   */
  static requirePermission = (permission: Permission) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('נא להתחבר כדי לגשת למשאב זה', 401));
      }

      if (!hasPermission(req.user.role, permission)) {
        return next(new AppError('אין לך הרשאה לבצע פעולה זו', 403));
      }

      next();
    };
  };

  /**
   * בדיקת מספר הרשאות
   */
  static requirePermissions = (permissions: Permission[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('נא להתחבר כדי לגשת למשאב זה', 401));
      }

      const hasAllPermissions = permissions.every(permission =>
        hasPermission(req.user!.role, permission)
      );

      if (!hasAllPermissions) {
        return next(new AppError('אין לך את כל ההרשאות הנדרשות לבצע פעולה זו', 403));
      }

      next();
    };
  };

  /**
   * וידוא שהמשתמש מנסה לגשת למשאבים שלו בלבד
   */
  static checkOwnership = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('נא להתחבר כדי לגשת למשאב זה', 401));
    }

    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    if (req.params.userId && req.params.userId !== req.user.id) {
      throw new AppError('אין לך הרשאה לגשת למשאבים של משתמשים אחרים', 403);
    }
    next();
  };
}

// ייצוא מופע של המחלקה
export const authMiddleware = {
  protect: AuthMiddleware.protect,
  restrictTo: AuthMiddleware.restrictTo,
  authenticate: AuthMiddleware.authenticate, 
  authorize: AuthMiddleware.authorize,
  requirePermission: AuthMiddleware.requirePermission,
  requirePermissions: AuthMiddleware.requirePermissions,
  checkOwnership: AuthMiddleware.checkOwnership
}; 