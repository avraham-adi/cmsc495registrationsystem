import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';

export default class PrerequisiteService {
    async getCourseByCode(courseCode) {
        const results = await db.queryStd('SELECT course_id, course_code, title FROM courses WHERE course_code = ?', [courseCode]);

        if (!results || results.length === 0) {
            throw new Errors.CourseNotFoundError('Invalid Course Code.');
        }

        return results[0];
    }

    async getPrerequisitesForCourse(courseCode) {
        const course = await this.getCourseByCode(courseCode);

        const results = await db.queryStd('SELECT c.course_id, c.course_code, c.title FROM prerequisites p INNER JOIN courses c ON p.prerequisite_course_id = c.course_id WHERE p.course_id = ? ORDER BY c.course_code ASC', [course.course_id]);

        return {
            course,
            prerequisites: results,
        };
    }

    async addPrerequisite(courseCode, prerequisiteCourseCode) {
        const course = await this.getCourseByCode(courseCode);
        const prerequisite = await this.getCourseByCode(prerequisiteCourseCode);

        if (course.course_id === prerequisite.course_id) {
            throw new Errors.InvalidSelectionError('A course cannot be a prerequisite of itself.');
        }

        const existing = await db.queryStd('SELECT 1 FROM prerequisites WHERE prerequisite_course_id = ? AND course_id = ? LIMIT 1 ', [prerequisite.course_id, course.course_id]);

        if (existing.length > 0) {
            throw new Errors.DuplicateEntryError('Prerequisite already exists.');
        }

        await this.ensureNoCycle(prerequisite.course_id, course.course_id);

        await db.queryAdm('INSERT INTO prerequisites (prerequisite_course_id, course_id) VALUES (?, ?)', [prerequisite.course_id, course.course_id]);

        return {
            course,
            prerequisite,
        };
    }

    async removePrerequisite(courseCode, prerequisiteCourseCode) {
        const course = await this.getCourseByCode(courseCode);
        const prerequisite = await this.getCourseByCode(prerequisiteCourseCode);

        const existing = await db.queryStd('SELECT 1 FROM prerequisites WHERE prerequisite_course_id = ? AND course_id = ? LIMIT 1', [prerequisite.course_id, course.course_id]);

        if (existing.length === 0) {
            throw new Errors.InvalidSelectionError('Prerequisite not found.');
        }

        await db.queryAdm('DELETE FROM prerequisites WHERE prerequisite_course_id = ? AND course_id = ?', [prerequisite.course_id, course.course_id]);

        return {
            course,
            prerequisite,
        };
    }

    async validatePrerequisiteChain(courseCode) {
        const course = await this.getCourseByCode(courseCode);

        const allEdges = await db.queryStd('SELECT prerequisite_course_id, course_id FROM prerequisites', []);

        const adjacency = new Map();

        for (const edge of allEdges) {
            if (!adjacency.has(edge.course_id)) {
                adjacency.set(edge.course_id, []);
            }
            adjacency.get(edge.course_id).push(edge.prerequisite_course_id);
        }

        const visited = new Set();
        const visiting = new Set();
        const chain = [];
        let cycleDetected = false;

        const dfs = (currentId) => {
            if (visiting.has(currentId)) {
                cycleDetected = true;
                return;
            }

            if (visited.has(currentId) || cycleDetected) {
                return;
            }

            visiting.add(currentId);

            const prereqs = adjacency.get(currentId) || [];
            for (const prereqId of prereqs) {
                dfs(prereqId);
            }

            visiting.delete(currentId);
            visited.add(currentId);
            chain.push(currentId);
        };

        dfs(course.course_id);

        if (cycleDetected) {
            return {
                valid: false,
                message: 'Cycle detected in prerequisite chain for ' + course.course_code,
            };
        }

        const chainDetails = chain.length <= 1 ? [] : await db.queryStd('SELECT course_id, course_code, title FROM courses WHERE course_id IN (?)', [chain.filter((id) => id !== course.course_id)]);

        chainDetails.sort((a, b) => a.course_code.localeCompare(b.course_code));

        return {
            valid: true,
            course,
            prerequisiteChain: chainDetails,
            message: 'Prerequisite chain for '  + course.course_code +  ' is valid.',
        };
    }

    async ensureNoCycle(newPrerequisiteId, targetCourseId) {
        const allEdges = await db.queryStd('SELECT prerequisite_course_id, course_id FROM prerequisites', []);

        const adjacency = new Map();

        for (const edge of allEdges) {
            if (!adjacency.has(edge.course_id)) {
                adjacency.set(edge.course_id, []);
            }
            adjacency.get(edge.course_id).push(edge.prerequisite_course_id);
        }

        if (!adjacency.has(targetCourseId)) {
            adjacency.set(targetCourseId, []);
        }
        adjacency.get(targetCourseId).push(newPrerequisiteId);

        const visited = new Set();
        const visiting = new Set();

        const dfs = (courseId) => {
            if (visiting.has(courseId)) {
                return true;
            }

            if (visited.has(courseId)) {
                return false;
            }

            visiting.add(courseId);

            const prereqs = adjacency.get(courseId) || [];
            for (const prereqId of prereqs) {
                if (dfs(prereqId)) {
                    return true;
                }
            }

            visiting.delete(courseId);
            visited.add(courseId);
            return false;
        };

        if (dfs(targetCourseId)) {
            throw new Errors.ValidationError('This prerequisite relationship would create a cycle.');
        }
    }
}
