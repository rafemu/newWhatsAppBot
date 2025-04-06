import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { AuthMiddleware } from '../../auth/middlewares/authMiddleware';
import { SessionValidation } from '../validations/sessionValidation';

const router = Router();

// WhatsApp session management
router.post('/init', AuthMiddleware.protect, SessionValidation.init, SessionController.initSession);
router.get('/qr/:sessionId', AuthMiddleware.protect, SessionController.getQRCode);
router.get('/status/:sessionId', AuthMiddleware.protect, SessionController.getSessionStatus);
router.post('/logout/:sessionId', AuthMiddleware.protect, SessionController.logoutSession);

// Device management - חדש
router.post('/:sessionId/devices', AuthMiddleware.protect, SessionValidation.addDevice, SessionController.addDevice);
router.get('/:sessionId/devices', AuthMiddleware.protect, SessionController.getSessionDevices);
router.get('/:sessionId/devices/:deviceId/qr', AuthMiddleware.protect, SessionController.getDeviceQR);
router.post('/:sessionId/devices/:deviceId/refresh-qr', AuthMiddleware.protect, SessionController.refreshDeviceQR);
router.post('/:sessionId/devices/:deviceId/logout', AuthMiddleware.protect, SessionController.logoutDevice);
router.delete('/:sessionId/devices/:deviceId', AuthMiddleware.protect, SessionController.removeDevice);

// Session listing and management
router.get('/', AuthMiddleware.protect, SessionController.getAllSessions);
router.get('/:sessionId', AuthMiddleware.protect, SessionController.getSessionById);
router.delete('/:sessionId', AuthMiddleware.protect, SessionController.deleteSession);

// Session settings
router.put('/:sessionId/settings', 
  AuthMiddleware.protect, 
  SessionValidation.updateSettings, 
  SessionController.updateSessionSettings
);

export const sessionRoutes = router; 