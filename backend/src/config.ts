import dotenv from 'dotenv';

// טעינת קובץ המשתנים
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
  
  // Client URL
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'jwt_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Bcrypt
  bcrypt: {
    saltRounds: 10
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
}; 