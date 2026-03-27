import * as db from '../db/db.js';
import * as Errors from '../errors/index.js';

class EnrollmentService {
    constructor() {}

    async enrollInSection(email, section_id) {
        const student_id = await this.getStudentIdByEmail(email);

        // Validate section exists
        const section = await db.queryStd('SELECT capacity FROM sections WHERE section_id = ?', [section_id]);

        if (section.length === 0) {
            throw new Errors.NotFoundError('Section not found.');
        }

        // Check if already enrolled
        const existing = await db.queryStd('SELECT * FROM enrollments WHERE student_id = ? AND section_id = ?', [student_id, section_id]);

        if (existing.length > 0) {
            throw new Errors.ValidationError('Already enrolled in this section.');
        }

        // Check capacity
        const count = await db.queryStd('SELECT COUNT(*) AS total FROM enrollments WHERE section_id = ? AND status = "enrolled"', [section_id]);

        if (count[0].total >= section[0].capacity) {
            throw new Errors.ValidationError('Section is full.');
        }

        // Insert enrollment
        await db.queryAdm(
            `INSERT INTO enrollments (student_id, section_id, status)
             VALUES (?, ?, 'enrolled')`,
            [student_id, section_id]
        );

        return null;
    }

    async dropEnrollment(email, section_id) {
        const student_id = await this.getStudentIdByEmail(email);

        const existing = await db.queryStd('SELECT * FROM enrollments WHERE student_id = ? AND section_id = ? AND status = "enrolled"', [student_id, section_id]);

        if (existing.length === 0) {
            throw new Errors.NotFoundError('Enrollment not found.');
        }

        await db.queryAdm(
            `UPDATE enrollments 
             SET status = 'dropped' 
             WHERE student_id = ? AND section_id = ?`,
            [student_id, section_id]
        );

        return null;
    }

    async getStudentEnrollments(email) {
        const student_id = await this.getStudentIdByEmail(email);

        const results = await db.queryStd(
            `SELECT e.enrollment_id, e.status, s.section_id, c.course_code, sem.term, sem.year
             FROM enrollments e
             JOIN sections s ON e.section_id = s.section_id
             JOIN courses c ON s.course_id = c.course_id
             JOIN semesters sem ON s.semester_id = sem.semester_id
             WHERE e.student_id = ?`,
            [student_id]
        );

        return results;
    }

    async getSectionRoster(section_id) {
        const results = await db.queryStd(
            `SELECT u.name, u.email, e.status
             FROM enrollments e
             JOIN students s ON e.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             WHERE e.section_id = ?`,
            [section_id]
        );

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
