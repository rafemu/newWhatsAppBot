// כדי להשתמש בקובץ זה, יש להתקין ראשית את החבילות הדרושות:
// npm install whatsapp-web.js qrcode puppeteer

import { ListSection } from './whatsappService';
import { logger } from '../../../shared/utils/logger';
import qrcode from 'qrcode';

// הערה: ייבוא זה לא יעבוד אלא לאחר התקנת whatsapp-web.js
import { Client, LocalAuth } from 'whatsapp-web.js';

/**
 * מחלקה לקישור אמיתי ל-WhatsApp
 * הערה: קובץ זה צריך להיות פעיל רק לאחר התקנת החבילות הנדרשות
 */
export class RealWhatsAppClient {
  private sessionId: string;
  private deviceId: string;
  private client: Client; // Client מ-whatsapp-web.js
  private isConnected = false;
  private qrCode: string | null = null;
  private phone: string | null = null;
  private deviceName: string;
  private messageHandler: ((message: any) => Promise<void>) | null = null;

  constructor(sessionId: string, deviceId: string, deviceName: string) {
    this.sessionId = sessionId;
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    
    // יצירת לקוח WhatsApp עם אחסון מקומי של הסשן עם אפשרויות נוספות
    this.client = new Client({
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        defaultViewport: null,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
      },
      authStrategy: new LocalAuth({
        clientId: `${sessionId}_${deviceId}`,
        dataPath: './whatsapp-sessions'
      }),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      webVersionCache: {
        type: 'local'
      },
      webVersion: '2.2310.5',
      qrMaxRetries: 5
    });

    // רישום מאזינים לאירועי הלקוח
    this.setupEventListeners();

    logger.info(`RealWhatsAppClient initialized for session: ${sessionId}, device: ${deviceId}, name: ${deviceName}`);
  }

  private setupEventListeners() {
    // אירוע קבלת קוד QR
    this.client.on('qr', (qrContent: string) => {
      logger.info(`Got QR code for device ${this.deviceId}. Generating image...`);
      
      // המרת קוד QR למחרוזת תמונה עם qrcode
      qrcode.toDataURL(qrContent, {
        errorCorrectionLevel: 'H', // העלאה לרמה H לשיפור הסריקה
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        scale: 8, // גודל ביניים שעובד היטב
        color: {
          dark: '#111111', // שימוש בצבע כהה יותר לשיפור קריאות הקוד
          light: '#ffffff',
        },
      }, (err: Error | null, url: string) => {
        if (err) {
          logger.error(`Error generating QR code: ${err}`);
          return;
        }
        this.qrCode = url;
        logger.info(`QR code generated for device: ${this.deviceId}`);
      });
    });

    // אירוע אימות מוצלח
    this.client.on('authenticated', () => {
      logger.info(`WhatsApp client authenticated for device: ${this.deviceId}`);
    });
    
    // אירוע שגיאת אימות
    this.client.on('auth_failure', (message: string) => {
      logger.error(`Authentication failure for device ${this.deviceId}: ${message}`);
      this.isConnected = false;
    });

    // אירוע התחברות מוצלחת
    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info(`WhatsApp client ready for device: ${this.deviceId}`);
      
      this.client.getInfo().then((info: any) => {
        this.phone = info.wid?.user || null;
        logger.info(`WhatsApp client connected with phone: ${this.phone}`);
      }).catch(err => {
        logger.error(`Failed to get phone info: ${err}`);
      });
    });

    // אירוע ניתוק
    this.client.on('disconnected', (reason: string) => {
      this.isConnected = false;
      logger.info(`WhatsApp client disconnected for device: ${this.deviceId}: ${reason}`);
      
      // ניקוי הקוד QR כאשר יש ניתוק
      this.qrCode = null;
    });

    // אירוע הודעה חדשה
    this.client.on('message', async (message: any) => {
      if (this.messageHandler) {
        try {
          const formattedMessage = {
            id: message.id.id,
            from: message.from,
            content: message.body,
            timestamp: new Date(message.timestamp * 1000),
            isFromMe: message.fromMe
          };
          await this.messageHandler(formattedMessage);
        } catch (error) {
          logger.error(`Error handling incoming message: ${error}`);
        }
      }
    });
    
    // הוספת מאזין לאירועי שגיאה כדי לתעד בעיות התחברות
    this.client.on('change_state', (state: string) => {
      logger.info(`WhatsApp client state changed for device ${this.deviceId}: ${state}`);
    });
  }

  async initialize(): Promise<string> {
    // איפוס QR הקודם
    this.qrCode = null;
    
    logger.info(`התחלת אתחול WhatsAppClient עבור ${this.deviceName} (${this.deviceId}) בסשן ${this.sessionId}`);
    
    // התחלת הלקוח
    try {
      await this.client.initialize();
      logger.info(`Client initialized successfully for ${this.deviceId}`);
    } catch (error) {
      logger.error(`שגיאה באתחול הלקוח: ${error}`);
      throw error;
    }
    
    // המתנה לקבלת קוד QR
    return new Promise((resolve, reject) => {
      // אם יש כבר QR, נחזיר אותו מיד
      if (this.qrCode) {
        logger.info(`QR code already available, returning immediately for ${this.deviceId}`);
        resolve(this.qrCode);
        return;
      }

      // אחרת נמתין לאירוע QR עד 10 שניות
      let attempts = 0;
      const maxAttempts = 10;
      logger.info(`Waiting for QR code event with ${maxAttempts} seconds timeout for ${this.deviceId}`);
      
      const checkInterval = setInterval(() => {
        attempts++;
        if (this.qrCode) {
          clearInterval(checkInterval);
          logger.info(`QR code received after ${attempts} attempts for ${this.deviceId}`);
          resolve(this.qrCode);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          logger.error(`QR code generation timeout after ${maxAttempts} seconds for ${this.deviceId}`);
          
          // אם אין קוד QR אחרי זמן ההמתנה, נייצר קוד דמה שמציין שהיה טיימאאוט
          const dummyQR = this.generateFallbackQRCode();
          this.qrCode = dummyQR;
          logger.info(`Generated fallback QR code for ${this.deviceId} due to timeout`);
          resolve(dummyQR);
        } else if (attempts % 2 === 0) {
          logger.info(`Still waiting for QR code, attempt ${attempts}/${maxAttempts} for ${this.deviceId}`);
        }
      }, 1000);
    });
  }

  /**
   * יצירת קוד QR חלופי במקרה שהלקוח נכשל בהפקת קוד
   */
  private generateFallbackQRCode(): string {
    const errorMessage = {
      type: "error",
      message: "QR code generation timeout",
      deviceId: this.deviceId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };
    
    try {
      // יצירת QR קוד שמציג הודעת שגיאה
      const qrImageSync = qrcode.toDataURL(JSON.stringify(errorMessage), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        scale: 6,
        color: {
          dark: '#FF0000',  // אדום לציון שגיאה
          light: '#ffffff',
        },
      });
      
      // נחזיר את התוצאה באופן סינכרוני
      return qrImageSync;
    } catch (error) {
      logger.error(`שגיאה ביצירת קוד QR חלופי: ${error}`);
      // במקרה של שגיאה נוספת, נחזיר מחרוזת ריקה (יגרום להצגת תמונה שבורה)
      return "";
    }
  }

  getQRCode(): string | null {
    return this.qrCode;
  }

  getPhone(): string | null {
    return this.phone;
  }
  
  getDeviceId(): string {
    return this.deviceId;
  }
  
  getDeviceName(): string {
    return this.deviceName;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  async logout(): Promise<void> {
    if (this.client) {
      await this.client.logout();
    }
    this.isConnected = false;
    this.phone = null;
    logger.info(`WhatsApp device ${this.deviceName} (${this.deviceId}) in session ${this.sessionId} logged out successfully`);
  }

  async sendMessage(to: string, message: string): Promise<{ id: string }> {
    if (!this.isConnected) {
      throw new Error('Client is not connected');
    }
    
    // וידוא מספר טלפון תקין
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    
    if (this.client) {
      const sentMessage = await this.client.sendMessage(formattedNumber, message);
      return { id: sentMessage.id.id };
    }
    
    // בהעדר קליינט, נחזיר מזהה דמה
    return { id: 'dummy-message-id-' + Date.now() };
  }

  async sendListMessage(
    to: string,
    title: string,
    description: string,
    buttonText: string,
    sections: ListSection[]
  ): Promise<{ id: string }> {
    if (!this.isConnected) {
      throw new Error('Client is not connected');
    }

    // וידוא מספר טלפון תקין
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    
    if (this.client) {
      // המרת ListSection למבנה שמתאים ל-WhatsApp Web API
      const formattedSections = sections.map(section => ({
        title: section.title,
        rows: section.rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description || ''
        }))
      }));

      const sentMessage = await this.client.sendMessage(formattedNumber, {
        list: {
          title: title,
          description: description,
          buttonText: buttonText,
          sections: formattedSections
        }
      });
      
      return { id: sentMessage.id.id };
    }
    
    // בהעדר קליינט, נחזיר מזהה דמה
    return { id: 'dummy-list-message-id-' + Date.now() };
  }

  async sendButtonMessage(
    to: string, 
    title: string, 
    buttons: { id: string; text: string }[]
  ): Promise<{ id: string }> {
    if (!this.isConnected) {
      throw new Error('Client is not connected');
    }

    // וידוא מספר טלפון תקין
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    
    if (this.client) {
      // המרת כפתורים למבנה שמתאים ל-WhatsApp Web API
      const formattedButtons = buttons.map(button => ({
        id: button.id,
        body: button.text
      }));

      const sentMessage = await this.client.sendMessage(formattedNumber, {
        buttons: formattedButtons,
        body: title
      });
      
      return { id: sentMessage.id.id };
    }
    
    // בהעדר קליינט, נחזיר מזהה דמה
    return { id: 'dummy-button-message-id-' + Date.now() };
  }

  registerMessageHandler(handler: (message: any) => Promise<void>): void {
    this.messageHandler = handler;
    logger.info(`Message handler registered for session ${this.sessionId}`);
  }
} 