import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import authMiddleware, { firstLoginMiddleware } from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/rbac.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest.middleware.js';
import { addUserSchema, setUserRoleSchema, getAllUsersQuerySchema } from '../schemas/admin.schemas.js';
import { idParamSchema } from '../schemas/common.schema.js';

const router = Router();
const adminController = new AdminController();

// Apply auth + first-login to all admin routes
router.use(authMiddleware, firstLoginMiddleware(), authorizeRoles('ADMIN'));

// Admin-only routes
router.post('/admin', validateBody(addUserSchema), adminController.addUser);
router.put('/admin/:id/role', validateParams(idParamSchema), validateBody(setUserRoleSchema), adminController.setUserRole);
router.delete('/admin/:id', validateParams(idParamSchema), adminController.removeUser);
router.get('/admin/:id', validateParams(idParamSchema), adminController.getUserByID);
router.get('/admin', validateQuery(getAllUsersQuerySchema), adminController.getAllUsers);

export default router;
