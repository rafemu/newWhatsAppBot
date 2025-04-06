import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { User } from '../models/User';
import { AppErrorImpl as AppError } from '../../../shared/middlewares/errorHandler';
import { asyncHandler } from '../../../shared/middlewares/errorHandler';
import { config } from '../../../config';
import { logger } from '../../../shared/utils/logger';
import { EmailService } from '../../../shared/services/emailService';

export class AuthController {
  /**
   * הרשמת משתמש חדש למערכת
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    // בדיקה האם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('משתמש עם אימייל זה כבר קיים במערכת', 400);
    }

    // יצירת משתמש חדש
    const user = new User({
      email,
      password,
      name,
      role: role || 'VIEWER', // ברירת מחדל: צופה
    });

    await user.save();

    // יצירת טוקן
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    logger.info(`משתמש חדש נרשם: ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  });

  /**
   * התחברות משתמש קיים
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('נא להזין אימייל וסיסמה', 400);
    }

    const user = await User.findOne({ email }).select('+password +twoFactorEnabled');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('אימייל או סיסמה שגויים', 401);
    }

    // אם 2FA מופעל, מחזירים טוקן זמני
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id },
        config.jwtSecret,
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          requiresTwoFactor: true,
          tempToken,
        },
      });
    }

    // אם 2FA לא מופעל, מחזירים טוקן רגיל
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    logger.info(`משתמש התחבר: ${email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  });

  /**
   * קבלת פרטי המשתמש המחובר
   */
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });

  /**
   * עדכון פרטי המשתמש
   */
  static updateMe = asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;

    // מניעת עדכון סיסמה בנתיב זה
    if (req.body.password) {
      throw new AppError('לא ניתן לעדכן סיסמה בנתיב זה. אנא השתמש בנתיב עדכון סיסמה', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    logger.info(`משתמש עדכן פרטים: ${email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });

  /**
   * עדכון סיסמה
   */
  static updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    // בדיקת הסיסמה הנוכחית
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('סיסמה נוכחית שגויה', 401);
    }

    // עדכון הסיסמה
    user.password = newPassword;
    await user.save();

    logger.info(`משתמש עדכן סיסמה: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'הסיסמה עודכנה בהצלחה',
    });
  });

  /**
   * בקשת איפוס סיסמה
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // מציאת המשתמש
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('לא נמצא משתמש עם אימייל זה', 404);
    }

    // יצירת טוקן לאיפוס סיסמה
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      // שליחת אימייל עם הטוקן
      await EmailService.sendPasswordReset(email, resetToken);

      logger.info(`נשלח אימייל לאיפוס סיסמה: ${email}`);

      res.status(200).json({
        status: 'success',
        message: 'נשלח אימייל עם הוראות לאיפוס הסיסמה',
      });
    } catch (error) {
      // במקרה של שגיאה, נאפס את הטוקן ונשמור
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('אירעה שגיאה בשליחת האימייל. נא לנסות שוב מאוחר יותר', 500);
    }
  });

  /**
   * איפוס סיסמה
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // הצפנת הטוקן שהתקבל כדי להשוות לטוקן השמור
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // מציאת המשתמש לפי הטוקן ובדיקה שלא פג תוקף
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('טוקן לא תקין או שפג תוקפו', 400);
    }

    // עדכון הסיסמה
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`סיסמה אופסה בהצלחה: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'הסיסמה אופסה בהצלחה',
    });
  });

  /**
   * יצירת סוד חדש ל-2FA והחזרת קוד QR
   */
  static generate2FA = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id).select('+twoFactorSecret +twoFactorTempSecret');
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    // יצירת סוד חדש
    const secret = user.generateTwoFactorSecret();
    await user.save({ validateBeforeSave: false });

    // יצירת קוד QR
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `WhatsApp Bot - ${user.email}`,
      issuer: 'WhatsApp Bot',
      encoding: 'hex'
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    res.status(200).json({
      status: 'success',
      data: {
        qrCode: qrCodeUrl,
        secret: secret,
      },
    });
  });

  /**
   * הפעלת 2FA לאחר אימות הקוד
   */
  static enable2FA = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findById(req.user.id).select('+twoFactorSecret +twoFactorTempSecret');
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    // אימות הקוד
    const isValid = user.verifyTwoFactorToken(token);
    if (!isValid) {
      throw new AppError('קוד אימות שגוי', 400);
    }

    // הפעלת 2FA
    user.twoFactorEnabled = true;
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`2FA הופעל עבור משתמש: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: '2FA הופעל בהצלחה',
    });
  });

  /**
   * כיבוי 2FA
   */
  static disable2FA = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorTempSecret = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`2FA כובה עבור משתמש: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: '2FA כובה בהצלחה',
    });
  });

  /**
   * אימות קוד 2FA בהתחברות
   */
  static verify2FA = asyncHandler(async (req: Request, res: Response) => {
    const { token, tempToken } = req.body;

    if (!tempToken) {
      throw new AppError('לא נמצא טוקן זמני', 400);
    }

    // פענוח הטוקן הזמני
    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.jwtSecret) as { id: string };
    } catch (error) {
      throw new AppError('טוקן זמני לא תקין או פג תוקף', 401);
    }

    // מציאת המשתמש
    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      throw new AppError('משתמש לא נמצא או שאימות דו-שלבי לא מופעל', 404);
    }

    // אימות הקוד
    const isValid = user.verifyTwoFactorToken(token);
    if (!isValid) {
      throw new AppError('קוד אימות שגוי', 400);
    }

    // יצירת טוקן קבוע
    const permanentToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    logger.info(`2FA אומת בהצלחה: ${user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: permanentToken,
      },
    });
  });

  /**
   * קבלת כל המשתמשים במערכת
   */
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        })),
      },
    });
  });

  /**
   * יצירת משתמש חדש על ידי מנהל
   */
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('משתמש עם אימייל זה כבר קיים במערכת', 400);
    }

    const user = new User({
      email,
      password,
      name,
      role,
    });

    await user.save();

    logger.info(`מנהל יצר משתמש חדש: ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });

  /**
   * קבלת פרטי משתמש ספציפי
   */
  static getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });

  /**
   * עדכון פרטי משתמש על ידי מנהל
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    logger.info(`מנהל עדכן פרטי משתמש: ${email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });

  /**
   * מחיקת משתמש
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    logger.info(`מנהל מחק משתמש: ${user.email}`);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  /**
   * עדכון תפקיד משתמש
   */
  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('משתמש לא נמצא', 404);
    }

    logger.info(`מנהל עדכן תפקיד משתמש ${user.email} ל-${role}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  });
} 