import { Router } from 'express';
import SemesterController from '../controllers/semester.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import { validateBody as body, validateParams as params } from '../middleware/validateRequest.middleware.js';
import { semesterBodySchema as semester } from '../schemas/semester.schema.js';
import { idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new SemesterController();

r.get('/', c.getSemesters);
r.get('/:id', params(id), c.getSemester);

r.use(auth, flm(), roles('ADMIN'));

r.post('/', body(semester), c.addSemester);
r.delete('/:id', params(id), c.rmvSemester);

export default r;
