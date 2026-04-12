/*
Adi Avraham
CMSC495 Group Golf Capstone Project
course.service.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Implements course catalog creation, reads, updates, deletes, and subject-filter validation.
*/

import * as db from '../db/connection.js';
import Course from '../domain/course.js';
import * as Errors from '../errors/index.js';
import { getSubjectNameFromCourseCode } from '../utils/courseSubjects.js';

class CourseService {
    constructor() {}

    async getCourse(courseId) {
        const r = await db.query('SELECT course_id, course_code, title, description, credits FROM courses WHERE course_id = ?', [courseId]);

        if (r.length === 0) {
            throw new Errors.NotFoundError('Course not found.');
        }

        return Course.fromPersistence(r[0]).toObject();
    }

    async addCourse(courseData) {
        const { course_code, title, description, credits } = courseData;

        const e = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_code = ?', [course_code]);

        if (e[0].count > 0) {
            throw new Errors.DuplicateEntryError('Course with this course code already exists.');
        }

        const x = await db.query('INSERT INTO courses (course_code, title, description, credits) VALUES (?, ?, ?, ?)', [course_code, title, description, credits]);

        const r = await db.query('SELECT course_id, course_code, title, description, credits FROM courses WHERE course_id = ?', [x.insertId]);

        if (r.length === 0) {
            throw new Errors.DatabaseError('Failed to retrieve newly created course.');
        }

        return Course.fromPersistence(r[0]).toObject();
    }

    async updCourse(courseId, courseData) {
        const { course_code, title, description, credits } = courseData;

        const e = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_id = ?', [courseId]);

        if (e[0].count === 0) {
            throw new Errors.NotFoundError('Course not found.');
        }

        const d = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_code = ? AND course_id <> ?', [course_code, courseId]);

        if (d[0].count > 0) {
            throw new Errors.DuplicateEntryError('Course with this course code already exists.');
        }

        await db.query('UPDATE courses SET course_code = ?, title = ?, description = ?, credits = ? WHERE course_id = ?', [course_code, title, description, credits, courseId]);

        const r = await db.query('SELECT course_id, course_code, title, description, credits FROM courses WHERE course_id = ?', [courseId]);

        if (r.length === 0) {
            throw new Errors.DatabaseError('Failed to retrieve updated course.');
        }

        return Course.fromPersistence(r[0]).toObject();
    }

    async rmvCourse(courseId) {
        const e = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_id = ?', [courseId]);

        if (e[0].count === 0) {
            throw new Errors.NotFoundError('Course not found.');
        }

        const d = await db.query('SELECT COUNT(*) AS count FROM sections WHERE course_id = ?', [courseId]);

        if (d[0].count > 0) {
            throw new Errors.ValidationError('Cannot delete a course that has scheduled sections. Remove or archive its sections first.');
        }

        await db.query('DELETE FROM courses WHERE course_id = ?', [courseId]);
    }

	async getCourses(page, limit, search, subject) {
		const p = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
		const l = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 10;
		const o = (p - 1) * l;

		let w = [];
		let a = [];

		if (search) {
			w.push('(course_code LIKE ? OR title LIKE ? OR description LIKE ?)');
			a.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
		}

		if (subject) {
			const s = String(subject).toUpperCase().trim();
			w.push('course_code LIKE ?');
			a.push(s + '%');
		}

		const q = w.length > 0 ? 'WHERE ' + w.join(' AND ') : '';
		const c = await db.query('SELECT COUNT(*) AS count FROM courses ' + q, a);
		const r = await db.query('SELECT course_id, course_code, title, description, credits FROM courses ' + q + ' ORDER BY course_code ASC, course_id ASC LIMIT ? OFFSET ?', [...a, l, o]);
		const data = r.map((row) => ({
			...Course.fromPersistence(row).toObject(),
			subject: getSubjectNameFromCourseCode(row.course_code),
		}));

		return {
			data,
			meta: {
				page: p,
				limit: l,
				total: c[0].count,
				totalPages: Math.ceil(c[0].count / l),
			},
		};
	}
}

export default CourseService;
