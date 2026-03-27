import * as db from '../db/db.js';
import * as Errors from '../errors/index.js';

class SectionService {
    constructor() {}

    async getSectionInfo(section_id) {
        const results = await db.queryStd('SELECT * FROM sections WHERE section_id = ?', [section_id]);

        if (results.length === 0) {
            throw new Errors.NotFoundError('Section not found.');
        }

        return results[0];
    }

    async getSectionsByCourse(course_code) {
        const course = await db.queryStd('SELECT course_id FROM courses WHERE course_code = ?', [course_code]);

        if (course.length === 0) {
            throw new Errors.NotFoundError('Course not found.');
        }

        const results = await db.queryStd('SELECT * FROM sections WHERE course_id = ?', [course[0].course_id]);

        return results;
    }

    async getSectionsBySemester(term, year) {
        const semester_id = await this.getSemesterId(term, year);

        const results = await db.queryStd('SELECT * FROM sections WHERE semester_id = ?', [semester_id]);

        return results;
    }

    async addSection(course_code, term, year, professorEmail, capacity, days, start_time, end_time) {
        const course = await db.queryStd('SELECT course_id FROM courses WHERE course_code = ?', [course_code]);

        if (course.length === 0) {
            throw new Errors.NotFoundError('Course not found.');
        }

        const semester_id = await this.getSemesterId(term, year);
        const professor_id = await this.getProfessorIdByEmail(professorEmail);

        await db.queryAdm(
            `INSERT INTO sections 
            (course_id, semester_id, professor_id, capacity, days, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course[0].course_id, semester_id, professor_id, capacity, days || null, start_time, end_time]
        );

        return null;
    }

    async updateSection(section_id, updatedData) {
        const exists = await this.sectionExists(section_id);

        if (!exists) {
            throw new Errors.NotFoundError('Section not found.');
        }

        let fields = [];
        let values = [];

        if (updatedData.professor_email) {
            const professor_id = await this.getProfessorIdByEmail(updatedData.professor_email);
            fields.push('professor_id = ?');
            values.push(professor_id);
        }

        if (updatedData.capacity !== undefined) {
            fields.push('capacity = ?');
            values.push(updatedData.capacity);
        }

        if (updatedData.days !== undefined) {
            fields.push('days = ?');
            values.push(updatedData.days || null);
        }

        if (updatedData.start_time !== undefined) {
            fields.push('start_time = ?');
            values.push(updatedData.start_time);
        }

        if (updatedData.end_time !== undefined) {
            fields.push('end_time = ?');
            values.push(updatedData.end_time);
        }

        if (fields.length === 0) {
            return null;
        }

        const sql = `UPDATE sections SET ${fields.join(', ')} WHERE section_id = ?`;
        values.push(section_id);

        await db.queryAdm(sql, values);

        return null;
    }

    async removeSection(section_id) {
        const exists = await this.sectionExists(section_id);

        if (!exists) {
            throw new Errors.NotFoundError('Section not found.');
        }

        await db.queryAdm('DELETE FROM sections WHERE section_id = ?', [section_id]);

        return null;
    }

    async getSemesterId(term, year) {
        const result = await db.queryStd('SELECT semester_id FROM semesters WHERE term = ? AND year = ?', [term, year]);

        if (result.length === 0) {
            throw new Errors.NotFoundError('Semester not found.');
        }

        return result[0].semester_id;
    }

    async getProfessorIdByEmail(email) {
        const user = await db.queryStd('SELECT user_id FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        const professor = await db.queryStd('SELECT professor_id FROM professors WHERE user_id = ?', [user[0].user_id]);

        if (professor.length === 0) {
            throw new Errors.NotFoundError('User is not a professor.');
        }

        return professor[0].professor_id;
    }

    async sectionExists(section_id) {
        const result = await db.queryStd('SELECT section_id FROM sections WHERE section_id = ?', [section_id]);

        return result.length > 0;
    }
}

export default SectionService;
