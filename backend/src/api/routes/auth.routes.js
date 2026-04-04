import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import authMiddleware, { firstLoginMiddleware } from '../../middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validateRequest.middleware.js';
import { loginSchema, changePasswordSchema, updateUserSchema } from '../schemas/auth.schemas.js';

const router = Router();
const authController = new AuthController();

// Public Auth Routes
router.get('/user/login', validateQuery(loginSchema), authController.login);

// Protected Auth/User Routes (Requires a valid token)
router.get('/user/logout', authMiddleware, firstLoginMiddleware(), authController.logout);
router.get('/user/:id', authMiddleware, firstLoginMiddleware(), authController.getCurrentUser);
router.patch('/user/:id', authMiddleware, firstLoginMiddleware(), validateBody(changePasswordSchema), authController.changePassword);
router.put('/user/:id', authMiddleware, firstLoginMiddleware(), validateBody(updateUserSchema), authController.updateUserInfo);

export default router;
