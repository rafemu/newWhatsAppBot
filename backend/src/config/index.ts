import dotenv from 'dotenv';

// טעינת משתני הסביבה מקובץ .env
dotenv.config();

// קונפיגורציה
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
  
  // שמירה על תמיכה לאחור עם שני המבנים
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-should-be-long-and-secure',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // מבנה חדש - בשימוש בקוד המקור
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-should-be-long-and-secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  bcrypt: {
    saltRounds: 12,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@whatsapp-bot.com',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
}; 