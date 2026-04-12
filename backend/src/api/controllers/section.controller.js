/*
Adi Avraham
CMSC495 Group Golf Capstone Project
section.controller.js
input
validated section requests, section ids, and access-code route inputs
output
HTTP responses for section CRUD and professor access-code workflows
description
Handles section CRUD endpoints plus professor access-code reads, generation, and revocation.
*/

import SectionService from '../../services/section.service.js';

class SectionController {
	constructor() {
		this.sectionService = new SectionService();
		this.getAcCodes = this.getAcCodes.bind(this);
		this.genAcCodes = this.genAcCodes.bind(this);
		this.revAcCodes = this.revAcCodes.bind(this);
		this.addSection = this.addSection.bind(this);
		this.getSection = this.getSection.bind(this);
		this.updSection = this.updSection.bind(this);
		this.rmvSection = this.rmvSection.bind(this);
		this.getSections = this.getSections.bind(this);
	}

	// Creates a new section for the requested course and semester.
	async addSection(req, res, next) {
		try {
			const { cId } = req.params;
			const { semId, profId, capacity, days, startTm, endTm } = req.body;
			const section = await this.sectionService.addSection(cId, semId, profId, capacity, days, startTm, endTm);

			return res.status(201).json(section);
		} catch (err) {
			next(err);
		}
	}

	// Returns a single section in the readable frontend response shape.
	async getSection(req, res, next) {
		try {
			const { id } = req.params;
			const section = await this.sectionService.getReadableSection(id);

			return res.status(200).json(section);
		} catch (err) {
			next(err);
		}
	}

	// Returns a paginated section list with optional course, semester, professor, subject, and day filters.
	async getSections(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', crsId = null, semId = null, profId = null, subject = null, days = null } = req.query;
			const result = await this.sectionService.getSections(page, limit, search, crsId, semId, profId, subject, days);

			return res.status(200).json({
				Section: result.data.map((section) => ({ Section: section })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Updates the scheduling, capacity, semester, or professor assignment for a section.
	async updSection(req, res, next) {
		try {
			const { id } = req.params;
			const { semId, profId, capacity, days, startTm, endTm } = req.body;
			const section = await this.sectionService.updSection(id, {
				semesterId: semId,
				professorId: profId,
				capacity,
				days,
				startTime: startTm,
				endTime: endTm,
			});

			return res.status(200).json(section);
		} catch (err) {
			next(err);
		}
	}

	// Deletes a section after dependency checks pass in the service layer.
	async rmvSection(req, res, next) {
		try {
			const { id } = req.params;
			await this.sectionService.rmvSection(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Returns the access-code map for a professor-owned section.
	async getAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const accessCodes = await this.sectionService.getAcCodes(id, req.user);

			return res.status(200).json(accessCodes);
		} catch (err) {
			next(err);
		}
	}

	// Generates additional access codes for a professor-owned section.
	async genAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const { numCodes } = req.body;
			const newAccessCodes = await this.sectionService.genAcCodes(id, numCodes, req.user);

			return res.status(200).json(newAccessCodes);
		} catch (err) {
			next(err);
		}
	}

	// Revokes one or more access codes from a professor-owned section.
	async revAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const codesToRevoke = req.query.codes
				.split(',')
				.map((code) => code.trim())
				.filter(Boolean);
			await this.sectionService.revAcCodes(id, codesToRevoke, req.user);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}
}

export default SectionController;
