import EnrollmentService from '../../services/enrollment.service.js';

class EnrollmentController {
	constructor() {
		this.e = new EnrollmentService();
		this.addEnrollment = this.addEnrollment.bind(this);
		this.updateEnrollment = this.updateEnrollment.bind(this);
		this.getEnrollmentInfo = this.getEnrollmentInfo.bind(this);
		this.removeEnrollment = this.removeEnrollment.bind(this);
	}

	// Express Add Enrollment Method
	// Missing Prerequisite Check, Section Capacity Check, and Waitlist Handling for now - will be added in future iterations
	async addEnrollment(req, res, next) {
		try {
			const { studentId, sectionId, accessCode } = req.body;
			const enrollment = await this.e.addEnrollment(studentId, sectionId, req.user, accessCode);

			return res.status(201).json({
				message: 'Enrollment added successfully.',
				enrollment,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express update Enrollment Method
	async updateEnrollment(req, res, next) {
		try {
			const { enrollmentId } = req.params;
			const { status, accessCode } = req.body;
			const enrollment = await this.e.updateEnrollment(enrollmentId, status, req.user, accessCode);

			return res.status(200).json({
				message: 'Enrollment updated successfully.',
				enrollment,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Get Enrollment Info Method
	async getEnrollmentInfo(req, res, next) {
		try {
			const { enrollmentId } = req.params;
			const enrollment = await this.e.getEnrollmentInfo(enrollmentId, req.user);

			return res.status(200).json({
				message: 'Enrollment info retrieved successfully.',
				enrollment,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Remove Enrollment Method
	async removeEnrollment(req, res, next) {
		try {
			const { enrollmentId } = req.params;
			await this.e.removeEnrollment(enrollmentId, req.user);

			return res.status(200).json({ message: 'Enrollment removed successfully.' });
		} catch (err) {
			next(err);
		}
	}
}

export default EnrollmentController;
