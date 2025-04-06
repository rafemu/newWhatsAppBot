import { body, param, query } from 'express-validator';

export const conversationValidation = {
  // שליפת שיחות
  getConversations: [
    query('sessionId').notEmpty().withMessage('מזהה סשן חובה')
  ],

  // שליפת שיחה בודדת
  getConversation: [
    param('conversationId').notEmpty().withMessage('מזהה שיחה חובה')
  ],

  // מחיקת שיחה
  deleteConversation: [
    param('conversationId').notEmpty().withMessage('מזהה שיחה חובה')
  ],

  // שליחת הודעה
  sendMessage: [
    param('sessionId').notEmpty().withMessage('מזהה סשן חובה'),
    body('recipient').notEmpty().withMessage('נמען חובה').trim(),
    body('message').notEmpty().withMessage('תוכן ההודעה חובה'),
    body('options').optional().isObject().withMessage('אפשרויות חייבות להיות אובייקט')
  ],

  // שליחת הודעות מרובות
  sendBulkMessages: [
    param('sessionId').notEmpty().withMessage('מזהה סשן חובה'),
    body('recipients').isArray({ min: 1 }).withMessage('יש לספק לפחות נמען אחד'),
    body('recipients.*').notEmpty().withMessage('נמען לא יכול להיות ריק').trim(),
    body('message').notEmpty().withMessage('תוכן ההודעה חובה'),
    body('options').optional().isObject().withMessage('אפשרויות חייבות להיות אובייקט'),
    body('options.delay').optional().isInt({ min: 0 }).withMessage('ההשהיה חייבת להיות מספר חיובי')
  ],

  // שליפת הודעות
  getMessages: [
    param('conversationId').notEmpty().withMessage('מזהה שיחה חובה'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('הגבלה חייבת להיות מספר חיובי בין 1 ל-100'),
    query('before').optional().isISO8601().withMessage('תאריך לא תקין')
  ],

  // שליחת מדיה
  sendMedia: [
    param('sessionId').notEmpty().withMessage('מזהה סשן חובה'),
    body('recipient').notEmpty().withMessage('נמען חובה').trim(),
    body('mediaType').notEmpty().withMessage('סוג המדיה חובה')
      .isIn(['image', 'video', 'audio', 'document']).withMessage('סוג מדיה לא תקין'),
    body('mediaUrl').notEmpty().withMessage('כתובת המדיה חובה').isURL().withMessage('כתובת מדיה לא תקינה'),
    body('caption').optional().isString().withMessage('כיתוב חייב להיות טקסט'),
    body('filename').optional().isString().withMessage('שם קובץ חייב להיות טקסט'),
    body('options').optional().isObject().withMessage('אפשרויות חייבות להיות אובייקט')
  ],

  // קבלת אנשי קשר
  getContacts: [
    param('sessionId').notEmpty().withMessage('מזהה סשן חובה')
  ],

  // סנכרון אנשי קשר
  syncContacts: [
    param('sessionId').notEmpty().withMessage('מזהה סשן חובה')
  ]
}; 