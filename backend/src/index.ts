import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { setupWebSocket } from './websocket';
import { logger } from './shared/utils/logger';
import { config } from './config';
import app from './app';

// Load environment variables
dotenv.config();

// יצירת שרת HTTP והגדרת Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

// Setup WebSocket
setupWebSocket(io);

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info('התחברות למסד הנתונים בוצעה בהצלחה');
    
    // Start server
    httpServer.listen(config.port, () => {
      logger.info(`השרת פועל בהצלחה בפורט ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('שגיאה בהתחברות למסד הנתונים:', error);
    process.exit(1);
  }); 