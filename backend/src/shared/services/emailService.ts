import nodemailer from 'nodemailer';
import { config } from '../../config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  /**
   * שליחת אימייל
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // בדיקה שקיימים פרטי חיבור לשרת דואר
      if (!config.email.user || !config.email.password) {
        logger.warn('פרטי חיבור לשרת דואר חסרים, לא ניתן לשלוח אימייל');
        return false;
      }

      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('שגיאה בשליחת אימייל:', error);
      return false;
    }
  }

  /**
   * שליחת אימייל לאיפוס סיסמה
   */
  static async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<boolean> {
    try {
      const subject = 'איפוס סיסמה - WhatsApp Bot';
      
      const htmlTemplate = `
        <div dir="rtl">
          <h2>איפוס סיסמה - WhatsApp Bot</h2>
          <p>שלום,</p>
          <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
          <p>לחץ על הקישור הבא כדי לאפס את הסיסמה שלך: <a href="${resetUrl}">איפוס סיסמה</a></p>
          <p>הקישור יפוג תוך 10 דקות.</p>
          <p>אם לא ביקשת לאפס את הסיסמה, אנא התעלם מהודעה זו.</p>
          <p>בברכה,<br>צוות WhatsApp Bot</p>
        </div>
      `;
      
      const textTemplate = `
        איפוס סיסמה - WhatsApp Bot
        
        שלום,
        
        קיבלנו בקשה לאיפוס הסיסמה שלך.
        
        לחץ על הקישור הבא כדי לאפס את הסיסמה שלך: ${resetUrl}
        
        הקישור יפוג תוך 10 דקות.
        
        אם לא ביקשת לאפס את הסיסמה, אנא התעלם מהודעה זו.
        
        בברכה,
        צוות WhatsApp Bot
      `;

      const result = await this.sendEmail({
        to: email,
        subject,
        text: textTemplate,
        html: htmlTemplate,
      });

      if (result) {
        logger.info(`נשלח אימייל לאיפוס סיסמה: ${email}`);
      }

      return result;
    } catch (error) {
      logger.error(`שגיאה בשליחת אימייל לאיפוס סיסמה: ${email}`, error);
      return false;
    }
  }

  /**
   * אליאס לפונקציית sendPasswordResetEmail
   * נוסף כדי לתמוך בקוד מקומפל שכבר משתמש בשם הפונקציה הזה
   */
  static async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    return this.sendPasswordResetEmail(email, resetToken, resetUrl);
  }

  /**
   * שליחת אימייל אישור רישום
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const subject = 'ברוכים הבאים ל-WhatsApp Bot!';
      
      const htmlTemplate = `
        <div dir="rtl">
          <h2>ברוכים הבאים ל-WhatsApp Bot!</h2>
          <p>שלום ${name},</p>
          <p>תודה שנרשמת למערכת ניהול ה-WhatsApp שלנו!</p>
          <p>אנו שמחים שהצטרפת אלינו ובטוחים שתמצא את המערכת שלנו יעילה ופשוטה לשימוש.</p>
          <p>אם יש לך שאלות כלשהן או אם אתה זקוק לעזרה בשימוש במערכת, אל תהסס לפנות אלינו.</p>
          <p>בברכה,<br>צוות WhatsApp Bot</p>
        </div>
      `;
      
      const textTemplate = `
        ברוכים הבאים ל-WhatsApp Bot!
        
        שלום ${name},
        
        תודה שנרשמת למערכת ניהול ה-WhatsApp שלנו!
        
        אנו שמחים שהצטרפת אלינו ובטוחים שתמצא את המערכת שלנו יעילה ופשוטה לשימוש.
        
        אם יש לך שאלות כלשהן או אם אתה זקוק לעזרה בשימוש במערכת, אל תהסס לפנות אלינו.
        
        בברכה,
        צוות WhatsApp Bot
      `;

      return await this.sendEmail({
        to: email,
        subject,
        text: textTemplate,
        html: htmlTemplate,
      });
    } catch (error) {
      logger.error(`שגיאה בשליחת אימייל אישור רישום: ${email}`, error);
      return false;
    }
  }

  /**
   * שליחת התראה על פעילות חשודה
   */
  static async sendSecurityAlert(email: string, activity: string, ip: string, time: string): Promise<boolean> {
    try {
      const subject = 'התראת אבטחה - פעילות חשודה בחשבונך';
      
      const htmlTemplate = `
        <div dir="rtl">
          <h2>התראת אבטחה - WhatsApp Bot</h2>
          <p>שלום,</p>
          <p>זיהינו פעילות חשודה בחשבונך:</p>
          <ul>
            <li>סוג פעילות: ${activity}</li>
            <li>כתובת IP: ${ip}</li>
            <li>זמן: ${time}</li>
          </ul>
          <p>אם לא זיהית את הפעילות הזו, אנא שנה את סיסמתך מיד וצור קשר עם תמיכת המערכת.</p>
          <p>בברכה,<br>צוות האבטחה של WhatsApp Bot</p>
        </div>
      `;
      
      const textTemplate = `
        התראת אבטחה - WhatsApp Bot
        
        שלום,
        
        זיהינו פעילות חשודה בחשבונך:
        
        סוג פעילות: ${activity}
        כתובת IP: ${ip}
        זמן: ${time}
        
        אם לא זיהית את הפעילות הזו, אנא שנה את סיסמתך מיד וצור קשר עם תמיכת המערכת.
        
        בברכה,
        צוות האבטחה של WhatsApp Bot
      `;

      return await this.sendEmail({
        to: email,
        subject,
        text: textTemplate,
        html: htmlTemplate,
      });
    } catch (error) {
      logger.error(`שגיאה בשליחת התראת אבטחה: ${email}`, error);
      return false;
    }
  }
} 