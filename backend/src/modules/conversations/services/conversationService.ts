import { Conversation, IConversation, IMessage } from '../models/Conversation';
import { WhatsAppService } from '../../sessions/services/whatsappService';
import { logger } from '../../../shared/utils/logger';

export class ConversationService {
  /**
   * קבלת כל השיחות של סשן
   */
  static async getConversations(sessionId: string): Promise<IConversation[]> {
    try {
      return await Conversation.find({ session: sessionId }).sort({ updatedAt: -1 }).limit(100);
    } catch (error) {
      logger.error(`שגיאה בקבלת שיחות לסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * קבלת שיחה לפי מזהה
   */
  static async getConversation(conversationId: string): Promise<IConversation> {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error(`שיחה עם מזהה ${conversationId} לא נמצאה`);
      }
      
      return conversation;
    } catch (error) {
      logger.error(`שגיאה בקבלת שיחה ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * מחיקת שיחה
   */
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const result = await Conversation.findByIdAndDelete(conversationId);
      return !!result;
    } catch (error) {
      logger.error(`שגיאה במחיקת שיחה ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * שליחת הודעה
   */
  static async sendMessage(
    sessionId: string,
    data: {
      recipient: string;
      message: string;
      options?: {
        quotedMessageId?: string;
        mentionedIds?: string[];
        linkPreview?: boolean;
        scheduledTime?: Date;
      };
    }
  ): Promise<{ id: string; conversation: IConversation }> {
    try {
      // שליחת הודעה דרך שירות ה-WhatsApp
      const messageResult = await WhatsAppService.sendMessage(
        sessionId,
        data.recipient,
        data.message
      );

      // בדיקה אם קיימת כבר שיחה עם איש הקשר
      let conversation = await Conversation.findOne({
        session: sessionId,
        'contact.phone': data.recipient,
      });

      // אם לא קיימת שיחה, יצירת שיחה חדשה
      if (!conversation) {
        conversation = await Conversation.create({
          session: sessionId,
          contact: {
            name: `משתמש ${data.recipient}`,
            phone: data.recipient,
          },
          messages: [],
          unreadCount: 0,
        });
      }

      // הוספת ההודעה לשיחה
      const newMessage: IMessage = {
        id: messageResult.id,
        text: data.message,
        timestamp: new Date(),
        from: 'system',
        fromMe: true,
        status: 'sent',
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = {
        text: data.message,
        timestamp: new Date(),
      };
      
      await conversation.save();

      return {
        id: messageResult.id,
        conversation,
      };
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעה בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * שליחת הודעות מרובות
   */
  static async sendBulkMessages(
    sessionId: string,
    data: {
      recipients: string[];
      message: string;
      options?: {
        delay?: number;
        linkPreview?: boolean;
        scheduledTime?: Date;
      };
    }
  ): Promise<{ totalSent: number; failed: number; messageIds: string[] }> {
    try {
      const results = {
        totalSent: 0,
        failed: 0,
        messageIds: [] as string[],
      };

      // שליחת הודעה לכל נמען בנפרד
      for (const recipient of data.recipients) {
        try {
          // הוספת השהייה בין ההודעות אם מבוקש
          if (data.options?.delay && results.totalSent > 0) {
            await new Promise(resolve => setTimeout(resolve, data.options.delay));
          }

          const result = await this.sendMessage(sessionId, {
            recipient,
            message: data.message,
            options: {
              linkPreview: data.options?.linkPreview,
            },
          });

          results.totalSent++;
          results.messageIds.push(result.id);
        } catch (error) {
          logger.error(`שגיאה בשליחת הודעה לנמען ${recipient}:`, error);
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעות מרובות בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * קבלת הודעות משיחה
   */
  static async getMessages(
    conversationId: string,
    options: { limit?: number; before?: Date } = {}
  ): Promise<{ messages: IMessage[]; hasMore: boolean }> {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error(`שיחה עם מזהה ${conversationId} לא נמצאה`);
      }
      
      const limit = options.limit || 50;
      let messages = [...conversation.messages];
      
      if (options.before) {
        messages = messages.filter(msg => msg.timestamp < options.before!);
      }
      
      // מיון הודעות מהחדשה לישנה
      messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const hasMore = messages.length > limit;
      const limitedMessages = messages.slice(0, limit);
      
      return {
        messages: limitedMessages,
        hasMore,
      };
    } catch (error) {
      logger.error(`שגיאה בקבלת הודעות משיחה ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * שליחת מדיה
   */
  static async sendMedia(
    sessionId: string,
    data: {
      recipient: string;
      mediaType: 'image' | 'video' | 'audio' | 'document';
      mediaUrl: string;
      caption?: string;
      filename?: string;
      options?: {
        quotedMessageId?: string;
        scheduledTime?: Date;
      };
    }
  ): Promise<{ id: string; conversation: IConversation }> {
    try {
      // במציאות, כאן נשתמש בספריית WhatsApp לשליחת מדיה
      // לצורך הדוגמה, נשתמש בשירות ה-WhatsApp כדי ליצור הודעה מדומה
      const messageResult = await WhatsAppService.sendMessage(
        sessionId,
        data.recipient,
        data.caption || '(מדיה)'
      );

      // בדיקה אם קיימת כבר שיחה עם איש הקשר
      let conversation = await Conversation.findOne({
        session: sessionId,
        'contact.phone': data.recipient,
      });

      // אם לא קיימת שיחה, יצירת שיחה חדשה
      if (!conversation) {
        conversation = await Conversation.create({
          session: sessionId,
          contact: {
            name: `משתמש ${data.recipient}`,
            phone: data.recipient,
          },
          messages: [],
          unreadCount: 0,
        });
      }

      // הוספת ההודעה לשיחה
      const newMessage: IMessage = {
        id: messageResult.id,
        caption: data.caption,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        timestamp: new Date(),
        from: 'system',
        fromMe: true,
        status: 'sent',
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = {
        text: data.caption || `(${data.mediaType})`,
        timestamp: new Date(),
      };
      
      await conversation.save();

      return {
        id: messageResult.id,
        conversation,
      };
    } catch (error) {
      logger.error(`שגיאה בשליחת מדיה בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * קבלת אנשי קשר
   */
  static async getContacts(sessionId: string): Promise<{ name: string; phone: string; profilePicture?: string }[]> {
    try {
      // במציאות, כאן נשתמש בספריית WhatsApp לקבלת אנשי קשר
      // לצורך הדוגמה, נחזיר אנשי קשר לדוגמה
      // ניתן גם לחלץ אנשי קשר מהשיחות הקיימות
      
      const conversations = await Conversation.find({ session: sessionId });
      
      return conversations.map(conversation => ({
        name: conversation.contact.name,
        phone: conversation.contact.phone,
        profilePicture: conversation.contact.profilePicture,
      }));
    } catch (error) {
      logger.error(`שגיאה בקבלת אנשי קשר מסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * סנכרון אנשי קשר
   */
  static async syncContacts(sessionId: string): Promise<{ total: number; new: number; updated: number }> {
    try {
      // במציאות, כאן נשתמש בספריית WhatsApp לסנכרון אנשי קשר
      // לצורך הדוגמה, נחזיר תוצאות מדומות
      
      return {
        total: 0,
        new: 0,
        updated: 0,
      };
    } catch (error) {
      logger.error(`שגיאה בסנכרון אנשי קשר בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * שליחת הודעת רשימה
   */
  static async sendListMessage(
    sessionId: string,
    data: {
      recipient: string;
      title: string;
      description: string;
      buttonText: string;
      sections: {
        title: string;
        options: {
          id: string;
          title: string;
          description?: string;
        }[];
      }[];
      options?: {
        quotedMessageId?: string;
        scheduledTime?: Date;
      };
    }
  ): Promise<{ id: string; conversation: IConversation }> {
    try {
      // שימוש בשירות וואטסאפ לשליחת הודעת רשימה
      const messageResult = await WhatsAppService.sendListMessage(
        sessionId,
        data.recipient,
        data.title,
        data.description,
        data.buttonText,
        data.sections
      );

      // בדיקה אם קיימת כבר שיחה עם איש הקשר
      let conversation = await Conversation.findOne({
        session: sessionId,
        'contact.phone': data.recipient,
      });

      // אם לא קיימת שיחה, יצירת שיחה חדשה
      if (!conversation) {
        conversation = await Conversation.create({
          session: sessionId,
          contact: {
            name: `משתמש ${data.recipient}`,
            phone: data.recipient,
          },
          messages: [],
          unreadCount: 0,
        });
      }

      // הוספת ההודעה לשיחה
      const newMessage: IMessage = {
        id: messageResult.id,
        text: data.description,
        timestamp: new Date(),
        from: 'system',
        fromMe: true,
        metadata: {
          messageType: 'list',
          title: data.title,
          buttonText: data.buttonText,
          sections: data.sections,
        },
        status: 'sent',
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = {
        text: `רשימה: ${data.title}`,
        timestamp: new Date(),
      };
      
      await conversation.save();

      return {
        id: messageResult.id,
        conversation,
      };
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעת רשימה בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * שליחת הודעה עם כפתורים
   */
  static async sendButtonMessage(
    sessionId: string,
    data: {
      recipient: string;
      title: string;
      buttons: {
        id: string;
        text: string;
      }[];
      options?: {
        quotedMessageId?: string;
        scheduledTime?: Date;
      };
    }
  ): Promise<{ id: string; conversation: IConversation }> {
    try {
      // שימוש בשירות וואטסאפ לשליחת הודעה עם כפתורים
      const messageResult = await WhatsAppService.sendButtonMessage(
        sessionId,
        data.recipient,
        data.title,
        data.buttons
      );

      // בדיקה אם קיימת כבר שיחה עם איש הקשר
      let conversation = await Conversation.findOne({
        session: sessionId,
        'contact.phone': data.recipient,
      });

      // אם לא קיימת שיחה, יצירת שיחה חדשה
      if (!conversation) {
        conversation = await Conversation.create({
          session: sessionId,
          contact: {
            name: `משתמש ${data.recipient}`,
            phone: data.recipient,
          },
          messages: [],
          unreadCount: 0,
        });
      }

      // הוספת ההודעה לשיחה
      const newMessage: IMessage = {
        id: messageResult.id,
        text: data.title,
        timestamp: new Date(),
        from: 'system',
        fromMe: true,
        metadata: {
          messageType: 'button',
          buttons: data.buttons,
        },
        status: 'sent',
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = {
        text: `כפתורים: ${data.title}`,
        timestamp: new Date(),
      };
      
      await conversation.save();

      return {
        id: messageResult.id,
        conversation,
      };
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעה עם כפתורים בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * רישום מטפל הודעות נכנסות
   */
  static async registerMessageHandler(
    sessionId: string,
    handler: (message: any) => Promise<void>
  ): Promise<boolean> {
    try {
      return await WhatsAppService.registerMessageHandler(sessionId, handler);
    } catch (error) {
      logger.error(`שגיאה ברישום מטפל הודעות בסשן ${sessionId}:`, error);
      throw error;
    }
  }
} 