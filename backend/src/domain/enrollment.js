/*
Adi Avraham
CMSC495 Group Golf Capstone Project
enrollment.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the enrollment domain model and serialization helpers.
*/

class Enrollment {
    #enrollment_id;
    #student_id;
    #section_id;
    #status;

    constructor({ enrollment_id, student_id, section_id, status }) {
        this.#enrollment_id = enrollment_id;
        this.#student_id = student_id;
        this.#section_id = section_id;
        this.#status = status;
    }

    static fromPersistence(row) {
        if (!row) {
            throw new Error('Cannot construct Enrollment from empty persistence row.');
        }

        return new Enrollment({
            enrollment_id: row.enrollment_id,
            student_id: row.student_id,
            section_id: row.section_id,
            status: row.status,
        });
    }

    static fromObject(data) {
        if (!data) {
            throw new Error('Cannot construct Enrollment from empty object.');
        }

        return new Enrollment({
            enrollment_id: data.enrollment_id,
            student_id: data.student_id,
            section_id: data.section_id,
            status: data.status,
        });
    }

    getEnrollmentID() {
        return this.#enrollment_id;
    }

    getStudentID() {
        return this.#student_id;
    }

    getSectionID() {
        return this.#section_id;
    }

    getStatus() {
        return this.#status;
    }

    toObject() {
        return {
            enrollment_id: this.#enrollment_id,
            student_id: this.#student_id,
            section_id: this.#section_id,
            status: this.#status,
        };
    }
}

export default Enrollment;
