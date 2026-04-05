import SectionService from '../../services/section.service.js';

class SectionController {
	constructor() {
		this.s = new SectionService();
		this.getAcCodes = this.getAcCodes.bind(this);
		this.genAcCodes = this.genAcCodes.bind(this);
		this.revAcCodes = this.revAcCodes.bind(this);
		this.addSection = this.addSection.bind(this);
		this.getSection = this.getSection.bind(this);
		this.updSection = this.updSection.bind(this);
		this.rmvSection = this.rmvSection.bind(this);
		this.getSections = this.getSections.bind(this);
	}

	// Express Add Section Method
	async addSection(req, res, next) {
		try {
			const { cId } = req.params;
			const { semId, profId, capacity, days, startTm, endTm } = req.body;
			const section = await this.s.addSection(cId, semId, profId, capacity, days, startTm, endTm);

			return res.status(201).json(section);
		} catch (err) {
			next(err);
		}
	}

	// Express Get Section Info Method
	async getSection(req, res, next) {
		try {
			const { id } = req.params;
			const section = await this.s.getSection(id);

			return res.status(200).json(section);
		} catch (err) {
			next(err);
		}
	}

	// Express Get All Sections Method
	async getSections(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', crsId = null, semId = null, profId = null } = req.query;
			const result = await this.s.getSections(page, limit, search, crsId, semId, profId);

			return res.status(200).json({
				Section: result.data.map((s) => ({ Section: s })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Update Section Method
	async updSection(req, res, next) {
		try {
			const { id } = req.params;
			const { semId, profId, capacity, days, startTm, endTm } = req.body;
			const section = await this.s.updSection(id, {
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

	// Express Remove Section Method
	async rmvSection(req, res, next) {
		try {
			const { id } = req.params;
			await this.s.rmvSection(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Express Get Section Access Codes Method
	async getAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const accessCodes = await this.s.getAcCodes(id, req.user);

			return res.status(200).json(accessCodes);
		} catch (err) {
			next(err);
		}
	}

	// Express Generate More Access Codes Method
	async genAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const { numCodes } = req.body;
			const newAccessCodes = await this.s.genAcCodes(id, numCodes, req.user);

			return res.status(200).json(newAccessCodes);
		} catch (err) {
			next(err);
		}
	}

	// Express Revoke Section Access Codes Method
	async revAcCodes(req, res, next) {
		try {
			const { id } = req.params;
			const codesToRevoke = req.query.codes
				.split(',')
				.map((c) => c.trim())
				.filter(Boolean);
			await this.s.revAcCodes(id, codesToRevoke, req.user);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}
}

export default SectionController;
