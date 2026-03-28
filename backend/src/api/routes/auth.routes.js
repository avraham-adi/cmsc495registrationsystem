import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import authMiddleware, { firstLoginMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Public Auth Routes
router.post('/login', authController.login);

// Protected Auth/User Routes (Requires a valid token)
router.post('/logout', authMiddleware, firstLoginMiddleware(), authController.logout);
router.get('/me', authMiddleware, firstLoginMiddleware(), authController.getCurrentUser);
router.post('/change-password', authMiddleware, firstLoginMiddleware(), authController.changePassword);

export default router;
