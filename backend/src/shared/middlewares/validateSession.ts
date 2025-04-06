import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../../modules/sessions/services/whatsappService';
import { logger } from '../utils/logger';

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // חילוץ מזהה סשן
    let sessionId = req.params.sessionId;
    
    // אם אין בפרמטרים, בדוק בשאילתא
    if (!sessionId) {
      sessionId = req.query.sessionId as string;
    }

    // אם עדיין אין, בדוק בגוף הבקשה
    if (!sessionId && req.body) {
      sessionId = req.body.sessionId;
    }

    // אם אין מזהה סשן
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'מזהה סשן נדרש'
      });
    }

    // בדוק אם הסשן קיים ופעיל
    const session = await WhatsAppService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'סשן לא נמצא'
      });
    }

    if (session.status !== 'connected') {
      return res.status(403).json({
        status: 'error',
        message: 'סשן אינו פעיל'
      });
    }

    // שמירת מידע הסשן עבור השלבים הבאים
    res.locals.session = session;
    next();
  } catch (error) {
    logger.error('שגיאה באימות סשן:', error);
    return res.status(500).json({
      status: 'error',
      message: 'אירעה שגיאה באימות הסשן'
    });
  }
}; 