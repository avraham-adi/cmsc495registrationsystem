import CourseService from '../../services/course.service.js';

class CourseController {
	constructor() {
		this.c = new CourseService();
		this.getCourse = this.getCourse.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.updCourse = this.updCourse.bind(this);
		this.rmvCourse = this.rmvCourse.bind(this);
		this.getCourses = this.getCourses.bind(this);
	}

	async getCourse(req, res, next) {
		try {
			const { id } = req.params;
			const course = await this.c.getCourse(id);

			return res.status(200).json(course);
		} catch (err) {
			next(err);
		}
	}

	async addCourse(req, res, next) {
		try {
			const { code, title, desc, cred } = req.body;
			const course = await this.c.addCourse({
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(201).json(course);
		} catch (err) {
			next(err);
		}
	}

	async updCourse(req, res, next) {
		try {
			const { id } = req.params;
			const { code, title, desc, cred } = req.body;
			const course = await this.c.updCourse(id, {
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(200).json(course);
		} catch (err) {
			next(err);
		}
	}

	async rmvCourse(req, res, next) {
		try {
			const { id } = req.params;
			await this.c.rmvCourse(id);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	async getCourses(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', subject = null } = req.query;
			const result = await this.c.getCourses(page, limit, search, subject);

			return res.status(200).json({
				Course: result.data.map((c) => ({ Course: c })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}
}

export default CourseController;
