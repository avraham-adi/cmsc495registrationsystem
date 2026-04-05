import SemesterService from '../../services/semester.service.js';

class SemesterController {
	constructor() {
		this.s = new SemesterService();
		this.getSemester = this.getSemester.bind(this);
		this.addSemester = this.addSemester.bind(this);
		this.rmvSemester = this.rmvSemester.bind(this);
		this.getSemesters = this.getSemesters.bind(this);
	}

	async getSemesters(req, res, next) {
		try {
			const semesters = await this.s.getSems();

			return res.status(200).json(semesters.map((s) => ({ Semester: s })));
		} catch (err) {
			next(err);
		}
	}

	async getSemester(req, res, next) {
		try {
			const { id } = req.params;
			const semester = await this.s.getSem(id);

			return res.status(200).json(semester);
		} catch (err) {
			next(err);
		}
	}

	async addSemester(req, res, next) {
		try {
			const { term, year } = req.body;
			const semester = await this.s.addSem(term, year);

			return res.status(201).json(semester);
		} catch (err) {
			next(err);
		}
	}

	async rmvSemester(req, res, next) {
		try {
			const { id } = req.params;
			await this.s.rmvSemester(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}
}

export default SemesterController;
