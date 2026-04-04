import PrerequisiteService from '../../services/prerequisite.service.js';

class PrerequisiteController {
	constructor() {
		this.p = new PrerequisiteService();
		this.getPrerequisites = this.getPrerequisites.bind(this);
		this.addPrerequisite = this.addPrerequisite.bind(this);
		this.deletePrerequisite = this.deletePrerequisite.bind(this);
	}

	// Express Get Prerequisites Method
	async getPrerequisites(req, res, next) {
		try {
			const courseId = req.params.courseId;
			const result = await this.p.getPrerequisites(courseId);

			return res.status(200).json({
				message: 'Prerequisites retrieved successfully.',
				data: result.data,
			});
		} catch (error) {
			next(error);
		}
	}

	// Express Add Prerequisite Method
	async addPrerequisite(req, res, next) {
		try {
			const courseId = req.body.courseId;
			const prerequisiteId = req.body.prerequisiteId;
			const prerequisite = await this.p.addPrerequisite(courseId, prerequisiteId);

			return res.status(201).json({
				message: 'Prerequisite added successfully.',
				prerequisite: prerequisite,
			});
		} catch (error) {
			next(error);
		}
	}

	// Express Delete Prerequisite Method
	async deletePrerequisite(req, res, next) {
		try {
			const { courseId, prerequisiteId } = req.params;
			await this.p.removePrerequisite(courseId, prerequisiteId);

			return res.status(200).json({ message: 'Prerequisite removed successfully.' });
		} catch (error) {
			next(error);
		}
	}
}

export default PrerequisiteController;
