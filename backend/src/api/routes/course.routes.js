import { Router } from 'express';
import CourseController from '../controllers/course.controller.js';
import auth, { flMw as flm } from '../../middleware/session.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import {
	validateBody as body,
	validateParams as params,
	validateQuery as query,
} from '../middleware/validateRequest.middleware.js';
import { courseBodySchema as course, getAllCoursesQuerySchema as courses } from '../schemas/course.schemas.js';
import { idParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new CourseController();

// Public Course Routes
r.get('/:id', params(id), c.getCourse);
r.get('/', query(courses), c.getCourses);

// Apply auth + first-login + ADMIN role to all routes below
r.use(auth, flm(), roles('ADMIN'));

// Protected Course Routes (Requires ADMIN authorization)
r.post('/', body(course), c.addCourse);
r.put('/:id', params(id), body(course), c.updCourse);
r.delete('/:id', params(id), c.rmvCourse);

export default r;
