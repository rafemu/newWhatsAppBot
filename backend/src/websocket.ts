import { Server } from 'socket.io';
import { logger } from './shared/utils/logger';

export const setupWebSocket = (io: Server): void => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Add your custom socket event handlers here
    socket.on('message', (data) => {
      logger.info(`Received message from ${socket.id}:`, data);
      // Handle the message
    });
  });
}; 