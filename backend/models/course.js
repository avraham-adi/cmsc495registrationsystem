/**
 * Course object, holds a course in memory for more eefficient calls.
 */

import * as db from '../db/db.js';

class Course {
    constructor(course_id) {
        this.course_id = course_id;
    }

    async init() {
        const results = await db.queryStd(
            'SELECT course_code, title, description, credits FROM courses WHERE course_id = ?',
            [this.course_id],
            (result) => {
                if (result.length == 0) {
                    console.log('No course found for course_id', this.course_id);
                    return;
                }
            }
        );
        const row = results[0];
        this.course_code = row.course_code;
        this.title = row.title;
        this.description = row.description;
        this.credits = row.credits;
    }

    async refresh() {
        await this.init();
    }
}

export default Course;
