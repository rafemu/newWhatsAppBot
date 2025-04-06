import express from 'express';
import { PhoneConnectionController } from '../controllers/phoneConnectionController';
import { authMiddleware } from '../../auth/middlewares/authMiddleware';

const router = express.Router();

// הגנה על כל הנתיבים - דורש אימות משתמש
router.use(authMiddleware.protect);

// נתיבים בסיסיים לניהול קישורי טלפון
router.route('/')
  .get(PhoneConnectionController.getPhoneConnections)
  .post(PhoneConnectionController.createPhoneConnection);

router.route('/:phoneNumber')
  .get(PhoneConnectionController.getPhoneConnection)
  .put(PhoneConnectionController.updatePhoneConnection)
  .delete(PhoneConnectionController.deletePhoneConnection);

// נתיבים לקישור טלפון לסקר או קמפיין
router.post('/:phoneNumber/link-survey', PhoneConnectionController.linkPhoneToSurvey);
router.post('/:phoneNumber/link-campaign', PhoneConnectionController.linkPhoneToCampaign);

// נתיב להוספת תגיות
router.post('/:phoneNumber/tags', PhoneConnectionController.addTagsToPhone);

// נתיב לסנכרון שיחות למאגר הקשרים
router.post('/sync', PhoneConnectionController.syncConversationsToPhoneConnections);

export default router; 