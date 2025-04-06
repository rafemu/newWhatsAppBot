import { Request, Response } from 'express';
import { logger } from '../../../shared/utils/logger';
import { WhatsAppService } from '../services/whatsappService';

export class SessionController {
  /**
   * יצירת סשן חדש של WhatsApp
   */
  static async initSession(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, autoReconnect } = req.body;
      
      logger.info(`יצירת סשן חדש של WhatsApp: ${name}`);
      
      // TODO: במציאות - לקחת את המזהה מהמשתמש המחובר
      const userId = req.user?.id || '64f123456789abcdef123456';
      
      const session = await WhatsAppService.createSession(userId, {
        name,
        description,
        autoReconnect,
      });
      
      res.status(201).json({
        status: 'success',
        message: 'הסשן נוצר בהצלחה',
        data: session
      });
    } catch (error) {
      logger.error('שגיאה ביצירת סשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה ביצירת הסשן'
      });
    }
  }

  /**
   * הוספת מכשיר חדש לסשן
   */
  static async addDevice(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { deviceName } = req.body;
      
      logger.info(`הוספת מכשיר חדש "${deviceName}" לסשן ${sessionId}`);
      
      const { device, qrCode } = await WhatsAppService.addDevice(sessionId, deviceName);
      
      res.status(201).json({
        status: 'success',
        message: 'המכשיר נוסף בהצלחה',
        data: { device, qrCode }
      });
    } catch (error) {
      logger.error('שגיאה בהוספת מכשיר לסשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בהוספת המכשיר לסשן'
      });
    }
  }
  
  /**
   * קבלת כל המכשירים של סשן
   */
  static async getSessionDevices(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      
      res.status(200).json({
        status: 'success',
        data: devices
      });
    } catch (error) {
      logger.error('שגיאה בקבלת מכשירי הסשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת מכשירי הסשן'
      });
    }
  }
  
  /**
   * קבלת קוד QR למכשיר
   */
  static async getDeviceQR(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, deviceId } = req.params;
      
      let qrData = await WhatsAppService.getDeviceQRCode(sessionId, deviceId);
      console.log('qrData', qrData);
      
      // אם אין קוד QR, ננסה לייצר חדש
      if (!qrData) {
        console.log('QR code not found, trying to refresh...');
        try {
          qrData = await WhatsAppService.refreshDeviceQR(sessionId, deviceId);
        } catch (refreshError: any) {
          // אם אין קליינט למכשיר, ננסה לייצר אותו מחדש
          if (refreshError.message && refreshError.message.includes('לא נמצא קליינט למכשיר')) {
            console.log('No client found, recreating client...');
            
            // קבלת פרטי המכשיר מהמסד נתונים
            const session = await WhatsAppService.getSession(sessionId);
            const device = session.devices.find(d => d.deviceId === deviceId);
            
            if (device) {
              console.log('Device found, recreating client instance...');
              // יצירת קליינט חדש
              const result = await WhatsAppService.recreateDeviceClient(sessionId, deviceId, device.name);
              
              if (result && result.qrCode) {
                qrData = {
                  qrCode: result.qrCode,
                  expiration: result.expiration
                };
              }
            }
          } else {
            // אם זו שגיאה אחרת, נזרוק אותה
            throw refreshError;
          }
        }
        
        if (!qrData) {
          return res.status(400).json({
            status: 'error',
            message: 'לא ניתן ליצור קוד QR חדש'
          });
        }
      }
      
      res.status(200).json({
        status: 'success',
        data: qrData
      });
    } catch (error) {
      logger.error('שגיאה בקבלת קוד QR למכשיר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת קוד QR למכשיר'
      });
    }
  }
  
  /**
   * רענון קוד QR למכשיר
   */
  static async refreshDeviceQR(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, deviceId } = req.params;
      
      const qrData = await WhatsAppService.refreshDeviceQR(sessionId, deviceId);
      
      if (!qrData) {
        return res.status(404).json({
          status: 'error',
          message: 'לא ניתן לחדש את קוד ה-QR'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: qrData
      });
    } catch (error) {
      logger.error('שגיאה ברענון קוד QR למכשיר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה ברענון קוד QR למכשיר'
      });
    }
  }
  
  /**
   * התנתקות ממכשיר
   */
  static async logoutDevice(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, deviceId } = req.params;
      
      await WhatsAppService.logoutDevice(sessionId, deviceId);
      
      res.status(200).json({
        status: 'success',
        message: 'ההתנתקות מהמכשיר בוצעה בהצלחה'
      });
    } catch (error) {
      logger.error('שגיאה בהתנתקות ממכשיר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בהתנתקות מהמכשיר'
      });
    }
  }
  
  /**
   * הסרת מכשיר מסשן
   */
  static async removeDevice(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, deviceId } = req.params;
      
      await WhatsAppService.removeDevice(sessionId, deviceId);
      
      res.status(200).json({
        status: 'success',
        message: 'המכשיר הוסר בהצלחה'
      });
    } catch (error) {
      logger.error('שגיאה בהסרת מכשיר:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בהסרת המכשיר'
      });
    }
  }

  /**
   * קבלת קוד QR לחיבור - עבור תאימות לאחור
   * @deprecated יש להשתמש בגישה מבוססת מכשירים
   */
  static async getQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      // בדיקה אם יש מכשירים קיימים
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      
      // אם אין מכשירים, יוצר מכשיר אוטומטית
      if (devices.length === 0) {
        const { device, qrCode } = await WhatsAppService.addDevice(sessionId, 'מכשיר ראשי');
        
        res.status(200).json({
          status: 'success',
          data: {
            qrCode,
            expiration: device.qrExpiration,
            deviceId: device.deviceId // מחזיר את מזהה המכשיר שנוצר
          }
        });
      } else {
        // אם יש מכשיר, מחזיר את קוד ה-QR של המכשיר הראשון
        const deviceId = devices[0].deviceId;
        let qrData = await WhatsAppService.getDeviceQRCode(sessionId, deviceId);
        
        if (!qrData) {
          try {
            console.log('QR code not found for legacy endpoint, trying to refresh...');
            qrData = await WhatsAppService.refreshDeviceQR(sessionId, deviceId);
          } catch (refreshError: any) {
            // אם אין קליינט למכשיר, ננסה לייצר אותו מחדש
            if (refreshError.message && refreshError.message.includes('לא נמצא קליינט למכשיר')) {
              console.log('No client found for legacy endpoint, recreating client...');
              
              // קבלת פרטי המכשיר מהמסד נתונים
              const device = devices[0];
              
              if (device) {
                console.log('Device found, recreating client instance...');
                // יצירת קליינט חדש
                const result = await WhatsAppService.recreateDeviceClient(sessionId, deviceId, device.name);
                
                if (result && result.qrCode) {
                  qrData = {
                    qrCode: result.qrCode,
                    expiration: result.expiration
                  };
                }
              }
            } else {
              // אם זו שגיאה אחרת, נזרוק אותה
              throw refreshError;
            }
          }
          
          if (!qrData) {
            return res.status(404).json({
              status: 'error',
              message: 'קוד QR לא נמצא או שפג תוקפו'
            });
          }
        }
        
        res.status(200).json({
          status: 'success',
          data: {
            ...qrData,
            deviceId // מחזיר את מזהה המכשיר
          }
        });
      }
    } catch (error) {
      logger.error('שגיאה בקבלת קוד QR:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת קוד QR'
      });
    }
  }

  /**
   * קבלת סטטוס סשן
   */
  static async getSessionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const session = await WhatsAppService.getSession(sessionId);
      
      res.status(200).json({
        status: 'success',
        data: {
          status: session.status,
          lastActive: session.lastActive,
          phone: session.phone,
          name: session.name
        }
      });
    } catch (error) {
      logger.error('שגיאה בקבלת סטטוס סשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת סטטוס הסשן'
      });
    }
  }

  /**
   * התנתקות מסשן - מנתק את כל המכשירים
   */
  static async logoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      
      // ניתוק כל המכשירים
      for (const device of devices) {
        await WhatsAppService.logoutDevice(sessionId, device.deviceId);
      }
      
      res.status(200).json({
        status: 'success',
        message: 'ההתנתקות מהסשן בוצעה בהצלחה'
      });
    } catch (error) {
      logger.error('שגיאה בהתנתקות מסשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בהתנתקות מהסשן'
      });
    }
  }

  /**
   * קבלת כל הסשנים
   */
  static async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      // TODO: במציאות - לקחת את המזהה מהמשתמש המחובר
      const userId = req.user?.id || '64f123456789abcdef123456';
      
      const sessions = await WhatsAppService.getUserSessions(userId);
      
      res.status(200).json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      logger.error('שגיאה בקבלת סשנים:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת הסשנים'
      });
    }
  }

  /**
   * קבלת סשן לפי מזהה
   */
  static async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const session = await WhatsAppService.getSession(sessionId);
      
      res.status(200).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      logger.error('שגיאה בקבלת סשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בקבלת הסשן'
      });
    }
  }

  /**
   * מחיקת סשן
   */
  static async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const devices = await WhatsAppService.getSessionDevices(sessionId);
      
      // ניתוק והסרת כל המכשירים
      for (const device of devices) {
        await WhatsAppService.removeDevice(sessionId, device.deviceId);
      }
      
      // מחיקת הסשן
      await WhatsAppService.deleteSession(sessionId);
      
      res.status(200).json({
        status: 'success',
        message: 'הסשן נמחק בהצלחה'
      });
    } catch (error) {
      logger.error('שגיאה במחיקת סשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה במחיקת הסשן'
      });
    }
  }

  /**
   * עדכון הגדרות סשן
   */
  static async updateSessionSettings(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const updatedSession = await WhatsAppService.updateSessionSettings(sessionId, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'הגדרות הסשן עודכנו בהצלחה',
        data: updatedSession
      });
    } catch (error) {
      logger.error('שגיאה בעדכון הגדרות סשן:', error);
      res.status(500).json({
        status: 'error',
        message: 'אירעה שגיאה בעדכון הגדרות הסשן'
      });
    }
  }
} 