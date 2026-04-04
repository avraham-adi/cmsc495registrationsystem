import SemesterService from '../../services/semester.service.js';

class SemesterController {
	constructor() {
		this.s = new SemesterService();
		this.getAllSemesters = this.getAllSemesters.bind(this);
		this.getSemesterInfo = this.getSemesterInfo.bind(this);
		this.addSemester = this.addSemester.bind(this);
		this.removeSemester = this.removeSemester.bind(this);
	}

	async getAllSemesters(req, res, next) {
		try {
			const semesters = await this.s.getAllSemesters();

			return res.status(200).json({ semesters: semesters });
		} catch (err) {
			next(err);
		}
	}

	async getSemesterInfo(req, res, next) {
		try {
			const { semesterId } = req.params;
			const semester = await this.s.getSemesterInfo(semesterId);

			return res.status(200).json({ semester: semester });
		} catch (err) {
			next(err);
		}
	}

	async addSemester(req, res, next) {
		try {
			const { term, year } = req.body;
			const semester = await this.s.addSemester(term, year);

			return res.status(201).json({
				message: 'Semester added successfully.',
				semester: semester,
			});
		} catch (err) {
			next(err);
		}
	}

	async removeSemester(req, res, next) {
		try {
			const { semesterId } = req.params;
			await this.s.removeSemester(semesterId);

			return res.status(200).json({ message: 'Semester removed successfully.' });
		} catch (err) {
			next(err);
		}
	}
}

export default SemesterController;
