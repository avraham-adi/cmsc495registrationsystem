/*
Adi Avraham
CMSC495 Group Golf Capstone Project
enrollment.routes.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the enrollment API routes for student enrollment reads and mutations.
*/

import { Router } from 'express';
import EnrollmentController from '../controllers/enrollment.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params, validateQuery as query } from '../middleware/validateRequest.middleware.js';
import { enrollmentCreateBodySchema as create, enrollmentListQuerySchema as list, enrollmentUpdateBodySchema as upd } from '../schemas/enrollment.schema.js';
import { idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new EnrollmentController();

// Apply auth + first-login to all routes
r.use(auth, flm(), roles('ADMIN', 'STUDENT'));

// Protected Enrollment Routes (Requires ADMIN or STUDENT authorization)
r.get('/', query(list), c.getEnrollments);
r.get('/:id', params(id), c.getEnrollment);
r.post('/', body(create), c.addEnrollment);
r.put('/:id', params(id), body(upd), c.updEnrollment);
r.delete('/:id', roles('ADMIN'), params(id), c.rmvEnrollment);

export default r;
