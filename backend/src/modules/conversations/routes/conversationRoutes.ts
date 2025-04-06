import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';
import { validateSession } from '../../../shared/middlewares/validateSession';
import { validateRequestSchema } from '../../../shared/middlewares/validateRequestSchema';
import { conversationValidation } from '../validations/conversationValidation';

const router = Router();

/**
 * @route GET /api/conversations
 * @desc קבלת כל השיחות עבור סשן
 * @access פרטי
 */
router.get(
  '/',
  validateSession,
  validateRequestSchema(conversationValidation.getConversations),
  ConversationController.getAllConversations
);

/**
 * @route GET /api/conversations/:conversationId
 * @desc קבלת שיחה לפי מזהה
 * @access פרטי
 */
router.get(
  '/:conversationId',
  validateSession,
  validateRequestSchema(conversationValidation.getConversation),
  ConversationController.getConversationById
);

/**
 * @route DELETE /api/conversations/:conversationId
 * @desc מחיקת שיחה
 * @access פרטי
 */
router.delete(
  '/:conversationId',
  validateSession,
  validateRequestSchema(conversationValidation.deleteConversation),
  ConversationController.deleteConversation
);

/**
 * @route GET /api/conversations/:conversationId/messages
 * @desc קבלת הודעות משיחה
 * @access פרטי
 */
router.get(
  '/:conversationId/messages',
  validateSession,
  validateRequestSchema(conversationValidation.getMessages),
  ConversationController.getMessages
);

/**
 * @route POST /api/conversations/send/:sessionId
 * @desc שליחת הודעה
 * @access פרטי
 */
router.post(
  '/send/:sessionId',
  validateSession,
  validateRequestSchema(conversationValidation.sendMessage),
  ConversationController.sendMessage
);

/**
 * @route POST /api/conversations/bulk/:sessionId
 * @desc שליחת הודעה למספר נמענים
 * @access פרטי
 */
router.post(
  '/bulk/:sessionId',
  validateSession,
  validateRequestSchema(conversationValidation.sendBulkMessages),
  ConversationController.sendBulkMessages
);

/**
 * @route POST /api/conversations/media/:sessionId
 * @desc שליחת מדיה
 * @access פרטי
 */
router.post(
  '/media/:sessionId',
  validateSession,
  validateRequestSchema(conversationValidation.sendMedia),
  ConversationController.sendMedia
);

/**
 * @route GET /api/conversations/contacts/:sessionId
 * @desc קבלת אנשי קשר
 * @access פרטי
 */
router.get(
  '/contacts/:sessionId',
  validateSession,
  validateRequestSchema(conversationValidation.getContacts),
  ConversationController.getContacts
);

/**
 * @route POST /api/conversations/contacts/sync/:sessionId
 * @desc סנכרון אנשי קשר
 * @access פרטי
 */
router.post(
  '/contacts/sync/:sessionId',
  validateSession,
  validateRequestSchema(conversationValidation.syncContacts),
  ConversationController.syncContacts
);

export const conversationRoutes = router; 