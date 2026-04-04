import CourseService from '../../services/course.service.js';

class CourseController {
	constructor() {
		this.c = new CourseService();
		this.getInfo = this.getInfo.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.updateCourse = this.updateCourse.bind(this);
		this.removeCourse = this.removeCourse.bind(this);
		this.getCourses = this.getCourses.bind(this);
	}

	async getInfo(req, res, next) {
		try {
			const { courseId } = req.params;
			const course = await this.c.getCourseInfo(courseId);

			return res.status(200).json(course.toObject());
		} catch (err) {
			next(err);
		}
	}

	async addCourse(req, res, next) {
		try {
			const { code, title, desc, cred } = req.body;
			const course = await this.c.addNewCourse({
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(201).json({
				message: 'Course added successfully.',
				course: course.toObject(),
			});
		} catch (err) {
			next(err);
		}
	}

	async updateCourse(req, res, next) {
		try {
			const { id } = req.params;
			const { code, title, desc, cred } = req.body;
			const course = await this.c.updateCourse(id, {
				course_code: code,
				title: title,
				description: desc,
				credits: cred,
			});

			return res.status(200).json({
				message: 'Course updated successfully.',
				course: course.toObject(),
			});
		} catch (err) {
			next(err);
		}
	}

	async removeCourse(req, res, next) {
		try {
			const { id } = req.params;
			await this.c.removeCourse(id);

			return res.status(200).json({ message: 'Course deleted successfully.' });
		} catch (err) {
			next(err);
		}
	}

	async getCourses(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', subject = null } = req.query;
			const result = await this.c.getAllCourses(page, limit, search, subject);

			return res.status(200).json({
				courses: result.data,
				meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}
}

export default CourseController;
