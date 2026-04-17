/*
Adi Avraham
CMSC495 Group Golf Capstone Project
semester.service.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Implements semester creation, listing, lookup, and guarded deletion rules.
*/

import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';

class SemesterService {
	constructor() {}

	async getSems() {
		return db.query('SELECT semester_id, term, year FROM semesters ORDER BY year DESC, semester_id DESC', []);
	}

	async getSem(semesterId) {
		const r = await db.query('SELECT semester_id, term, year FROM semesters WHERE semester_id = ?', [semesterId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Semester');
		}

		return r[0];
	}

	async addSem(term, year) {
		const e = await db.query('SELECT COUNT(*) AS count FROM semesters WHERE term = ? AND year = ?', [term, year]);
		if (Number(e[0].count) > 0) {
			throw new Errors.DuplicateEntryError('Semester already exists.');
		}

		const r = await db.query('INSERT INTO semesters (term, year) VALUES (?, ?)', [term, year]);
		return this.getSem(r.insertId);
	}

	async rmvSemester(semesterId) {
		const e = await db.query('SELECT COUNT(*) AS count FROM semesters WHERE semester_id = ?', [semesterId]);
		if (Number(e[0].count) === 0) {
			throw new Errors.NotFoundError('Semester');
		}

		const d = await db.query('SELECT COUNT(*) AS count FROM sections WHERE semester_id = ?', [semesterId]);
		if (Number(d[0].count) > 0) {
			throw new Errors.ValidationError('Cannot delete a semester that has scheduled sections.');
		}

		await db.query('DELETE FROM semesters WHERE semester_id = ?', [semesterId]);
	}
}

export default SemesterService;
