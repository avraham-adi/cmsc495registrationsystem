import { Router } from 'express';
import EnrollmentController from '../controllers/enrollment.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params } from '../middleware/validateRequest.middleware.js';
import { enrollmentCreateBodySchema as create, enrollmentUpdateBodySchema as upd } from '../schemas/enrollment.schema.js';
import { idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new EnrollmentController();

// Apply auth + first-login to all routes
r.use(auth, flm(), roles('ADMIN', 'STUDENT'));

// Protected Enrollment Routes (Requires ADMIN or STUDENT authorization)
r.get('/:id', params(id), c.getEnrollment);
r.post('/', body(create), c.addEnrollment);
r.put('/:id', params(id), body(upd), c.updEnrollment);
r.delete('/:id', roles('ADMIN'), params(id), c.rmvEnrollment);

export default r;
