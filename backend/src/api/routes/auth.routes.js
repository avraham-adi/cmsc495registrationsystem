/*
Adi Avraham
CMSC495 Group Golf Capstone Project
auth.routes.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the authentication and self-service account API routes.
*/

import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { validateBody as body } from '../middleware/validateRequest.middleware.js';
import { loginSchema as login, changePasswordSchema as pass, updateUserSchema as user } from '../schemas/auth.schemas.js';

const r = Router();
const c = new AuthController();

// Public Auth Routes
r.post('/login', body(login), c.login);

// Protected Auth/User Routes (Requires an authenticated session)
r.get('/logout', auth, flm(), c.logout);
r.get('/me', auth, flm(), c.getSelf);
r.patch('/me', auth, flm(), body(pass), c.updPass);
r.put('/me', auth, flm(), body(user), c.updUser);

export default r;
