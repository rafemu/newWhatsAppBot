import * as yup from 'yup';
import { UserRole } from '../models/User';

// סכמה בסיסית למשתמש
const userBaseSchema = {
  email: yup
    .string()
    .email('כתובת אימייל לא תקינה')
    .required('אימייל הוא שדה חובה'),
  name: yup
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(50, 'שם לא יכול להכיל יותר מ-50 תווים')
    .required('שם הוא שדה חובה'),
};

// סכמה להרשמה
export const registerSchema = yup.object().shape({
  ...userBaseSchema,
  password: yup
    .string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/[a-z]/, 'סיסמה חייבת להכיל לפחות אות קטנה אחת')
    .matches(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה אחת')
    .matches(/[0-9]/, 'סיסמה חייבת להכיל לפחות ספרה אחת')
    .matches(/[^a-zA-Z0-9]/, 'סיסמה חייבת להכיל לפחות תו מיוחד אחד')
    .required('סיסמה היא שדה חובה'),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), 'תפקיד לא תקין')
    .default(UserRole.VIEWER),
});

// סכמה להתחברות
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('כתובת אימייל לא תקינה')
    .required('אימייל הוא שדה חובה'),
  password: yup
    .string()
    .required('סיסמה היא שדה חובה'),
});

// סכמה לעדכון פרטי משתמש
export const updateUserSchema = yup.object().shape({
  ...userBaseSchema,
});

// סכמה לעדכון סיסמה
export const updatePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('סיסמה נוכחית היא שדה חובה'),
  newPassword: yup
    .string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/[a-z]/, 'סיסמה חייבת להכיל לפחות אות קטנה אחת')
    .matches(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה אחת')
    .matches(/[0-9]/, 'סיסמה חייבת להכיל לפחות ספרה אחת')
    .matches(/[^a-zA-Z0-9]/, 'סיסמה חייבת להכיל לפחות תו מיוחד אחד')
    .required('סיסמה חדשה היא שדה חובה')
    .notOneOf([yup.ref('currentPassword')], 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית'),
});

// סכמה לבקשת איפוס סיסמה
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('כתובת אימייל לא תקינה')
    .required('אימייל הוא שדה חובה'),
});

// סכמה לאיפוס סיסמה
export const resetPasswordSchema = yup.object().shape({
  token: yup
    .string()
    .required('טוקן איפוס הוא שדה חובה'),
  password: yup
    .string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/[a-z]/, 'סיסמה חייבת להכיל לפחות אות קטנה אחת')
    .matches(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה אחת')
    .matches(/[0-9]/, 'סיסמה חייבת להכיל לפחות ספרה אחת')
    .matches(/[^a-zA-Z0-9]/, 'סיסמה חייבת להכיל לפחות תו מיוחד אחד')
    .required('סיסמה חדשה היא שדה חובה'),
});

// סכמה להפעלת 2FA
export const enable2FASchema = yup.object().shape({
  token: yup
    .string()
    .matches(/^\d{6}$/, 'קוד האימות חייב להכיל 6 ספרות')
    .required('קוד אימות הוא שדה חובה'),
});

// סכמה לאימות 2FA בהתחברות
export const verify2FASchema = yup.object().shape({
  token: yup
    .string()
    .matches(/^\d{6}$/, 'קוד האימות חייב להכיל 6 ספרות')
    .required('קוד אימות הוא שדה חובה'),
}); 