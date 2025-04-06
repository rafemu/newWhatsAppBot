import { PhoneConnection, IPhoneConnection } from '../models/PhoneConnection';
import { logger } from '../../../shared/utils/logger';
import { ConversationService } from '../../conversations/services/conversationService';
import mongoose from 'mongoose';

/**
 * שירות לניהול קישורי טלפון
 */
export class PhoneConnectionService {
  /**
   * מקבל את כל קישורי הטלפון לפי פילטרים
   * @param filters פילטרים אופציונליים
   */
  static async getPhoneConnections(filters: {
    status?: string;
    tags?: string[];
    linkedSurvey?: string;
    campaign?: string;
    search?: string;
    lastContactAfter?: Date;
    lastContactBefore?: Date;
  } = {}): Promise<IPhoneConnection[]> {
    try {
      const query: any = {};
      
      // הוספת פילטרים לשאילתה
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      
      if (filters.linkedSurvey) {
        query.linkedSurveys = new mongoose.Types.ObjectId(filters.linkedSurvey);
      }
      
      if (filters.campaign) {
        query.campaigns = new mongoose.Types.ObjectId(filters.campaign);
      }
      
      if (filters.search) {
        query.$or = [
          { phoneNumber: { $regex: filters.search, $options: 'i' } },
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }
      
      if (filters.lastContactAfter || filters.lastContactBefore) {
        query.lastContact = {};
        
        if (filters.lastContactAfter) {
          query.lastContact.$gte = filters.lastContactAfter;
        }
        
        if (filters.lastContactBefore) {
          query.lastContact.$lte = filters.lastContactBefore;
        }
      }
      
      return await PhoneConnection.find(query)
        .sort({ lastContact: -1 })
        .exec();
    } catch (error) {
      logger.error('שגיאה בקבלת קישורי טלפון:', error);
      throw error;
    }
  }

  /**
   * מקבל קישור טלפון לפי מספר
   * @param phoneNumber מספר טלפון
   */
  static async getPhoneConnection(phoneNumber: string): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOne({ phoneNumber });
    } catch (error) {
      logger.error(`שגיאה בקבלת קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * יוצר קישור טלפון חדש
   * @param phoneData נתוני הטלפון
   */
  static async createPhoneConnection(phoneData: Partial<IPhoneConnection>): Promise<IPhoneConnection> {
    try {
      // בדיקה האם קישור כבר קיים
      const existingConnection = await PhoneConnection.findOne({ 
        phoneNumber: phoneData.phoneNumber 
      });
      
      if (existingConnection) {
        throw new Error(`קישור טלפון למספר ${phoneData.phoneNumber} כבר קיים`);
      }
      
      const newPhoneConnection = new PhoneConnection(phoneData);
      return await newPhoneConnection.save();
    } catch (error) {
      logger.error('שגיאה ביצירת קישור טלפון:', error);
      throw error;
    }
  }

  /**
   * מעדכן קישור טלפון קיים
   * @param phoneNumber מספר טלפון
   * @param updateData נתונים לעדכון
   */
  static async updatePhoneConnection(
    phoneNumber: string,
    updateData: Partial<IPhoneConnection>
  ): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      logger.error(`שגיאה בעדכון קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * מוחק קישור טלפון
   * @param phoneNumber מספר טלפון
   */
  static async deletePhoneConnection(phoneNumber: string): Promise<boolean> {
    try {
      const result = await PhoneConnection.deleteOne({ phoneNumber });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`שגיאה במחיקת קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * מקשר טלפון לסקר
   * @param phoneNumber מספר טלפון
   * @param surveyId מזהה הסקר
   */
  static async linkPhoneToSurvey(
    phoneNumber: string,
    surveyId: string
  ): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        { $addToSet: { linkedSurveys: new mongoose.Types.ObjectId(surveyId) } },
        { new: true, upsert: true }
      );
    } catch (error) {
      logger.error(`שגיאה בקישור טלפון ${phoneNumber} לסקר ${surveyId}:`, error);
      throw error;
    }
  }

  /**
   * מקשר טלפון לקמפיין
   * @param phoneNumber מספר טלפון
   * @param campaignId מזהה הקמפיין
   */
  static async linkPhoneToCampaign(
    phoneNumber: string,
    campaignId: string
  ): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        { $addToSet: { campaigns: new mongoose.Types.ObjectId(campaignId) } },
        { new: true, upsert: true }
      );
    } catch (error) {
      logger.error(`שגיאה בקישור טלפון ${phoneNumber} לקמפיין ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * מוסיף תגיות למספר טלפון
   * @param phoneNumber מספר טלפון
   * @param tags תגיות להוספה
   */
  static async addTagsToPhone(
    phoneNumber: string,
    tags: string[]
  ): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        { $addToSet: { tags: { $each: tags } } },
        { new: true, upsert: true }
      );
    } catch (error) {
      logger.error(`שגיאה בהוספת תגיות למספר טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * מסיר תגיות ממספר טלפון
   * @param phoneNumber מספר טלפון
   * @param tags תגיות להסרה
   */
  static async removeTagsFromPhone(
    phoneNumber: string,
    tags: string[]
  ): Promise<IPhoneConnection | null> {
    try {
      return await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        { $pull: { tags: { $in: tags } } },
        { new: true }
      );
    } catch (error) {
      logger.error(`שגיאה בהסרת תגיות ממספר טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * מסנכרן שיחות למאגר הקשרים
   * @param sessionId מזהה הסשן
   */
  static async syncConversationsToPhoneConnections(sessionId: string): Promise<{
    total: number;
    new: number;
    updated: number;
  }> {
    try {
      const stats = {
        total: 0,
        new: 0,
        updated: 0,
      };
      
      // קבלת כל השיחות מהסשן
      const conversations = await ConversationService.getConversations({ sessionId });
      stats.total = conversations.length;
      
      for (const conversation of conversations) {
        if (!conversation.contact || !conversation.contact.phoneNumber) {
          continue;
        }
        
        const phoneNumber = conversation.contact.phoneNumber;
        const existingConnection = await PhoneConnection.findOne({ phoneNumber });
        
        const connectionData: Partial<IPhoneConnection> = {
          phoneNumber,
          name: conversation.contact.name || undefined,
          lastContact: conversation.updatedAt || new Date(),
        };
        
        if (existingConnection) {
          // עדכון קשר קיים
          await PhoneConnection.updateOne(
            { phoneNumber },
            { 
              $set: { 
                ...connectionData,
                lastContact: connectionData.lastContact
              } 
            }
          );
          stats.updated++;
        } else {
          // יצירת קשר חדש
          await PhoneConnection.create({
            ...connectionData,
            tags: [],
            metadata: {},
            status: 'active',
            optOut: false,
          });
          stats.new++;
        }
      }
      
      return stats;
    } catch (error) {
      logger.error(`שגיאה בסנכרון שיחות למאגר הקשרים:`, error);
      throw error;
    }
  }
} 