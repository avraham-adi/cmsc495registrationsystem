/*
Adi Avraham
CMSC495 Group Golf Capstone Project
enrollment.controller.js
input
validated enrollment HTTP requests and authenticated user context
output
JSON enrollment responses and forwarded Express errors
description
Handles enrollment HTTP actions by delegating validation and lifecycle rules to the enrollment service.
*/

import EnrollmentService from '../../services/enrollment.service.js';

class EnrollmentController {
	constructor() {
		this.enrollmentService = new EnrollmentService();
		this.addEnrollment = this.addEnrollment.bind(this);
		this.updEnrollment = this.updEnrollment.bind(this);
		this.getEnrollment = this.getEnrollment.bind(this);
		this.rmvEnrollment = this.rmvEnrollment.bind(this);
		this.getEnrollments = this.getEnrollments.bind(this);
	}

	// Creates an enrollment while applying prerequisite, capacity, and waitlist rules in the service layer.
	async addEnrollment(req, res, next) {
		try {
			const { stuId, secId, code } = req.body;
			const enrollment = await this.enrollmentService.addEnroll(stuId, secId, req.user, code);

			return res.status(201).json(enrollment);
		} catch (err) {
			next(err);
		}
	}

	// Updates an enrollment status while enforcing role and transition restrictions.
	async updEnrollment(req, res, next) {
		try {
			const { id } = req.params;
			const { status, code } = req.body;
			const enrollment = await this.enrollmentService.updEnroll(id, status, req.user, code);

			return res.status(200).json(enrollment);
		} catch (err) {
			next(err);
		}
	}

	// Returns a single enrollment after ownership and role checks pass.
	async getEnrollment(req, res, next) {
		try {
			const { id } = req.params;
			const enrollment = await this.enrollmentService.getEnroll(id, req.user);

			return res.status(200).json(enrollment);
		} catch (err) {
			next(err);
		}
	}

	// Returns all enrollments for a student after ownership and role checks pass.
	async getEnrollments(req, res, next) {
		try {
			const { stuId } = req.query;
			const enrollments = await this.enrollmentService.getEnrollments(stuId, req.user);

			return res.status(200).json(enrollments.map((enrollment) => ({ Enrollment: enrollment })));
		} catch (err) {
			next(err);
		}
	}

	// Removes an enrollment record and lets the service handle any waitlist promotion side effects.
	async rmvEnrollment(req, res, next) {
		try {
			const { id } = req.params;
			await this.enrollmentService.rmvEnroll(id, req.user);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}
}

export default EnrollmentController;
