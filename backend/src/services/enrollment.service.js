import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';

// Professor Access Code implementation will come later
const WAITLIST_ACCESS_CODE = 'PROF-OVERRIDE-TEMP';

class EnrollmentService {
    constructor() {}

    // Helper Functions
    async getEnrollment(student_id, section_id) {
        const rows = await db.queryStd('SELECT * FROM enrollments WHERE student_id = ? AND section_id = ?', [student_id, section_id]);
        return rows[0] || null;
    }

    async verifySectionCapacity(section_id) {
        const section = await db.queryStd('SELECT capacity FROM sections WHERE section_id = ?', [section_id]);

        if (section.length === 0) {
            throw new Errors.NotFoundError('Section not found.');
        }

        const count = await db.queryStd('SELECT COUNT(*) AS total FROM enrollments WHERE section_id = ? AND status = ?', [section_id, 'enrolled']);

        return count[0].total >= section[0].capacity;
    }

    // Check Access Code
    isValidWaitlistAccessCode(accessCode) {
        return accessCode === WAITLIST_ACCESS_CODE;
    }

    // Enroll in a section
    async enrollInSection(email, section_id, accessCode = null) {
        const student_id = await this.getStudentIdByEmail(email);

        const existing = await db.queryStd('SELECT enrollment_id, status FROM enrollments WHERE student_id = ? AND section_id = ?', [student_id, section_id]);

        if (existing.length > 0) {
            const currentStatus = existing[0].status;

            if (currentStatus === 'enrolled') {
                throw new Errors.ValidationError('Already enrolled in this section.');
            }

            if (currentStatus === 'completed') {
                throw new Errors.ValidationError('Cannot re-enroll in a completed section.');
            }

            if (currentStatus === 'dropped') {
                if (await this.verifySectionCapacity(section_id)) {
                    throw new Errors.ValidationError('Section is full.');
                }

                await db.queryAdm('UPDATE enrollments SET status = ? WHERE student_id = ? AND section_id = ?', ['enrolled', student_id, section_id]);
                return null;
            }

            if (currentStatus === 'waitlisted') {
                if (!this.isValidWaitlistAccessCode(accessCode)) {
                    throw new Errors.ValidationError('Valid professor access code required to enroll from waitlist.');
                }

                if (await this.verifySectionCapacity(section_id)) {
                    throw new Errors.ValidationError('Section is full.');
                }

                await db.queryAdm('UPDATE enrollments SET status = ? WHERE student_id = ? AND section_id = ?', ['enrolled', student_id, section_id]);
                return null;
            }

            throw new Errors.ValidationError('Invalid enrollment state.');
        }

        if (await this.verifySectionCapacity(section_id)) {
            throw new Errors.ValidationError('Section is full.');
        }

        await db.queryAdm('INSERT INTO enrollments (student_id, section_id, status) VALUES (?, ?, ?)', [student_id, section_id, 'enrolled']);

        return null;
    }

    async dropEnrollment(email, section_id) {
        const student_id = await this.getStudentIdByEmail(email);

        const existing = await db.queryStd('SELECT * FROM enrollments WHERE student_id = ? AND section_id = ? AND status = "enrolled"', [student_id, section_id]);

        if (existing.length === 0) {
            throw new Errors.NotFoundError('Enrollment not found.');
        }

        await db.queryAdm('UPDATE enrollments SET status = ? WHERE student_id = ? AND section_id = ? AND status = ?', ['dropped', student_id, section_id, 'enrolled']);

        return null;
    }

    async getStudentEnrollments(email) {
        const student_id = await this.getStudentIdByEmail(email);

        const results = await db.queryStd('SELECT e.enrollment_id, e.status, s.section_id, c.course_code, sem.term, sem.year FROM enrollments e JOIN sections s ON e.section_id = s.section_id JOIN courses c ON s.course_id = c.course_id JOIN semesters sem ON s.semester_id = sem.semester_id WHERE e.student_id = ?', [student_id]);

        return results;
    }

    async getSectionRoster(section_id) {
        const results = await db.queryStd('SELECT u.name, u.email, e.status FROM enrollments e JOIN students s ON e.student_id = s.student_id JOIN users u ON s.user_id = u.user_id WHERE e.section_id = ?  AND e.status = ?', [section_id, 'enrolled']);

        if (results.length === 0) {
            throw new Errors.NotFoundError('No enrollments found for this section.');
        }

        return results;
    }

    async getStudentIdByEmail(email) {
        const user = await db.queryStd('SELECT user_id FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        const student = await db.queryStd('SELECT student_id FROM students WHERE user_id = ?', [user[0].user_id]);

        if (student.length === 0) {
            throw new Errors.ValidationError('User is not a student.');
        }

        return student[0].student_id;
    }
}

export default EnrollmentService;
