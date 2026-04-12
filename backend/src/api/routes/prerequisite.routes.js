/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisite.routes.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the prerequisite API routes for course prerequisite management.
*/

import { Router } from 'express';
import PrerequisiteController from '../controllers/prerequisite.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params } from '../middleware/validateRequest.middleware.js';
import { idParamSchema as id, prereqParamSchema as preId } from '../schemas/common.schema.js';
import { prerequisiteBodySchema as pre } from '../schemas/prerequisite.schema.js';

const r = Router();
const c = new PrerequisiteController();

// Public Routes
r.get('/:id', params(id), c.getPrerequisites);

// Protected Routes (Admin Only)
r.use(auth, flm(), roles('ADMIN'));

r.post('/', body(pre), c.addPrerequisite);
r.delete('/:cId/:pId', params(preId), c.rmvPrerequisite);

export default r;
