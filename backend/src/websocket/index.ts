import { Server } from 'socket.io';
import { logger } from '../shared/utils/logger';

export const setupWebSocket = (io: Server): void => {
  // הגדרת חיבורי Socket.IO
  io.on('connection', (socket) => {
    logger.info(`חיבור WebSocket חדש: ${socket.id}`);

    // אירוע התחברות לחדר על פי מזהה סשן
    socket.on('join', (sessionId) => {
      socket.join(sessionId);
      logger.info(`המשתמש ${socket.id} הצטרף לחדר ${sessionId}`);
    });

    // אירוע עזיבת חדר
    socket.on('leave', (sessionId) => {
      socket.leave(sessionId);
      logger.info(`המשתמש ${socket.id} עזב את החדר ${sessionId}`);
    });

    // ניתוק
    socket.on('disconnect', () => {
      logger.info(`נותק חיבור WebSocket: ${socket.id}`);
    });
  });

  // פונקציה לשליחת עדכון סטטוס הסשן
  return;
}; 