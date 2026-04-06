import PrerequisiteService from '../../services/prerequisite.service.js';

class PrerequisiteController {
	constructor() {
		this.p = new PrerequisiteService();
		this.addPrerequisite = this.addPrerequisite.bind(this);
		this.rmvPrerequisite = this.rmvPrerequisite.bind(this);
		this.getPrerequisites = this.getPrerequisites.bind(this);
	}

	// Express Get Prerequisites Method
	async getPrerequisites(req, res, next) {
		try {
			const courseId = req.params.id;
			const result = await this.p.getPrereqs(courseId);

			return res.status(200).json(result.data.map((p) => ({ Prerequisite: p })));
		} catch (error) {
			next(error);
		}
	}

	// Express Add Prerequisite Method
	async addPrerequisite(req, res, next) {
		try {
			const courseId = req.body.cId;
			const prerequisiteId = req.body.pId;
			const prerequisite = await this.p.addPrereq(courseId, prerequisiteId);

			return res.status(201).json(prerequisite);
		} catch (error) {
			next(error);
		}
	}

	// Express Delete Prerequisite Method
	async rmvPrerequisite(req, res, next) {
		try {
			const { cId, pId } = req.params;
			await this.p.rmvPrereq(cId, pId);

			return res.status(200).end();
		} catch (error) {
			next(error);
		}
	}
}

export default PrerequisiteController;
