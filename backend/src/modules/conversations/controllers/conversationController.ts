import { Request, Response } from 'express';
import { logger } from '../../../shared/utils/logger';
import { ConversationService } from '../services/conversationService';

export class ConversationController {
  /**
   * קבלת כל השיחות
   */
  static async getAllConversations(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query as { sessionId: string };
      
      if (!sessionId) {
        res.status(400).json({
          status: 'error',
          message: 'מזהה סשן נדרש'
        });
        return;
      }
      
      const conversations = await ConversationService.getConversations(sessionId);
      
      res.status(200).json({
        status: 'success',
        data: conversations
      });
    } catch (error) {
      logger.error('שגיאה בקבלת שיחות:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת השיחות'
      });
    }
  }

  /**
   * קבלת שיחה לפי מזהה
   */
  static async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      
      const conversation = await ConversationService.getConversation(conversationId);
      
      res.status(200).json({
        status: 'success',
        data: conversation
      });
    } catch (error) {
      logger.error('שגיאה בקבלת שיחה:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת השיחה'
      });
    }
  }

  /**
   * מחיקת שיחה
   */
  static async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      
      await ConversationService.deleteConversation(conversationId);
      
      res.status(200).json({
        status: 'success',
        message: 'השיחה נמחקה בהצלחה'
      });
    } catch (error) {
      logger.error('שגיאה במחיקת שיחה:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה במחיקת השיחה'
      });
    }
  }

  /**
   * שליחת הודעה
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { recipient, message, options } = req.body;
      
      logger.info(`שליחת הודעה לנמען ${recipient} בסשן ${sessionId}`);
      
      const result = await ConversationService.sendMessage(sessionId, {
        recipient,
        message,
        options
      });
      
      res.status(200).json({
        status: 'success',
        message: 'ההודעה נשלחה בהצלחה',
        data: {
          id: result.id,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('שגיאה בשליחת הודעה:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בשליחת ההודעה'
      });
    }
  }

  /**
   * שליחת הודעות מרובות
   */
  static async sendBulkMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { recipients, message, options } = req.body;
      
      logger.info(`שליחת הודעה מרובה ל-${recipients.length} נמענים בסשן ${sessionId}`);
      
      const result = await ConversationService.sendBulkMessages(sessionId, {
        recipients,
        message,
        options
      });
      
      res.status(200).json({
        status: 'success',
        message: 'ההודעות נשלחו בהצלחה',
        data: result
      });
    } catch (error) {
      logger.error('שגיאה בשליחת הודעות מרובות:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בשליחת ההודעות'
      });
    }
  }

  /**
   * קבלת הודעות משיחה
   */
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { limit, before } = req.query as { limit?: string; before?: string };
      
      const options = {
        limit: limit ? parseInt(limit, 10) : undefined,
        before: before ? new Date(before) : undefined
      };
      
      const result = await ConversationService.getMessages(conversationId, options);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('שגיאה בקבלת הודעות:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת ההודעות'
      });
    }
  }

  /**
   * שליחת מדיה
   */
  static async sendMedia(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { recipient, mediaType, mediaUrl, caption, filename, options } = req.body;
      
      logger.info(`שליחת מדיה מסוג ${mediaType} לנמען ${recipient} בסשן ${sessionId}`);
      
      const result = await ConversationService.sendMedia(sessionId, {
        recipient,
        mediaType,
        mediaUrl,
        caption,
        filename,
        options
      });
      
      res.status(200).json({
        status: 'success',
        message: 'המדיה נשלחה בהצלחה',
        data: {
          id: result.id,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('שגיאה בשליחת מדיה:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בשליחת המדיה'
      });
    }
  }

  /**
   * קבלת אנשי קשר
   */
  static async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const contacts = await ConversationService.getContacts(sessionId);
      
      res.status(200).json({
        status: 'success',
        data: contacts
      });
    } catch (error) {
      logger.error('שגיאה בקבלת אנשי קשר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת אנשי הקשר'
      });
    }
  }

  /**
   * סנכרון אנשי קשר
   */
  static async syncContacts(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const result = await ConversationService.syncContacts(sessionId);
      
      res.status(200).json({
        status: 'success',
        message: 'אנשי הקשר סונכרנו בהצלחה',
        data: result
      });
    } catch (error) {
      logger.error('שגיאה בסנכרון אנשי קשר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בסנכרון אנשי הקשר'
      });
    }
  }
} 