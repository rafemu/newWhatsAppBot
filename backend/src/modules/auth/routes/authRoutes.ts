import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { Permission } from '../config/permissions';
import { authValidation } from '../validations/auth.validation';

const router = Router();
const validationMiddleware = new ValidationMiddleware();

// בדיקת בריאות - נתיב ציבורי
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Auth API is working' });
});

// נתיבים ציבוריים
router.post('/register', validationMiddleware.validate(authValidation.register), AuthController.register);
router.post('/login', validationMiddleware.validate(authValidation.login), AuthController.login);

// נתיבים מוגנים - דורשים אימות
router.use(AuthMiddleware.protect);

// נתיבי משתמש
router.get('/me', AuthController.getMe);
router.patch('/updateMe', validationMiddleware.validate(authValidation.updateMe), AuthController.updateMe);
router.patch('/updatePassword', validationMiddleware.validate(authValidation.updatePassword), AuthController.updatePassword);

// נתיבי ניהול משתמשים - דורשים הרשאות מיוחדות
router.get(
  '/users',
  AuthMiddleware.requirePermission(Permission.VIEW_USERS),
  AuthController.getAllUsers
);

router.post(
  '/users',
  AuthMiddleware.requirePermission(Permission.MANAGE_USERS),
  validationMiddleware.validate(authValidation.createUser),
  AuthController.createUser
);

router.get(
  '/users/:id',
  AuthMiddleware.requirePermission(Permission.VIEW_USERS),
  AuthController.getUser
);

router.patch(
  '/users/:id',
  AuthMiddleware.requirePermission(Permission.MANAGE_USERS),
  validationMiddleware.validate(authValidation.updateMe),
  AuthController.updateUser
);

router.delete(
  '/users/:id',
  AuthMiddleware.requirePermission(Permission.MANAGE_USERS),
  AuthController.deleteUser
);

router.patch(
  '/users/:id/role',
  AuthMiddleware.requirePermission(Permission.MANAGE_USERS),
  validationMiddleware.validate(authValidation.updateUserRole),
  AuthController.updateUserRole
);

export const authRoutes = router; 