class Section {
	#section_id;
	#course_id;
	#semester_id;
	#professor_id;
	#capacity;
	#days;
	#start_time;
	#end_time;
	#access_codes;

	constructor({ section_id, course_id, semester_id, professor_id, capacity, days, start_time, end_time, access_codes }) {
		this.#section_id = section_id;
		this.#course_id = course_id;
		this.#semester_id = semester_id;
		this.#professor_id = professor_id;
		this.#capacity = capacity;
		this.#days = days || 'async';
		this.#start_time = start_time || '';
		this.#end_time = end_time || '';
		this.#access_codes = access_codes;
	}

	static fromPersistence(row) {
		if (!row) {
			throw new Error('Cannot construct Section from empty persistence row.');
		}

		return new Section({
			section_id: row.section_id,
			course_id: row.course_id,
			semester_id: row.semester_id,
			professor_id: row.professor_id,
			capacity: row.capacity,
			days: row.days,
			start_time: row.start_time,
			end_time: row.end_time,
			access_codes: row.access_codes,
		});
	}

	static fromObject(data) {
		if (!data) {
			throw new Error('Cannot construct Section from empty object.');
		}

		return new Section({
			section_id: data.section_id,
			course_id: data.course_id,
			semester_id: data.semester_id,
			professor_id: data.professor_id,
			capacity: data.capacity,
			days: data.days,
			start_time: data.start_time,
			end_time: data.end_time,
			access_codes: data.access_codes,
		});
	}

	getSectionID() {
		return this.#section_id;
	}

	getCourseID() {
		return this.#course_id;
	}

	getSemesterID() {
		return this.#semester_id;
	}

	getProfessorID() {
		return this.#professor_id;
	}

	getCapacity() {
		return this.#capacity;
	}

	getDays() {
		return this.#days;
	}

	getStartTime() {
		return this.#start_time;
	}

	getEndTime() {
		return this.#end_time;
	}

	getAccessCodes() {
		return this.#access_codes;
	}

	hasSameIdentityAs(otherSection) {
		if (!(otherSection instanceof Section)) {
			return false;
		}

		return this.#section_id === otherSection.getSectionID();
	}

	toObject() {
		return {
			section_id: this.#section_id,
			course_id: this.#course_id,
			semester_id: this.#semester_id,
			professor_id: this.#professor_id,
			capacity: this.#capacity,
			days: this.#days,
			start_time: this.#start_time,
			end_time: this.#end_time,
			access_codes: this.#access_codes,
		};
	}

	toSafeObject() {
		return {
			section_id: this.#section_id,
			course_id: this.#course_id,
			semester_id: this.#semester_id,
			professor_id: this.#professor_id,
			capacity: this.#capacity,
			days: this.#days,
			start_time: this.#start_time,
			end_time: this.#end_time,
		};
	}

	toReadableObject(cRow, subject, pRow, sRow) {
		return {
			section_id: this.#section_id,
			capacity: this.#capacity,
			days: this.#days,
			start_time: this.#start_time,
			end_time: this.#end_time,
			course: {
				course_id: this.#course_id,
				course_code: cRow.course_code,
				title: cRow.title,
				description: cRow.description,
				subject: subject,
				credits: cRow.credits,
			},
			professor: {
				professor_id: this.#professor_id,
				professor_name: pRow.name,
			},
			semester: {
				semester_id: this.#semester_id,
				term: sRow.term,
				year: sRow.year,
			},
		};
	}
}

export default Section;
