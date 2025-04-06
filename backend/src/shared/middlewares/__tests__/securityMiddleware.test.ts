import { SecurityMiddleware } from '../securityMiddleware';
import express from 'express';
import request from 'supertest';
import { logger } from '../../utils/logger';

// Mock ללוגר
jest.mock('../../utils/logger');

describe('SecurityMiddleware', () => {
  describe('validatePasswordStrength', () => {
    it('צריך לאשר סיסמה חוקית', () => {
      const validPassword = 'Password123!';
      expect(SecurityMiddleware.validatePasswordStrength(validPassword)).toBe(true);
    });

    it('צריך לדחות סיסמה קצרה מדי', () => {
      const shortPassword = 'Pass1!';
      expect(SecurityMiddleware.validatePasswordStrength(shortPassword)).toBe(false);
    });

    it('צריך לדחות סיסמה ללא אות גדולה', () => {
      const noUpperCase = 'password123!';
      expect(SecurityMiddleware.validatePasswordStrength(noUpperCase)).toBe(false);
    });

    it('צריך לדחות סיסמה ללא אות קטנה', () => {
      const noLowerCase = 'PASSWORD123!';
      expect(SecurityMiddleware.validatePasswordStrength(noLowerCase)).toBe(false);
    });

    it('צריך לדחות סיסמה ללא מספרים', () => {
      const noNumbers = 'Password!!';
      expect(SecurityMiddleware.validatePasswordStrength(noNumbers)).toBe(false);
    });

    it('צריך לדחות סיסמה ללא תווים מיוחדים', () => {
      const noSpecialChars = 'Password123';
      expect(SecurityMiddleware.validatePasswordStrength(noSpecialChars)).toBe(false);
    });
  });

  describe('sanitizeUserInput', () => {
    it('צריך להסיר תגיות HTML', () => {
      const input = '<script>alert("XSS")</script>Hello';
      expect(SecurityMiddleware.sanitizeUserInput(input)).toBe('scriptalert("XSS")/scriptHello');
    });

    it('צריך להסיר נקודה-פסיק', () => {
      const input = 'Hello;World';
      expect(SecurityMiddleware.sanitizeUserInput(input)).toBe('HelloWorld');
    });

    it('צריך להסיר רווחים מיותרים', () => {
      const input = '  Hello  World  ';
      expect(SecurityMiddleware.sanitizeUserInput(input)).toBe('Hello  World');
    });
  });

  describe('setupSecurity', () => {
    let app: express.Express;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      SecurityMiddleware.setupSecurity(app);
      
      // נתיב בדיקה
      app.post('/api/auth/login', (_req, res) => {
        res.status(401).json({ message: 'Invalid credentials' });
      });
    });

    it('צריך לרשום ניסיון התחברות כושל', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('ניסיון התחברות כושל'));
    });

    it('צריך להגביל קצב בקשות לנתיבי אימות', async () => {
      // שליחת 6 בקשות (מעל המגבלה של 5)
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'test' });

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });
}); 