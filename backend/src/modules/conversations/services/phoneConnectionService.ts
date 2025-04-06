import { PhoneConnection, IPhoneConnection } from '../models/PhoneConnection';
import { Conversation } from '../models/Conversation';
import { logger } from '../../../utils/logger';
import mongoose from 'mongoose';

export class PhoneConnectionService {
  /**
   * יצירת קישור טלפון חדש
   */
  static async createPhoneConnection(phoneData: Partial<IPhoneConnection>): Promise<IPhoneConnection> {
    try {
      // בדיקה אם מספר הטלפון כבר קיים
      const existingPhone = await PhoneConnection.findOne({
        phoneNumber: phoneData.phoneNumber,
      });
      
      if (existingPhone) {
        logger.info(`מספר טלפון ${phoneData.phoneNumber} כבר קיים, מעדכן נתונים`);
        Object.assign(existingPhone, phoneData);
        await existingPhone.save();
        return existingPhone;
      }
      
      // יצירת קישור חדש
      const phone = await PhoneConnection.create(phoneData);
      logger.info(`קישור טלפון חדש נוצר: ${phone.phoneNumber}`);
      return phone;
    } catch (error) {
      logger.error('שגיאה ביצירת קישור טלפון:', error);
      throw error;
    }
  }

  /**
   * עדכון קישור טלפון קיים
   */
  static async updatePhoneConnection(
    phoneNumber: string,
    phoneData: Partial<IPhoneConnection>
  ): Promise<IPhoneConnection | null> {
    try {
      const phone = await PhoneConnection.findOneAndUpdate(
        { phoneNumber },
        phoneData,
        { new: true }
      );
      
      if (!phone) {
        logger.warn(`קישור למספר טלפון ${phoneNumber} לא נמצא`);
        return null;
      }
      
      logger.info(`קישור למספר טלפון ${phoneNumber} עודכן`);
      return phone;
    } catch (error) {
      logger.error(`שגיאה בעדכון קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * מחיקת קישור טלפון
   */
  static async deletePhoneConnection(phoneNumber: string): Promise<boolean> {
    try {
      const phone = await PhoneConnection.findOneAndDelete({ phoneNumber });
      if (!phone) {
        logger.warn(`קישור למספר טלפון ${phoneNumber} לא נמצא`);
        return false;
      }
      
      logger.info(`קישור למספר טלפון ${phoneNumber} נמחק`);
      return true;
    } catch (error) {
      logger.error(`שגיאה במחיקת קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * קבלת קישור טלפון לפי מספר
   */
  static async getPhoneConnection(phoneNumber: string): Promise<IPhoneConnection | null> {
    try {
      const phone = await PhoneConnection.findOne({ phoneNumber })
        .populate('linkedSurveys')
        .populate('campaigns');
        
      return phone;
    } catch (error) {
      logger.error(`שגיאה בקבלת קישור טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * קבלת כל קישורי הטלפון
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
      let query: any = {};
      
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
      
      const phones = await PhoneConnection.find(query)
        .sort({ lastContact: -1 })
        .populate('linkedSurveys')
        .populate('campaigns');
        
      return phones;
    } catch (error) {
      logger.error('שגיאה בקבלת רשימת קישורי טלפון:', error);
      throw error;
    }
  }
  
  /**
   * קישור טלפון לסקר
   */
  static async linkPhoneToSurvey(
    phoneNumber: string,
    surveyId: string
  ): Promise<IPhoneConnection | null> {
    try {
      // בדיקה אם מספר הטלפון קיים
      let phone = await PhoneConnection.findOne({ phoneNumber });
      
      // יצירת קישור חדש אם לא קיים
      if (!phone) {
        phone = await PhoneConnection.create({
          phoneNumber,
          status: 'active',
        });
      }
      
      // הוספת הסקר לרשימת הקישורים
      phone.linkedSurveys = [...(phone.linkedSurveys || []), new mongoose.Types.ObjectId(surveyId)];
      phone.linkedSurveys = [...new Set(phone.linkedSurveys.map(id => id.toString()))].map(
        id => new mongoose.Types.ObjectId(id)
      );
      
      await phone.save();
      logger.info(`מספר טלפון ${phoneNumber} קושר לסקר ${surveyId}`);
      
      return phone;
    } catch (error) {
      logger.error(`שגיאה בקישור מספר טלפון ${phoneNumber} לסקר ${surveyId}:`, error);
      throw error;
    }
  }
  
  /**
   * קישור טלפון לקמפיין
   */
  static async linkPhoneToCampaign(
    phoneNumber: string,
    campaignId: string
  ): Promise<IPhoneConnection | null> {
    try {
      // בדיקה אם מספר הטלפון קיים
      let phone = await PhoneConnection.findOne({ phoneNumber });
      
      // יצירת קישור חדש אם לא קיים
      if (!phone) {
        phone = await PhoneConnection.create({
          phoneNumber,
          status: 'active',
        });
      }
      
      // הוספת הקמפיין לרשימת הקישורים
      phone.campaigns = [...(phone.campaigns || []), new mongoose.Types.ObjectId(campaignId)];
      phone.campaigns = [...new Set(phone.campaigns.map(id => id.toString()))].map(
        id => new mongoose.Types.ObjectId(id)
      );
      
      await phone.save();
      logger.info(`מספר טלפון ${phoneNumber} קושר לקמפיין ${campaignId}`);
      
      return phone;
    } catch (error) {
      logger.error(`שגיאה בקישור מספר טלפון ${phoneNumber} לקמפיין ${campaignId}:`, error);
      throw error;
    }
  }
  
  /**
   * הוספת תגיות למספר טלפון
   */
  static async addTagsToPhone(
    phoneNumber: string,
    tags: string[]
  ): Promise<IPhoneConnection | null> {
    try {
      // בדיקה אם מספר הטלפון קיים
      let phone = await PhoneConnection.findOne({ phoneNumber });
      
      // יצירת קישור חדש אם לא קיים
      if (!phone) {
        phone = await PhoneConnection.create({
          phoneNumber,
          status: 'active',
          tags: tags,
        });
      } else {
        // הוספת תגיות חדשות
        phone.tags = [...new Set([...(phone.tags || []), ...tags])];
        await phone.save();
      }
      
      logger.info(`תגיות [${tags.join(', ')}] נוספו למספר טלפון ${phoneNumber}`);
      return phone;
    } catch (error) {
      logger.error(`שגיאה בהוספת תגיות למספר טלפון ${phoneNumber}:`, error);
      throw error;
    }
  }
  
  /**
   * סנכרון שיחות למאגר הקשרים
   */
  static async syncConversationsToPhoneConnections(sessionId: string): Promise<{
    total: number;
    new: number;
    updated: number;
  }> {
    try {
      const conversations = await Conversation.find({ session: sessionId });
      let newCount = 0;
      let updatedCount = 0;
      
      for (const conversation of conversations) {
        const phoneNumber = conversation.contact.phone;
        
        // בדיקה אם מספר הטלפון כבר קיים
        let phone = await PhoneConnection.findOne({ phoneNumber });
        
        if (phone) {
          // עדכון פרטי הקשר
          if (!phone.name && conversation.contact.name) {
            phone.name = conversation.contact.name;
          }
          
          phone.lastContact = conversation.updatedAt || new Date();
          await phone.save();
          updatedCount++;
        } else {
          // יצירת קישור חדש
          await PhoneConnection.create({
            phoneNumber,
            name: conversation.contact.name,
            status: 'active',
            lastContact: conversation.updatedAt || new Date(),
          });
          newCount++;
        }
      }
      
      logger.info(`סנכרון שיחות לקשרים הסתיים: ${newCount} חדשים, ${updatedCount} עודכנו מתוך ${conversations.length}`);
      
      return {
        total: conversations.length,
        new: newCount,
        updated: updatedCount,
      };
    } catch (error) {
      logger.error('שגיאה בסנכרון שיחות לקשרים:', error);
      throw error;
    }
  }
} 