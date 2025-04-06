import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middlewares/errorHandler';
import { SecurityMiddleware } from './shared/middlewares/securityMiddleware';
import { config } from './config';
import { authRoutes } from './modules/auth';
import { activityLogRoutes } from './modules/logs';
import { sessionRoutes } from './modules/sessions';
import { conversationRoutes } from './modules/conversations';
import { phoneConnectionRoutes } from './modules/connections';

const app = express();

// הגדרות בסיסיות
app.use(express.json({ limit: '10kb' })); // הגבלת גודל הבקשה ל-10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// הגדרות CORS מורחבות
app.use(cors({
  origin: ['http://localhost:3000', config.clientUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// הגדרת אמצעי אבטחה
SecurityMiddleware.setupSecurity(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/phone-connections', phoneConnectionRoutes);

// טיפול בשגיאות - חייב להיות אחרי הגדרת הנתיבים
app.use(errorHandler);

export default app; 