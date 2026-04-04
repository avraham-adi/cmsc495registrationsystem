import { Router } from 'express';
import CourseController from '../controllers/course.controller.js';
import { authMiddleware as auth, firstLoginMiddleware as flm } from '../../middleware/auth.middleware.js';
import { default as roles } from '../../middleware/rbac.middleware.js';
import {
	validateBody as body,
	validateParams as params,
	validateQuery as query,
} from '../middleware/validateRequest.middleware.js';
import { courseBodySchema as course, getAllCoursesQuerySchema as courses } from '../schemas/course.schemas.js';
import { courseIdParamSchema as id } from '../schemas/common.schema.js';

const r = Router();
const c = new CourseController();

// Public Course Routes
r.get('/:courseId', params(id), c.getInfo);
r.get('/', query(courses), c.getCourses);

// Apply auth + first-login + ADMIN role to all routes below
r.use(auth, flm(), roles('ADMIN'));

// Protected Course Routes (Requires ADMIN authorization)
r.post('/', body(course), c.addCourse);
r.put('/:courseId', params(id), body(course), c.updateCourse);
r.delete('/:courseId', params(id), c.removeCourse);

export default r;
