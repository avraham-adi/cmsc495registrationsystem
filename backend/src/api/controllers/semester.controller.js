/*
Adi Avraham
CMSC495 Group Golf Capstone Project
semester.controller.js
input
validated semester requests and semester route identifiers
output
HTTP responses for semester list, create, read, and delete workflows
description
Handles semester endpoints used by admin tools and student/professor read flows.
*/

import SemesterService from '../../services/semester.service.js';

class SemesterController {
	constructor() {
		this.semesterService = new SemesterService();
		this.getSemester = this.getSemester.bind(this);
		this.addSemester = this.addSemester.bind(this);
		this.rmvSemester = this.rmvSemester.bind(this);
		this.getSemesters = this.getSemesters.bind(this);
	}

	// Returns all semesters in the canonical descending sort order.
	async getSemesters(req, res, next) {
		try {
			const semesters = await this.semesterService.getSems();

			return res.status(200).json(semesters.map((semester) => ({ Semester: semester })));
		} catch (err) {
			next(err);
		}
	}

	// Returns a single semester by id.
	async getSemester(req, res, next) {
		try {
			const { id } = req.params;
			const semester = await this.semesterService.getSem(id);

			return res.status(200).json(semester);
		} catch (err) {
			next(err);
		}
	}

	// Creates a semester from the validated admin request body.
	async addSemester(req, res, next) {
		try {
			const { term, year } = req.body;
			const semester = await this.semesterService.addSem(term, year);

			return res.status(201).json(semester);
		} catch (err) {
			next(err);
		}
	}

	// Deletes a semester after the service confirms no blocking sections remain.
	async rmvSemester(req, res, next) {
		try {
			const { id } = req.params;
			await this.semesterService.rmvSemester(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}
}

export default SemesterController;
