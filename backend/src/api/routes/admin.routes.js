/*
Adi Avraham
CMSC495 Group Golf Capstone Project
admin.routes.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the admin API routes for user and administrative resource management.
*/

import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params, validateQuery as query } from '../middleware/validateRequest.middleware.js';
import { addUserSchema as user, setUserRoleSchema as role, getAllUsersQuerySchema as users } from '../schemas/admin.schemas.js';
import { idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new AdminController();

// Apply auth + first-login to all admin routes
r.use(auth, flm(), roles('ADMIN'));

// Admin-only routes
r.post('/', body(user), c.addUser);
r.put('/:id/role', params(id), body(role), c.setRole);
r.delete('/:id', params(id), c.rmvUser);
r.get('/:id', params(id), c.getUser);
r.get('/', query(users), c.getUsers);

export default r;
