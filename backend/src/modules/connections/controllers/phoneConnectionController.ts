import { Request, Response } from 'express';
import { PhoneConnectionService } from '../services/phoneConnectionService';
import { logger } from '../../../shared/utils/logger';

/**
 * בקר לניהול קישורי טלפון
 */
export class PhoneConnectionController {
  /**
   * קבלת כל קישורי הטלפון
   */
  static async getPhoneConnections(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        linkedSurvey: req.query.linkedSurvey as string,
        campaign: req.query.campaign as string,
        search: req.query.search as string,
        lastContactAfter: req.query.lastContactAfter ? new Date(req.query.lastContactAfter as string) : undefined,
        lastContactBefore: req.query.lastContactBefore ? new Date(req.query.lastContactBefore as string) : undefined,
      };

      const connections = await PhoneConnectionService.getPhoneConnections(filters);
      res.status(200).json(connections);
    } catch (error) {
      logger.error('שגיאה בקבלת קישורי טלפון:', error);
      res.status(500).json({ error: 'שגיאה בשרת בעת קבלת קישורי טלפון' });
    }
  }

  /**
   * קבלת קישור טלפון ספציפי
   */
  static async getPhoneConnection(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const connection = await PhoneConnectionService.getPhoneConnection(phoneNumber);
      
      if (!connection) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      logger.error(`שגיאה בקבלת קישור טלפון ${req.params.phoneNumber}:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת קבלת קישור טלפון' });
    }
  }

  /**
   * יצירת קישור טלפון חדש
   */
  static async createPhoneConnection(req: Request, res: Response): Promise<void> {
    try {
      const phoneData = req.body;
      const connection = await PhoneConnectionService.createPhoneConnection(phoneData);
      res.status(201).json(connection);
    } catch (error) {
      logger.error('שגיאה ביצירת קישור טלפון:', error);
      let status = 500;
      let message = 'שגיאה בשרת בעת יצירת קישור טלפון';
      
      if (error instanceof Error && error.message.includes('כבר קיים')) {
        status = 409;
        message = error.message;
      }
      
      res.status(status).json({ error: message });
    }
  }

  /**
   * עדכון קישור טלפון קיים
   */
  static async updatePhoneConnection(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const updateData = req.body;
      
      const connection = await PhoneConnectionService.updatePhoneConnection(phoneNumber, updateData);
      
      if (!connection) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      logger.error(`שגיאה בעדכון קישור טלפון ${req.params.phoneNumber}:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת עדכון קישור טלפון' });
    }
  }

  /**
   * מחיקת קישור טלפון
   */
  static async deletePhoneConnection(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const result = await PhoneConnectionService.deletePhoneConnection(phoneNumber);
      
      if (!result) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'קישור טלפון נמחק בהצלחה' });
    } catch (error) {
      logger.error(`שגיאה במחיקת קישור טלפון ${req.params.phoneNumber}:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת מחיקת קישור טלפון' });
    }
  }

  /**
   * קישור טלפון לסקר
   */
  static async linkPhoneToSurvey(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const { surveyId } = req.body;
      
      if (!surveyId) {
        res.status(400).json({ error: 'חסר מזהה סקר' });
        return;
      }
      
      const connection = await PhoneConnectionService.linkPhoneToSurvey(phoneNumber, surveyId);
      
      if (!connection) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      logger.error(`שגיאה בקישור טלפון ${req.params.phoneNumber} לסקר:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת קישור טלפון לסקר' });
    }
  }

  /**
   * קישור טלפון לקמפיין
   */
  static async linkPhoneToCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const { campaignId } = req.body;
      
      if (!campaignId) {
        res.status(400).json({ error: 'חסר מזהה קמפיין' });
        return;
      }
      
      const connection = await PhoneConnectionService.linkPhoneToCampaign(phoneNumber, campaignId);
      
      if (!connection) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      logger.error(`שגיאה בקישור טלפון ${req.params.phoneNumber} לקמפיין:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת קישור טלפון לקמפיין' });
    }
  }

  /**
   * הוספת תגיות למספר טלפון
   */
  static async addTagsToPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const { tags } = req.body;
      
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        res.status(400).json({ error: 'יש לספק מערך תגיות תקין' });
        return;
      }
      
      const connection = await PhoneConnectionService.addTagsToPhone(phoneNumber, tags);
      
      if (!connection) {
        res.status(404).json({ error: 'קישור טלפון לא נמצא' });
        return;
      }
      
      res.status(200).json(connection);
    } catch (error) {
      logger.error(`שגיאה בהוספת תגיות למספר טלפון ${req.params.phoneNumber}:`, error);
      res.status(500).json({ error: 'שגיאה בשרת בעת הוספת תגיות למספר טלפון' });
    }
  }

  /**
   * סנכרון שיחות למאגר הקשרים
   */
  static async syncConversationsToPhoneConnections(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        res.status(400).json({ error: 'חסר מזהה סשן' });
        return;
      }
      
      const results = await PhoneConnectionService.syncConversationsToPhoneConnections(sessionId);
      
      res.status(200).json(results);
    } catch (error) {
      logger.error('שגיאה בסנכרון שיחות למאגר הקשרים:', error);
      res.status(500).json({ error: 'שגיאה בשרת בעת סנכרון שיחות למאגר הקשרים' });
    }
  }
} 