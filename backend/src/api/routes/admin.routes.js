import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import authMiddleware, { firstLoginMiddleware } from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/rbac.middleware.js';

const router = Router();
const adminController = new AdminController();

// Apply auth + first-login to all admin routes
router.use(authMiddleware, firstLoginMiddleware(), authorizeRoles('ADMIN'));

// Admin-only routes
router.post('/users', adminController.addUser);
router.patch('/users/:id/role', adminController.setUserRole);
router.delete('/users/:id', adminController.removeUser);

export default router;
