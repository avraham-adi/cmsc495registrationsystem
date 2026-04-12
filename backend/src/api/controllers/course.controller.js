/*
Adi Avraham
CMSC495 Group Golf Capstone Project
course.controller.js
input
validated course route requests, query filters, and route parameters
output
HTTP responses for course reads, writes, and deletes
description
Handles course catalog CRUD endpoints and paginated course search responses.
*/

import CourseService from '../../services/course.service.js';

class CourseController {
	constructor() {
		this.courseService = new CourseService();
		this.getCourse = this.getCourse.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.updCourse = this.updCourse.bind(this);
		this.rmvCourse = this.rmvCourse.bind(this);
		this.getCourses = this.getCourses.bind(this);
	}

	// Returns a single course record by id.
	async getCourse(req, res, next) {
		try {
			const { id } = req.params;
			const course = await this.courseService.getCourse(id);

			return res.status(200).json(course);
		} catch (err) {
			next(err);
		}
	}

	// Creates a course from the validated admin payload.
	async addCourse(req, res, next) {
		try {
			const { code, title, desc, cred } = req.body;
			const course = await this.courseService.addCourse({
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(201).json(course);
		} catch (err) {
			next(err);
		}
	}

	// Updates an existing course while preserving course-code uniqueness rules.
	async updCourse(req, res, next) {
		try {
			const { id } = req.params;
			const { code, title, desc, cred } = req.body;
			const course = await this.courseService.updCourse(id, {
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(200).json(course);
		} catch (err) {
			next(err);
		}
	}

	// Deletes a course after the service verifies no blocking dependencies remain.
	async rmvCourse(req, res, next) {
		try {
			const { id } = req.params;
			await this.courseService.rmvCourse(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Returns a paginated course list with optional search and subject filters.
	async getCourses(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', subject = null } = req.query;
			const result = await this.courseService.getCourses(page, limit, search, subject);

			return res.status(200).json({
				Course: result.data.map((course) => ({ Course: course })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}
}

export default CourseController;
