/*
Adi Avraham
CMSC495 Group Golf Capstone Project
course.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the course domain model and normalization helpers.
*/

class Course {
	#course_id;
	#course_code;
	#title;
	#description;
	#credits;

	constructor({ course_id, course_code, title, description, credits }) {
		this.#course_id = course_id;
		this.#course_code = course_code;
		this.#title = title;
		this.#description = description;
		this.#credits = credits;
	}

	static fromPersistence(row) {
		if (!row) {
			throw new Error('Cannot construct Course from empty persistence row.');
		}

		return new Course({
			course_id: row.course_id,
			course_code: row.course_code,
			title: row.title,
			description: row.description,
			credits: row.credits,
		});
	}

	static fromObject(data) {
		if (!data) {
			throw new Error('Cannot construct Course from empty object.');
		}

		return new Course({
			course_id: data.course_id,
			course_code: data.course_code,
			title: data.title,
			description: data.description,
			credits: data.credits,
		});
	}

	getCourseID() {
		return this.#course_id;
	}

	getCourseCode() {
		return this.#course_code;
	}

	getTitle() {
		return this.#title;
	}

	getDescription() {
		return this.#description;
	}

	getCredits() {
		return this.#credits;
	}

	hasSameIdentityAs(otherCourse) {
		if (!(otherCourse instanceof Course)) {
			return false;
		}

		return this.#course_id === otherCourse.getCourseID();
	}

	toObject() {
		return {
			course_id: this.#course_id,
			course_code: this.#course_code,
			title: this.#title,
			description: this.#description,
			credits: this.#credits,
		};
	}
}

export default Course;
