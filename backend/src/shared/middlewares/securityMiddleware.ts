import { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { Express } from 'express';
import { logger } from '../utils/logger';
import { authConfig } from '../../modules/auth/config/auth.config';

export class SecurityMiddleware {
  /**
   * הגדרת כל אמצעי האבטחה
   */
  static setupSecurity(app: Application): void {
    // הגנה מפני XSS והגדרת HTTP Headers
    app.use(helmet());

    // הגבלת קצב בקשות כללית
    const limiter = rateLimit({
      max: 100, // limit each IP to 100 requests per windowMs
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many requests from this IP, please try again in an hour!'
    });
    app.use('/api', limiter);

    // הגנה מפני NoSQL Injection
    app.use(mongoSanitize());

    // הגנה מפני Parameter Pollution
    app.use(hpp());

    // רישום ניסיונות התחברות כושלים
    app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function (body) {
        if (
          (req.path === '/api/auth/login' || req.path === '/api/auth/verify-2fa') &&
          res.statusCode === 401
        ) {
          logger.warn(`ניסיון התחברות כושל מ-IP: ${req.ip}`);
        }
        return originalSend.call(this, body);
      };
      next();
    });

    logger.info('אמצעי אבטחה הוגדרו בהצלחה');
  }

  /**
   * בדיקת חוזק סיסמה
   */
  static validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  /**
   * סניטציה של קלט משתמש
   */
  static sanitizeUserInput(input: string): string {
    // הסרת תווים מסוכנים
    return input
      .replace(/[<>]/g, '') // הסרת תגיות HTML
      .replace(/[;]/g, '') // הסרת נקודה-פסיק
      .trim(); // הסרת רווחים מיותרים
  }

  public rateLimiter(type: 'auth' | 'general') {
    const config = type === 'auth' ? authConfig.rateLimit.auth : authConfig.rateLimit.general;
    
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: {
        status: 'error',
        message: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
      },
    });
  }
} 