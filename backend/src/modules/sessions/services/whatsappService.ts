import qrcode from 'qrcode';
import { WhatsAppSession, IWhatsAppSession, IWhatsAppDevice } from '../models/WhatsAppSession';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { RealWhatsAppClient } from './RealWhatsAppClient';

// הערה: ראה קובץ RealWhatsAppClient.ts וקובץ WHATSAPP-SETUP.md לפרטים על חיבור אמיתי
// כדי להשתמש בחיבור אמיתי, התקן: npm install whatsapp-web.js qrcode puppeteer

// טיפוסים לתמיכה בהודעות אינטראקטיביות
export interface ListOption {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListOption[];
}

// פתרון לדוגמה - אמור להיות מוחלף על ידי ספריה אמיתית כמו whatsapp-web.js

// ניהול מופעי הקליינטים - מפתח מורכב מ sessionId:deviceId
const clientInstances: Record<string, RealWhatsAppClient> = {};

export class WhatsAppService {
  /**
   * יצירת סשן חדש
   */
  static async createSession(userId: string, data: { name: string; description?: string; autoReconnect?: boolean }): Promise<IWhatsAppSession> {
    try {
      const session = await WhatsAppSession.create({
        name: data.name,
        description: data.description,
        user: userId,
        status: 'initializing',
        autoReconnect: data.autoReconnect ?? true,
        devices: [],
      });

      logger.info(`Session created: ${session._id}`);
      
      return session;
    } catch (error) {
      logger.error('שגיאה ביצירת סשן WhatsApp:', error);
      throw error;
    }
  }
  
  /**
   * יצירת מכשיר חדש והוספתו לסשן קיים
   */
  static async addDevice(sessionId: string, deviceName: string): Promise<IWhatsAppDevice> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      const deviceId = Math.random().toString(36).substring(2, 15);
      
      // יצירת מופע WhatsApp חדש
      const client = new RealWhatsAppClient(sessionId, deviceId, deviceName);
      const qrCode = await client.initialize();
      
      // יצירת מכשיר חדש
      const expiration = new Date(Date.now() + 5 * 60000);
      const newDevice: IWhatsAppDevice = {
        deviceId,
        name: deviceName,
        status: 'initializing',
        qrCode,
        qrExpiration: expiration,
        createdAt: new Date()
      };
      
      // הוספת המכשיר לסשן
      session.devices.push(newDevice);
      await session.save();
      
      return newDevice;
    } catch (error) {
      logger.error(`שגיאה בהוספת מכשיר לסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * קבלת קוד QR למכשיר ספציפי
   */
  static async getDeviceQRCode(sessionId: string, deviceId: string): Promise<{ qrCode: string; expiration: Date } | null> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // חיפוש המכשיר במערך המכשירים של הסשן
      const deviceIndex = session.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex === -1) {
        throw new Error(`מכשיר עם מזהה ${deviceId} לא נמצא בסשן ${sessionId}`);
      }
      
      const device = session.devices[deviceIndex];
      
      // אם המכשיר כבר במצב מחובר, נחזיר שגיאה
      if (device.status === 'connected') {
        throw new Error(`מכשיר ${deviceId} כבר מחובר`);
      }
      
      // רימוב מכשיר שנתקע בהתחברות מעל 10 דקות
      if (device.status === 'initializing' && device.statusUpdatedAt) {
        const timeSinceUpdate = Date.now() - new Date(device.statusUpdatedAt).getTime();
        if (timeSinceUpdate > 10 * 60 * 1000) { // 10 דקות
          logger.warn(`מכשיר ${deviceId} תקוע במצב 'initializing' למעלה מ-10 דקות. איפוס מצב...`);
          device.status = 'disconnected';
          
          // ניסיון למחוק מופע קליינט קיים
          const clientKey = `${sessionId}:${deviceId}`;
          if (clientInstances[clientKey]) {
            delete clientInstances[clientKey];
          }
        }
      }
      
      // בדיקה אם יש קוד QR בתוקף
      if (device.qrCode && device.qrExpiration && device.qrExpiration > new Date() && device.status !== 'disconnected') {
        return {
          qrCode: device.qrCode,
          expiration: device.qrExpiration,
        };
      }
      
      // אם אין קוד QR או שפג תוקפו, ננסה לקבל חדש
      const clientKey = `${sessionId}:${deviceId}`;
      let client = clientInstances[clientKey];
      
      // אם הקליינט לא קיים או במצב disconnected, ניצור אותו מחדש
      if (!client) {
        logger.info(`קליינט לא נמצא עבור ${deviceId}, יוצר מחדש...`);
        const deviceName = device.name || `מכשיר ${deviceIndex + 1}`;
        client = new RealWhatsAppClient(sessionId, deviceId, deviceName);
        clientInstances[clientKey] = client;
        logger.info(`נוצר קליינט חדש עבור מכשיר ${deviceId} בסשן ${sessionId}`);
      }
      
      // מאתחלים את המכשיר ויוצרים קוד QR חדש
      logger.info(`מתחיל אתחול קליינט למכשיר ${deviceId} בסשן ${sessionId}`);
      
      const newQrCode = await client.initialize();
      const expiration = new Date(Date.now() + 5 * 60000);
      
      // עדכון קוד ה-QR במכשיר
      session.devices[deviceIndex].qrCode = newQrCode;
      session.devices[deviceIndex].qrExpiration = expiration;
      session.devices[deviceIndex].status = 'initializing';
      session.devices[deviceIndex].statusUpdatedAt = new Date();
      await session.save();
      
      return { qrCode: newQrCode, expiration };
    } catch (error) {
      logger.error(`שגיאה בקבלת קוד QR למכשיר ${deviceId} בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * רענון קוד QR למכשיר
   */
  static async refreshDeviceQR(sessionId: string, deviceId: string): Promise<{ qrCode: string; expiration: Date } | null> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // חיפוש המכשיר במערך המכשירים של הסשן
      const deviceIndex = session.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex === -1) {
        throw new Error(`מכשיר עם מזהה ${deviceId} לא נמצא בסשן ${sessionId}`);
      }
      
      // בדיקה האם המכשיר כבר מחובר
      if (session.devices[deviceIndex].status === 'connected') {
        throw new Error(`המכשיר ${deviceId} כבר מחובר ולא ניתן לרענן את קוד ה-QR`);
      }
      
      // כפיית איפוס הקליינט הקיים אם יש
      const clientKey = `${sessionId}:${deviceId}`;
      if (clientInstances[clientKey]) {
        delete clientInstances[clientKey];
        logger.info(`מחיקת מופע קליינט קיים למכשיר ${deviceId} לקראת רענון`);
      }
      
      // יצירת קליינט חדש
      const deviceName = session.devices[deviceIndex].name || `מכשיר ${deviceIndex + 1}`;
      const client = new RealWhatsAppClient(sessionId, deviceId, deviceName);
      clientInstances[clientKey] = client;
      logger.info(`נוצר קליינט חדש למכשיר ${deviceId} במסגרת רענון קוד QR`);
      
      // יצירת קוד QR חדש
      const qrCode = await client.initialize();
      const expiration = new Date(Date.now() + 5 * 60000);
      
      // עדכון קוד ה-QR במכשיר
      session.devices[deviceIndex].qrCode = qrCode;
      session.devices[deviceIndex].qrExpiration = expiration;
      session.devices[deviceIndex].status = 'initializing';
      session.devices[deviceIndex].statusUpdatedAt = new Date();
      await session.save();
      
      return { qrCode, expiration };
    } catch (error) {
      logger.error(`שגיאה ברענון קוד QR למכשיר ${deviceId} בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * התנתקות ממכשיר ספציפי
   */
  static async logoutDevice(sessionId: string, deviceId: string): Promise<boolean> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // חיפוש המכשיר במערך המכשירים של הסשן
      const deviceIndex = session.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex === -1) {
        throw new Error(`מכשיר עם מזהה ${deviceId} לא נמצא בסשן ${sessionId}`);
      }
      
      // ניתוק הקליינט
      const clientKey = `${sessionId}:${deviceId}`;
      const client = clientInstances[clientKey];
      
      if (client) {
        await client.logout();
      } else {
        logger.warn(`לא נמצא קליינט למכשיר ${deviceId} בסשן ${sessionId}, מעדכן סטטוס ללא התנתקות פעילה`);
      }
      
      // עדכון סטטוס המכשיר בכל מקרה
      session.devices[deviceIndex].status = 'disconnected';
      session.devices[deviceIndex].qrCode = undefined;
      session.devices[deviceIndex].qrExpiration = undefined;
      await session.save();
      
      return true;
    } catch (error) {
      logger.error(`שגיאה בהתנתקות ממכשיר ${deviceId} בסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * הסרת מכשיר מסשן
   */
  static async removeDevice(sessionId: string, deviceId: string): Promise<boolean> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // התנתקות מהמכשיר לפני הסרתו
      const clientKey = `${sessionId}:${deviceId}`;
      const client = clientInstances[clientKey];
      
      if (client) {
        try {
          await client.logout();
        } catch (logoutError) {
          logger.warn(`שגיאה בניתוק המכשיר ${deviceId} בסשן ${sessionId}:`, logoutError);
        } finally {
          delete clientInstances[clientKey];
        }
      } else {
        logger.warn(`לא נמצא קליינט למכשיר ${deviceId} בסשן ${sessionId}, ממשיך להסרה ללא התנתקות פעילה`);
      }
      
      // הסרת המכשיר ממערך המכשירים
      session.devices = session.devices.filter(d => d.deviceId !== deviceId);
      await session.save();
      
      return true;
    } catch (error) {
      logger.error(`שגיאה בהסרת מכשיר ${deviceId} מסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * קבלת כל המכשירים של סשן
   */
  static async getSessionDevices(sessionId: string): Promise<IWhatsAppDevice[]> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // עדכון סטטוס המכשירים בהתאם למצב הקליינטים
      for (let i = 0; i < session.devices.length; i++) {
        const device = session.devices[i];
        const clientKey = `${sessionId}:${device.deviceId}`;
        const client = clientInstances[clientKey];
        
        if (client) {
          if (client.isClientConnected() && device.status !== 'connected') {
            session.devices[i].status = 'connected';
            session.devices[i].phone = client.getPhone() || undefined;
            session.devices[i].lastActive = new Date();
          } else if (!client.isClientConnected() && device.status === 'connected') {
            session.devices[i].status = 'disconnected';
          }
        }
      }
      
      await session.save();
      
      return session.devices;
    } catch (error) {
      logger.error(`שגיאה בקבלת מכשירים של סשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * קבלת מידע על סשן
   */
  static async getSession(sessionId: string): Promise<IWhatsAppSession> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // עדכון סטטוס בהתאם למצב הקליינט
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        if (device.status === 'connected') {
          session.status = 'connected';
          session.phone = device.phone || undefined;
          await session.save();
          break;
        } else if (device.status === 'disconnected') {
          session.status = 'disconnected';
          await session.save();
        }
      }
      
      return session;
    } catch (error) {
      logger.error(`שגיאה בקבלת סשן WhatsApp ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * קבלת כל הסשנים של משתמש
   */
  static async getUserSessions(userId: string): Promise<IWhatsAppSession[]> {
    try {
      return await WhatsAppSession.find({ user: userId }).sort({ updatedAt: -1 });
    } catch (error) {
      logger.error(`שגיאה בקבלת סשנים של משתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * שחזור קליינט למכשיר קיים
   */
  static async recreateDeviceClient(sessionId: string, deviceId: string, deviceName: string): Promise<{ qrCode: string; expiration: Date } | null> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // חיפוש המכשיר במערך המכשירים של הסשן
      const deviceIndex = session.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex === -1) {
        throw new Error(`מכשיר עם מזהה ${deviceId} לא נמצא בסשן ${sessionId}`);
      }
      
      // יצירת מופע WhatsApp חדש עבור המכשיר
      const clientKey = `${sessionId}:${deviceId}`;
      const client = new RealWhatsAppClient(sessionId, deviceId, deviceName);
      clientInstances[clientKey] = client;
      
      // יצירת קוד QR חדש
      const qrCode = await client.initialize();
      const expiration = new Date(Date.now() + 5 * 60000);
      
      // עדכון קוד ה-QR במכשיר
      session.devices[deviceIndex].qrCode = qrCode;
      session.devices[deviceIndex].qrExpiration = expiration;
      session.devices[deviceIndex].status = 'initializing';
      await session.save();
      
      return { qrCode, expiration };
    } catch (error) {
      logger.error(`שגיאה בשחזור קליינט למכשיר ${deviceId} בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * עדכון הגדרות סשן
   */
  static async updateSessionSettings(
    sessionId: string,
    settings: {
      name?: string;
      description?: string;
      autoReconnect?: boolean;
      messageDelay?: number;
      webhookUrl?: string;
      notifications?: {
        enabled?: boolean;
        email?: string;
        onDisconnect?: boolean;
        onMessage?: boolean;
      };
    }
  ): Promise<IWhatsAppSession> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // עדכון השדות
      if (settings.name) session.name = settings.name;
      if (settings.description !== undefined) session.description = settings.description;
      if (settings.autoReconnect !== undefined) session.autoReconnect = settings.autoReconnect;
      if (settings.messageDelay !== undefined) session.messageDelay = settings.messageDelay;
      if (settings.webhookUrl !== undefined) session.webhookUrl = settings.webhookUrl;
      
      if (settings.notifications) {
        session.notifications = session.notifications || {
          enabled: false,
          onDisconnect: true,
          onMessage: false,
        };
        
        if (settings.notifications.enabled !== undefined) {
          session.notifications.enabled = settings.notifications.enabled;
        }
        
        if (settings.notifications.email !== undefined) {
          session.notifications.email = settings.notifications.email;
        }
        
        if (settings.notifications.onDisconnect !== undefined) {
          session.notifications.onDisconnect = settings.notifications.onDisconnect;
        }
        
        if (settings.notifications.onMessage !== undefined) {
          session.notifications.onMessage = settings.notifications.onMessage;
        }
      }
      
      await session.save();
      
      return session;
    } catch (error) {
      logger.error(`שגיאה בעדכון הגדרות סשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * שליחת הודעה
   */
  static async sendMessage(sessionId: string, to: string, message: string): Promise<{ id: string }> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      if (session.status !== 'connected') {
        throw new Error(`סשן ${sessionId} אינו מחובר`);
      }
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        if (device.status === 'connected') {
          const client = clientInstances[`${sessionId}:${device.deviceId}`];
          if (!client) {
            throw new Error(`לא נמצא קליינט WhatsApp עבור מכשיר ${device.deviceId} בסשן ${sessionId}`);
          }
          
          // הוספת השהייה אם מוגדרת
          if (session.messageDelay && session.messageDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, session.messageDelay));
          }
          
          return await client.sendMessage(to, message);
        }
      }
      
      throw new Error(`לא נמצא מכשיר מחובר בסשן ${sessionId}`);
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעה בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * שליחת הודעת רשימה עם אפשרויות בחירה
   */
  static async sendListMessage(
    sessionId: string,
    to: string,
    title: string,
    description: string,
    buttonText: string,
    sections: ListSection[]
  ): Promise<{ id: string }> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      if (session.status !== 'connected') {
        throw new Error(`סשן ${sessionId} אינו מחובר`);
      }
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        if (device.status === 'connected') {
          const client = clientInstances[`${sessionId}:${device.deviceId}`];
          if (!client) {
            throw new Error(`לא נמצא קליינט WhatsApp עבור מכשיר ${device.deviceId} בסשן ${sessionId}`);
          }
          
          // הוספת השהייה אם מוגדרת
          if (session.messageDelay && session.messageDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, session.messageDelay));
          }
          
          return await client.sendListMessage(to, title, description, buttonText, sections);
        }
      }
      
      throw new Error(`לא נמצא מכשיר מחובר בסשן ${sessionId}`);
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
    to: string,
    title: string,
    buttons: { id: string; text: string }[]
  ): Promise<{ id: string }> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      if (session.status !== 'connected') {
        throw new Error(`סשן ${sessionId} אינו מחובר`);
      }
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        if (device.status === 'connected') {
          const client = clientInstances[`${sessionId}:${device.deviceId}`];
          if (!client) {
            throw new Error(`לא נמצא קליינט WhatsApp עבור מכשיר ${device.deviceId} בסשן ${sessionId}`);
          }
          
          // הוספת השהייה אם מוגדרת
          if (session.messageDelay && session.messageDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, session.messageDelay));
          }
          
          return await client.sendButtonMessage(to, title, buttons);
        }
      }
      
      throw new Error(`לא נמצא מכשיר מחובר בסשן ${sessionId}`);
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעה עם כפתורים בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * רישום מטפל להודעות נכנסות
   */
  static async registerMessageHandler(
    sessionId: string, 
    handler: (message: any) => Promise<void>
  ): Promise<boolean> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        const clientKey = `${sessionId}:${device.deviceId}`;
        const client = clientInstances[clientKey];
        
        if (!client) {
          throw new Error(`לא נמצא קליינט WhatsApp עבור מכשיר ${device.deviceId} בסשן ${sessionId}`);
        }
        
        client.registerMessageHandler(handler);
        logger.info(`רישום מטפל הודעות לסשן ${sessionId} ומכשיר ${device.deviceId}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`שגיאה ברישום מטפל הודעות לסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * סימולציה של קבלת הודעה (לסביבת פיתוח)
   */
  static async simulateIncomingMessage(
    sessionId: string,
    from: string,
    content: string
  ): Promise<boolean> {
    try {
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      for (const device of devices) {
        const clientKey = `${sessionId}:${device.deviceId}`;
        const client = clientInstances[clientKey];
        
        if (!client) {
          throw new Error(`לא נמצא קליינט WhatsApp עבור מכשיר ${device.deviceId} בסשן ${sessionId}`);
        }
        
        // בדיקה אם קיימת הפונקציה - תמיכה גם במחלקה המדומה וגם במחלקה האמיתית
        if (typeof (client as any).simulateIncomingMessage === 'function') {
          await (client as any).simulateIncomingMessage(from, content);
        } else {
          logger.warn(`פונקציית simulateIncomingMessage אינה זמינה במחלקה האמיתית`);
        }
      }
      return true;
    } catch (error) {
      logger.error(`שגיאה בסימולציית הודעה נכנסת בסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * מחיקת סשן
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await WhatsAppSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`סשן עם מזהה ${sessionId} לא נמצא`);
      }
      
      // מחיקת המכשירים וניקוי קליינטים
      for (const device of session.devices) {
        const clientKey = `${sessionId}:${device.deviceId}`;
        if (clientInstances[clientKey]) {
          delete clientInstances[clientKey];
        }
      }
      
      // מחיקת הסשן
      await WhatsAppSession.findByIdAndDelete(sessionId);
      
      return true;
    } catch (error) {
      logger.error(`שגיאה במחיקת סשן ${sessionId}:`, error);
      throw error;
    }
  }
} 