import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../config';

let mongo: MongoMemoryServer;

// הגדרת משתני סביבה לבדיקות
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// הגדרת חיבור למסד נתונים זמני לבדיקות
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

// ניקוי מסד הנתונים לפני כל בדיקה
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// סגירת החיבור למסד הנתונים בסיום הבדיקות
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

// הגדרת טיימאאוט ארוך יותר לבדיקות
jest.setTimeout(30000);

// Mock לפונקציות שליחת מייל
jest.mock('../shared/services/emailService', () => ({
  emailService: {
    sendPasswordResetEmail: jest.fn(),
    send2FABackupCodes: jest.fn(),
  },
}));

// Mock ללוגר
jest.mock('../shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// פונקציות עזר לבדיקות

/**
 * יצירת טוקן JWT לבדיקות
 */
export const generateTestToken = (userId: string, role: string = 'VIEWER'): string => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * יצירת משתמש לבדיקות
 */
export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'Password123!',
  role: string = 'VIEWER'
) => {
  const { User } = require('../modules/auth/models/User');
  const user = new User({
    email,
    password,
    name: 'Test User',
    role,
  });
  await user.save();
  return user;
};

/**
 * יצירת בקשת Express מזויפת לבדיקות
 */
export const mockRequest = (
  body: any = {},
  params: any = {},
  user: any = null,
  query: any = {}
) => ({
  body,
  params,
  user,
  query,
  get: jest.fn(),
  ip: '127.0.0.1',
});

/**
 * יצירת תגובת Express מזויפת לבדיקות
 */
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * יצירת פונקציית next מזויפת לבדיקות
 */
export const mockNext = jest.fn(); 