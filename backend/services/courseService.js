/**
 * CourseService
 *
 * Responsibilities:
 * Retrieve course catalog data
 * Retrieve sections for a given course
 * Support simple filtering by semester
 */

import * as db from '../db/db.js';
import Course from '../models/course.js';

class CourseService {
    #course_map;
    numCourses;

    // Constructor initializes the Map
    constructor() {
        this.#course_map = new Map();
    }

    // Initializes all courses in the database into memory, used on first startup of the application to cache frequently accessed items.
    async init() {
        const result = await db.queryStd('SELECT * FROM courses', []);

        for (const row of result) {
            const course = new Course(row.course_id);
            await course.init();
            this.#course_map.set(course.course_code, course);
        }
    }

    // ****** Courses ******

    // Gets course information from memory
    getCourseInfo(course_code) {
        const course = this.#course_map.get(course_code);
        return [course.course_id, course_code, course.title, course.description, course.credits];
    }

    getCourseID(course_code) {
        return this.getCourseInfo(course_code)[0];
    }

    getCourseTitle(course_code) {
        return this.getCourseInfo(course_code)[2];
    }

    getCourseDescription(course_code) {
        return this.getCourseInfo(course_code)[3];
    }

    getCourseCredits(course_code) {
        return this.getCourseInfo(course_code)[4];
    }

    // Add Courses

    async addNewCourse(courseData) {
        const course_code = courseData.course_code;
        const title = courseData.title;
        const description = courseData.description;
        const credits = courseData.credits;

        const result = await db.queryAdm(
            'INSERT INTO courses (course_code, title, description, credits) VALUES (?, ?, ?, ?)',
            [course_code, title, description, credits]
        );
        this.refresh();

        return result;
    }

    async removeCourse(course_code) {
        const result = await db.queryAdm('DELETE FROM courses WHERE course_code = ?', [
            course_code,
        ]);
        this.refresh();

        return result;
    }

    async updateCourse(course_code, title, description, credits) {
        const result = await db.queryAdm(
            'UPDATE courses SET title = ?, description = ?, credits = ? WHERE course_code = ?',
            [title, description, credits, course_code]
        );
        this.refresh();
        return result;
    }

    // ****** Sections ******

    // Create new section
    async createSection(
        course_id,
        semester_id,
        professor_id,
        capacity,
        days,
        start_time,
        end_time
    ) {
        try {
            console.log(course_id, semester_id, professor_id, capacity, days, start_time, end_time);
        } catch (err) {
            console.error(err);
        }
    }

    async refresh() {
        await this.init();
    }
}

export default CourseService;
