import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { logger } from '../../../shared/utils/logger';

export class SessionValidation {
  /**
   * ולידציה ליצירת סשן WhatsApp
   */
  static async init(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        name: yup.string().required('שם הסשן נדרש'),
        description: yup.string(),
        autoReconnect: yup.boolean().default(true)
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה ביצירת סשן:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
  
  /**
   * ולידציה להוספת מכשיר לסשן
   */
  static async addDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        deviceName: yup.string().required('שם המכשיר נדרש').min(2, 'שם המכשיר חייב להכיל לפחות 2 תווים').max(50, 'שם המכשיר ארוך מדי')
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בהוספת מכשיר:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * ולידציה לעדכון הגדרות סשן
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = yup.object({
        name: yup.string(),
        description: yup.string(),
        autoReconnect: yup.boolean(),
        messageDelay: yup.number().min(0).max(5000),
        webhookUrl: yup.string().url().nullable(),
        notifications: yup.object({
          enabled: yup.boolean(),
          email: yup.string().email(),
          onDisconnect: yup.boolean(),
          onMessage: yup.boolean()
        }).notRequired()
      });

      await schema.validate(req.body);
      next();
    } catch (error) {
      logger.error('שגיאת ולידציה בעדכון הגדרות סשן:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
} 