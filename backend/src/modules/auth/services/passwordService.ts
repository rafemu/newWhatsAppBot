import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { EmailService } from '../../../shared/services/emailService';
import { config } from '../../../config';
import { logger } from '../../../shared/utils/logger';

export class PasswordService {
  /**
   * יצירת טוקן איפוס סיסמה ושליחת אימייל
   */
  static async forgotPassword(email: string): Promise<boolean> {
    try {
      // בדיקה שהמשתמש קיים
      const user = await User.findOne({ email });
      
      if (!user) {
        // לא מחזירים שגיאה מטעמי אבטחה, אך מתעדים
        logger.warn(`ניסיון איפוס סיסמה לאימייל לא קיים: ${email}`);
        return false;
      }
      
      // יצירת טוקן אקראי
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // שמירת גרסה מוצפנת של הטוקן
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      // שמירת הטוקן במשתמש
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 דקות
      await user.save();
      
      // יצירת כתובת איפוס סיסמה
      const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
      
      // שליחת אימייל
      const emailSent = await EmailService.sendPasswordResetEmail(
        email,
        resetToken,
        resetUrl
      );
      
      return emailSent;
    } catch (error) {
      logger.error(`שגיאה בתהליך איפוס סיסמה: ${email}`, error);
      return false;
    }
  }

  /**
   * אימות טוקן איפוס סיסמה
   */
  static async verifyResetToken(token: string): Promise<IUser | null> {
    try {
      // הצפנת הטוקן לבדיקה מול ערך השמור
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // חיפוש משתמש עם הטוקן התקף
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });
      
      return user;
    } catch (error) {
      logger.error(`שגיאה באימות טוקן איפוס סיסמה`, error);
      return null;
    }
  }

  /**
   * איפוס סיסמה
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // אימות הטוקן
      const user = await this.verifyResetToken(token);
      
      if (!user) {
        return false;
      }
      
      // איפוס הסיסמה
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      // ניקוי שדות האיפוס
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      await user.save();
      
      logger.info(`סיסמה אופסה בהצלחה עבור: ${user.email}`);
      
      return true;
    } catch (error) {
      logger.error(`שגיאה באיפוס סיסמה`, error);
      return false;
    }
  }

  /**
   * עדכון סיסמה
   */
  static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // מציאת המשתמש עם הסיסמה
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return false;
      }
      
      // בדיקת הסיסמה הנוכחית
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return false;
      }
      
      // עדכון הסיסמה
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      logger.info(`סיסמה עודכנה בהצלחה עבור: ${user.email}`);
      
      return true;
    } catch (error) {
      logger.error(`שגיאה בעדכון סיסמה עבור משתמש ${userId}`, error);
      return false;
    }
  }

  /**
   * בדיקת חוזק סיסמה
   */
  static checkPasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // בדיקת אורך
    if (password.length < 8) {
      feedback.push('הסיסמה חייבת להכיל לפחות 8 תווים');
    } else {
      score += 1;
    }
    
    // בדיקת אותיות גדולות
    if (!/[A-Z]/.test(password)) {
      feedback.push('הסיסמה חייבת להכיל לפחות אות גדולה אחת');
    } else {
      score += 1;
    }
    
    // בדיקת אותיות קטנות
    if (!/[a-z]/.test(password)) {
      feedback.push('הסיסמה חייבת להכיל לפחות אות קטנה אחת');
    } else {
      score += 1;
    }
    
    // בדיקת מספרים
    if (!/\d/.test(password)) {
      feedback.push('הסיסמה חייבת להכיל לפחות ספרה אחת');
    } else {
      score += 1;
    }
    
    // בדיקת תווים מיוחדים
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('הסיסמה חייבת להכיל לפחות תו מיוחד אחד');
    } else {
      score += 1;
    }
    
    // בדיקת סיסמאות נפוצות
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', '1234567890'];
    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('הסיסמה שבחרת נפוצה מדי ואינה בטוחה');
      score = 0;
    }
    
    return {
      isStrong: score >= 4,
      score,
      feedback: feedback.length > 0 ? feedback : ['הסיסמה חזקה מספיק'],
    };
  }
} 