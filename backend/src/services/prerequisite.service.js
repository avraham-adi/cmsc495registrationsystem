import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';

class PrerequisiteService {
    constructor() {}

    async getPrereqs(courseId) {
        const c = await db.query('SELECT COUNT(*) as count FROM courses WHERE course_id = ?', [courseId]);
        if (Number(c[0].count) === 0) {
            throw new Errors.CourseNotFoundError(courseId);
        }

        const r = await db.query('SELECT c.course_id, c.course_code, c.title FROM prerequisites p INNER JOIN courses c ON p.prerequisite_course_id = c.course_id WHERE p.course_id = ? ORDER BY c.course_code ASC', [courseId]);

        return {
            data: r.map((row) => ({
                courseId: row.course_id,
                courseCode: row.course_code,
                title: row.title,
            })),
        };
    }

    async addPrereq(courseId, prerequisiteId) {
        const c = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_id = ?', [courseId]);
        if (c[0].count === 0) {
            throw new Errors.CourseNotFoundError(courseId);
        }

        const p = await db.query('SELECT COUNT(*) AS count FROM courses WHERE course_id = ?', [prerequisiteId]);
        if (p[0].count === 0) {
            throw new Errors.CourseNotFoundError(prerequisiteId);
        }

        const e = await db.query('SELECT COUNT(*) AS count FROM prerequisites WHERE course_id = ? AND prerequisite_course_id = ?', [courseId, prerequisiteId]);
        if (e[0].count > 0) {
            throw new Errors.DuplicatePrerequisiteError(courseId, prerequisiteId);
        }

        if (courseId === prerequisiteId) {
            throw new Errors.ValidationError('A course cannot be a prerequisite of itself.');
        }

        await this.ensureNoCyc(prerequisiteId, courseId);
        try {
            await db.query('INSERT INTO prerequisites (course_id, prerequisite_course_id) VALUES (?, ?)', [courseId, prerequisiteId]);
        } catch (err) {
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new Errors.CourseNotFoundError('One of the courses specified does not exist.');
            }
            throw new Errors.DatabaseError('Failed to add prerequisite relationship.', err);
        }

        const r = await db.query('SELECT course_id, course_code, title FROM courses WHERE course_id = ?', [prerequisiteId]);

        return {
            courseId: r[0].course_id,
            courseCode: r[0].course_code,
            title: r[0].title,
        };
    }

    async rmvPrereq(courseId, prerequisiteId) {
        const p = await db.query('SELECT COUNT(*) AS count FROM prerequisites WHERE course_id = ? AND prerequisite_course_id = ?', [courseId, prerequisiteId]);
        if (Number(p[0].count) === 0) {
            throw new Errors.PrerequisiteRelationshipNotFoundError(courseId, prerequisiteId);
        }

        await db.query('DELETE FROM prerequisites WHERE course_id = ? AND prerequisite_course_id = ?', [courseId, prerequisiteId]);
    }

    async ensureNoCyc(newPrerequisiteId, targetCourseId) {
        const e = await db.query('SELECT prerequisite_course_id, course_id FROM prerequisites', []);

        const a = new Map();

        for (const edge of e) {
            if (!a.has(edge.course_id)) {
                a.set(edge.course_id, []);
            }
            a.get(edge.course_id).push(edge.prerequisite_course_id);
        }

        if (!a.has(targetCourseId)) {
            a.set(targetCourseId, []);
        }
        a.get(targetCourseId).push(newPrerequisiteId);

        const seen = new Set();
        const path = new Set();

        const dfs = (courseId) => {
            if (path.has(courseId)) {
                return true;
            }

            if (seen.has(courseId)) {
                return false;
            }

            path.add(courseId);

            const pre = a.get(courseId) || [];
            for (const id of pre) {
                if (dfs(id)) {
                    return true;
                }
            }

            path.delete(courseId);
            seen.add(courseId);
            return false;
        };

        if (dfs(targetCourseId)) {
            throw new Errors.PrerequisiteCycleError(targetCourseId, newPrerequisiteId);
        }
    }
}

export default PrerequisiteService;
