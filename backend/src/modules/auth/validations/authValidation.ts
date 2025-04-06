import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { logger } from '../../../shared/utils/logger';

export class AuthValidation {
  /**
   * ולידציה להרשמה
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        name: yup.string().required('שם נדרש'),
        email: yup.string().email('אימייל לא תקין').required('אימייל נדרש'),
        password: yup.string()
          .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
          .matches(/[A-Z]/, 'הסיסמה חייבת להכיל לפחות אות גדולה אחת')
          .matches(/[a-z]/, 'הסיסמה חייבת להכיל לפחות אות קטנה אחת')
          .matches(/[0-9]/, 'הסיסמה חייבת להכיל לפחות ספרה אחת')
          .matches(/[!@#$%^&*(),.?":{}|<>]/, 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד')
          .required('סיסמה נדרשת'),
        passwordConfirm: yup.string()
          .oneOf([yup.ref('password')], 'הסיסמאות אינן תואמות')
          .required('אימות סיסמה נדרש')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בהרשמה:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה להתחברות
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        email: yup.string().email('אימייל לא תקין').required('אימייל נדרש'),
        password: yup.string().required('סיסמה נדרשת')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בהתחברות:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה לאיפוס סיסמה
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        email: yup.string().email('אימייל לא תקין').required('אימייל נדרש')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה באיפוס סיסמה:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה לעדכון סיסמה
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        token: yup.string().required('טוקן נדרש'),
        password: yup.string()
          .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
          .matches(/[A-Z]/, 'הסיסמה חייבת להכיל לפחות אות גדולה אחת')
          .matches(/[a-z]/, 'הסיסמה חייבת להכיל לפחות אות קטנה אחת')
          .matches(/[0-9]/, 'הסיסמה חייבת להכיל לפחות ספרה אחת')
          .matches(/[!@#$%^&*(),.?":{}|<>]/, 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד')
          .required('סיסמה נדרשת'),
        passwordConfirm: yup.string()
          .oneOf([yup.ref('password')], 'הסיסמאות אינן תואמות')
          .required('אימות סיסמה נדרש')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בעדכון סיסמה:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה לאימות 2FA
   */
  static async verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        token: yup.string().required('קוד אימות נדרש'),
        email: yup.string().email('אימייל לא תקין').required('אימייל נדרש')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה באימות 2FA:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה לעדכון פרופיל
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        name: yup.string(),
        email: yup.string().email('אימייל לא תקין'),
        phone: yup.string().matches(/^\d+$/, 'מספר טלפון לא תקין'),
        avatar: yup.string().url()
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בעדכון פרופיל:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
} 