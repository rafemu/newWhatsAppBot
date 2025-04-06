import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User, IUser } from '../models/User';
import { logger } from '../../../shared/utils/logger';

export class TwoFactorService {
  /**
   * יצירת סוד חדש ל-2FA
   */
  static async generateSecret(userId: string): Promise<{ secret: string; otpauth_url: string; qrCode: string }> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret +twoFactorTempSecret');
      
      if (!user) {
        throw new Error(`משתמש עם מזהה ${userId} לא נמצא`);
      }
      
      // יצירת סוד חדש
      const secret = speakeasy.generateSecret({
        name: `WhatsApp Bot - ${user.email}`,
      });
      
      // שמירת הסוד הזמני
      user.twoFactorTempSecret = secret.base32;
      await user.save();
      
      // יצירת קוד QR
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);
      
      return {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
        qrCode,
      };
    } catch (error) {
      logger.error(`שגיאה ביצירת סוד 2FA למשתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * אימות קוד 2FA
   */
  static async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret +twoFactorTempSecret');
      
      if (!user) {
        throw new Error(`משתמש עם מזהה ${userId} לא נמצא`);
      }
      
      // בדיקה האם 2FA מופעל, ואם כן, משתמשים בסוד הקבוע
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        return this.validateToken(token, user.twoFactorSecret);
      }
      
      // אחרת, שימוש בסוד הזמני (למשל, בתהליך האימות הראשוני)
      if (user.twoFactorTempSecret) {
        return this.validateToken(token, user.twoFactorTempSecret);
      }
      
      return false;
    } catch (error) {
      logger.error(`שגיאה באימות קוד 2FA למשתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * הפעלת 2FA
   */
  static async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret +twoFactorTempSecret');
      
      if (!user) {
        throw new Error(`משתמש עם מזהה ${userId} לא נמצא`);
      }
      
      if (!user.twoFactorTempSecret) {
        throw new Error('לא נמצא סוד זמני, יש ליצור סוד חדש');
      }
      
      // וידוא שהטוקן תקין
      const isValid = this.validateToken(token, user.twoFactorTempSecret);
      
      if (!isValid) {
        return false;
      }
      
      // העברת הסוד הזמני לקבוע
      user.twoFactorSecret = user.twoFactorTempSecret;
      user.twoFactorEnabled = true;
      user.twoFactorTempSecret = undefined;
      await user.save();
      
      logger.info(`2FA הופעל בהצלחה למשתמש ${userId}`);
      
      return true;
    } catch (error) {
      logger.error(`שגיאה בהפעלת 2FA למשתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * כיבוי 2FA
   */
  static async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret');
      
      if (!user) {
        throw new Error(`משתמש עם מזהה ${userId} לא נמצא`);
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('2FA אינו מופעל');
      }
      
      // וידוא שהטוקן תקין
      const isValid = this.validateToken(token, user.twoFactorSecret);
      
      if (!isValid) {
        return false;
      }
      
      // כיבוי 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorTempSecret = undefined;
      await user.save();
      
      logger.info(`2FA כובה בהצלחה למשתמש ${userId}`);
      
      return true;
    } catch (error) {
      logger.error(`שגיאה בכיבוי 2FA למשתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * בדיקה אם 2FA מופעל
   */
  static async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error(`משתמש עם מזהה ${userId} לא נמצא`);
      }
      
      return user.twoFactorEnabled;
    } catch (error) {
      logger.error(`שגיאה בבדיקת סטטוס 2FA למשתמש ${userId}:`, error);
      throw error;
    }
  }

  /**
   * אימות טוקן מול סוד
   */
  private static validateToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token,
      window: 1, // חלון של 30 שניות לפני/אחרי
    });
  }
} 