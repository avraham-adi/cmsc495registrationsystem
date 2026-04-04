import SectionService from '../../services/section.service.js';

class SectionController {
	constructor() {
		this.s = new SectionService();
		this.addSection = this.addSection.bind(this);
		this.getSectionInfo = this.getSectionInfo.bind(this);
		this.updateSection = this.updateSection.bind(this);
		this.removeSection = this.removeSection.bind(this);
		this.getAllSections = this.getAllSections.bind(this);
		this.getAccessCodes = this.getAccessCodes.bind(this);
		this.generateAccessCodes = this.generateAccessCodes.bind(this);
		this.revokeAccessCodes = this.revokeAccessCodes.bind(this);
	}

	// Express Add Section Method
	async addSection(req, res, next) {
		try {
			const { courseId } = req.params;
			const { semesterId, professorId, capacity, days, startTime, endTime } = req.body;
			const section = await this.s.addSection(
				courseId,
				semesterId,
				professorId,
				capacity,
				days,
				startTime,
				endTime
			);

			return res.status(201).json({
				message: 'Section added successfully.',
				section: section,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Get Section Info Method
	async getSectionInfo(req, res, next) {
		try {
			const { sectionId } = req.params;
			const section = await this.s.getSectionInfo(sectionId);

			return res.status(200).json({
				message: 'Section info retrieved successfully.',
				section: section,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Get All Sections Method
	async getAllSections(req, res, next) {
		try {
			const { courseId } = req.params;
			const { page = 1, limit = 10, search = '', semesterId = null, professorId = null } = req.query;
			const result = await this.s.getAllSections(page, limit, search, courseId ?? null, semesterId, professorId);

			return res.status(200).json({
				sections: result.data,
				meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Update Section Method
	async updateSection(req, res, next) {
		try {
			const { sectionId } = req.params;
			const { semesterId, professorId, capacity, days, startTime, endTime } = req.body;
			const section = await this.s.updateSection(sectionId, {
				semesterId,
				professorId,
				capacity,
				days,
				startTime,
				endTime,
			});

			return res.status(200).json({
				message: 'Section updated successfully.',
				section: section,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Remove Section Method
	async removeSection(req, res, next) {
		try {
			const { sectionId } = req.params;
			await this.s.removeSection(sectionId);

			return res.status(200).json({ message: 'Section removed successfully.' });
		} catch (err) {
			next(err);
		}
	}

	// Express Get Section Access Codes Method
	async getAccessCodes(req, res, next) {
		try {
			const { sectionId } = req.params;
			const accessCodes = await this.s.getAccessCodes(sectionId, req.user);

			return res.status(200).json({
				message: 'Section access codes retrieved successfully.',
				accessCodes: accessCodes,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Generate More Access Codes Method
	async generateAccessCodes(req, res, next) {
		try {
			const { sectionId } = req.params;
			const { numCodes } = req.body ?? {};
			const newAccessCodes = await this.s.generateAccessCodes(sectionId, numCodes, req.user);

			return res.status(200).json({
				message: 'New access codes generated successfully.',
				newAccessCodes: newAccessCodes,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Revoke Section Access Codes Method
	async revokeAccessCodes(req, res, next) {
		try {
			const { sectionId } = req.params;
			const { codesToRevoke } = req.body ?? {};
			await this.s.revokeAccessCodes(sectionId, codesToRevoke, req.user);

			return res.status(200).json({ message: 'Access codes revoked successfully.' });
		} catch (err) {
			next(err);
		}
	}
}

export default SectionController;
