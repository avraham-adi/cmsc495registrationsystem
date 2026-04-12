/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisite.controller.js
input
validated prerequisite route requests and course relationship identifiers
output
HTTP responses for prerequisite list, add, and delete operations
description
Handles prerequisite relationship endpoints for reads and admin-managed dependency changes.
*/

import PrerequisiteService from '../../services/prerequisite.service.js';

class PrerequisiteController {
	constructor() {
		this.prerequisiteService = new PrerequisiteService();
		this.addPrerequisite = this.addPrerequisite.bind(this);
		this.rmvPrerequisite = this.rmvPrerequisite.bind(this);
		this.getPrerequisites = this.getPrerequisites.bind(this);
	}

	// Returns all prerequisite relationships for a single course.
	async getPrerequisites(req, res, next) {
		try {
			const courseId = req.params.id;
			const result = await this.prerequisiteService.getPrereqs(courseId);

			return res.status(200).json(result.data.map((prerequisite) => ({ Prerequisite: prerequisite })));
		} catch (error) {
			next(error);
		}
	}

	// Creates a prerequisite edge after duplicate and cycle checks pass.
	async addPrerequisite(req, res, next) {
		try {
			const courseId = req.body.cId;
			const prerequisiteId = req.body.pId;
			const prerequisite = await this.prerequisiteService.addPrereq(courseId, prerequisiteId);

			return res.status(201).json(prerequisite);
		} catch (error) {
			next(error);
		}
	}

	// Removes a prerequisite edge for the targeted course pair.
	async rmvPrerequisite(req, res, next) {
		try {
			const { cId, pId } = req.params;
			await this.prerequisiteService.rmvPrereq(cId, pId);

			return res.status(200).end();
		} catch (error) {
			next(error);
		}
	}
}

export default PrerequisiteController;
