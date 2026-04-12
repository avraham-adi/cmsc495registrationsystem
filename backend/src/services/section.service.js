/*
Adi Avraham
CMSC495 Group Golf Capstone Project
section.service.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Implements section reads, mutation rules, access-code workflows, and seat availability calculations.
*/

import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';
import Section from '../domain/section.js';
import crypto from 'crypto';
import { getSubjectNameFromCourseCode } from '../utils/courseSubjects.js';

class SectionService {
	constructor() {}

	async getCtx(sectionId, actingUser) {
		const r = await db.query('SELECT section_id, professor_id, access_codes FROM sections WHERE section_id = ?', [sectionId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		const sec = r[0];

		if (actingUser?.role === 'ADMIN') {
			return sec;
		}

		if (actingUser?.role === 'PROFESSOR' && actingUser.role_id === sec.professor_id) {
			return sec;
		}

		throw new Errors.AuthorizationError('Professors may only manage access codes for their own sections.');
	}

	getHighIdx(codes) {
		return Object.keys(codes).reduce((m, k) => {
			const match = k.match(/^code(\d+)$/);
			return match ? Math.max(m, Number(match[1])) : m;
		}, 0);
	}

	// Check Semester Exists
	async semExists(semesterId) {
		const r = await db.query('SELECT semester_id FROM semesters WHERE semester_id = ?', [semesterId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Semester not found.');
		}
	}

	// Check Professor Exists
	async profExists(professorId) {
		const r = await db.query('SELECT professor_id FROM professors WHERE professor_id = ?', [professorId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Professor not found.');
		}
	}

	// Get Existing Section Info
	async getSection(sectionId) {
		const r = await db.query('SELECT * FROM sections WHERE section_id = ?', [sectionId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		const s = Section.fromPersistence(r[0]);
		return s.toSafeObject();
	}

	async getReadableSection(sectionId) {
		const rows = await db.query(
			`SELECT
				s.*,
				c.course_code,
				c.title,
				c.description,
				c.credits,
				u.name AS professor_name,
				sem.term,
				sem.year,
				COALESCE(ec.enrolled_count, 0) AS enrolled_count,
				COALESCE(wc.waitlisted_count, 0) AS waitlisted_count
			FROM sections s
			INNER JOIN courses c ON c.course_id = s.course_id
			INNER JOIN professors prof ON prof.professor_id = s.professor_id
			INNER JOIN users u ON u.user_id = prof.user_id
			INNER JOIN semesters sem ON sem.semester_id = s.semester_id
			LEFT JOIN (
				SELECT section_id, COUNT(*) AS enrolled_count
				FROM enrollments
				WHERE status = 'enrolled'
				GROUP BY section_id
			) ec ON ec.section_id = s.section_id
			LEFT JOIN (
				SELECT section_id, COUNT(*) AS waitlisted_count
				FROM enrollments
				WHERE status = 'waitlisted'
				GROUP BY section_id
			) wc ON wc.section_id = s.section_id
			WHERE s.section_id = ?`,
			[sectionId]
		);

		if (rows.length === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		const row = rows[0];
		const section = Section.fromPersistence(row);
		const subjectName = getSubjectNameFromCourseCode(row.course_code);

		return section.toReadableObject(
			{
				course_code: row.course_code,
				title: row.title,
				description: row.description,
				credits: row.credits,
			},
			subjectName,
			{ name: row.professor_name },
			{ term: row.term, year: row.year },
			{
				enrolled_count: Number(row.enrolled_count ?? 0),
				waitlisted_count: Number(row.waitlisted_count ?? 0),
				seats_available: Math.max(Number(row.capacity) - Number(row.enrolled_count ?? 0), 0),
			}
		);
	}

	// Check if Access Code exists and has already been used, and mark it as used if valid
	async useCode(sectionId, code) {
		const r = await db.query('SELECT access_codes FROM sections WHERE section_id = ?', [sectionId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		const codes = { ...r[0].access_codes };
		const key = Object.keys(codes).find((k) => /^code\d+$/.test(k) && codes[k] === code);

		if (!key || codes[key + '_used'] !== false) {
			throw new Errors.ValidationError('Invalid or already used access code.');
		}

		codes[key + '_used'] = true;
		await db.query('UPDATE sections SET access_codes = ? WHERE section_id = ?', [JSON.stringify(codes), sectionId]);
		return true;
	}

	// Get All Access Codes for a Section
	async getAcCodes(sectionId, actingUser) {
		const s = await this.getCtx(sectionId, actingUser);
		return s.access_codes;
	}

	// Generate More Access Codes for a Section
	async genAcCodes(sectionId, numCodes = 3, actingUser) {
		const s = await this.getCtx(sectionId, actingUser);
		const codes = s.access_codes;
		const add = {};
		const hi = this.getHighIdx(codes);

		for (let i = 1; i <= numCodes; i++) {
			const a = crypto.randomBytes(2).toString('hex').toUpperCase();
			const b = crypto.randomBytes(2).toString('hex').toUpperCase();
			const code = a + '-' + b;
			const key = 'code' + (hi + i);
			const used = key + '_used';
			add[key] = code;
			add[used] = false;
		}

		const next = { ...codes, ...add };
		const json = JSON.stringify(next);

		await db.query('UPDATE sections SET access_codes = ? WHERE section_id = ?', [json, sectionId]);

		return add;
	}

	// Revoke Selected Access Codes for a Section
	async revAcCodes(sectionId, codesToRevoke, actingUser) {
		const s = await this.getCtx(sectionId, actingUser);
		const codes = s.access_codes;
		const next = { ...codes };

		codesToRevoke.forEach((code) => {
			const key = Object.keys(next).find((k) => next[k] === code);
			if (key) {
				delete next[key];
				const used = key + '_used';
				delete next[used];
			}
		});

		const json = JSON.stringify(next);
		await db.query('UPDATE sections SET access_codes = ? WHERE section_id = ?', [json, sectionId]);
	}

	// Get All Sections with Pagination, Search, and Filtering
	async getSections(page, limit, search, courseId = null, semesterId = null, professorId = null, subject = null, days = null) {
		const np = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
		const l = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 10;
		const o = (np - 1) * l;

		// Where and Params arrays
		let w = [];
		let p = [];

		if (courseId) {
			w.push('s.course_id = ?');
			p.push(courseId);
		}

		if (semesterId) {
			w.push('s.semester_id = ?');
			p.push(semesterId);
		}

		if (professorId) {
			w.push('s.professor_id = ?');
			p.push(professorId);
		}

		if (subject) {
			w.push('LEFT(c.course_code, 4) = ?');
			p.push(String(subject).trim().toUpperCase());
		}

		if (days) {
			w.push('s.days = ?');
			p.push(String(days).trim().toUpperCase());
		}

		if (search) {
			w.push('(c.course_code LIKE ? OR c.title LIKE ? OR c.description LIKE ? OR u.name LIKE ?)');
			const term = `%${String(search).trim()}%`;
			p.push(term, term, term, term);
		}

		const fromClause = `
			FROM sections s
			INNER JOIN courses c ON c.course_id = s.course_id
			INNER JOIN professors prof ON prof.professor_id = s.professor_id
			INNER JOIN users u ON u.user_id = prof.user_id
			INNER JOIN semesters sem ON sem.semester_id = s.semester_id
			LEFT JOIN (
				SELECT section_id, COUNT(*) AS enrolled_count
				FROM enrollments
				WHERE status = 'enrolled'
				GROUP BY section_id
			) ec ON ec.section_id = s.section_id
			LEFT JOIN (
				SELECT section_id, COUNT(*) AS waitlisted_count
				FROM enrollments
				WHERE status = 'waitlisted'
				GROUP BY section_id
			) wc ON wc.section_id = s.section_id
		`;

		const q = w.length > 0 ? ' WHERE ' + w.join(' AND ') : '';
		const c = await db.query('SELECT COUNT(*) AS count ' + fromClause + q, p);
		const r = await db.query(
			`SELECT
				s.*,
				c.course_code,
				c.title,
				c.description,
				c.credits,
				u.name AS professor_name,
				sem.term,
				sem.year,
				COALESCE(ec.enrolled_count, 0) AS enrolled_count,
				COALESCE(wc.waitlisted_count, 0) AS waitlisted_count
			` +
				fromClause +
				q +
				' ORDER BY c.course_code ASC, s.section_id ASC LIMIT ? OFFSET ?',
			[...p, l, o]
		);

		const readable = r.map((row) => {
			const s = Section.fromPersistence(row);
			const subjectName = getSubjectNameFromCourseCode(row.course_code);
			return s.toReadableObject(
				{
					course_code: row.course_code,
					title: row.title,
					description: row.description,
					credits: row.credits,
				},
				subjectName,
				{ name: row.professor_name },
				{ term: row.term, year: row.year },
				{
					enrolled_count: Number(row.enrolled_count ?? 0),
					waitlisted_count: Number(row.waitlisted_count ?? 0),
					seats_available: Math.max(Number(row.capacity) - Number(row.enrolled_count ?? 0), 0),
				}
			);
		});

		return {
			data: readable,
			meta: {
				page: np,
				limit: l,
				total: c[0].count,
				totalPages: Math.ceil(c[0].count / l),
			},
		};
	}

	async addSection(courseId, semesterId, professorId, capacity, days, start_time, end_time, numCodes = 3) {
		const c = await db.query('SELECT course_id FROM courses WHERE course_id = ?', [courseId]);

		if (c.length === 0) {
			throw new Errors.NotFoundError('Course not found.');
		}

		await this.semExists(semesterId);
		await this.profExists(professorId);

		const codes = {};

		for (let i = 1; i <= numCodes; i++) {
			const a = crypto.randomBytes(2).toString('hex').toUpperCase();
			const b = crypto.randomBytes(2).toString('hex').toUpperCase();
			const code = a + '-' + b;
			const key = 'code' + i;
			const used = key + '_used';
			codes[key] = code;
			codes[used] = false;
		}

		const json = JSON.stringify(codes);

		const x = await db.query('INSERT INTO sections (course_id, semester_id, professor_id, capacity, days, start_time, end_time, access_codes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
			courseId,
			semesterId,
			professorId,
			capacity,
			days ?? 'async',
			start_time || null,
			end_time || null,
			json,
		]);
		const r = await db.query('SELECT * FROM sections WHERE section_id = ?', [x.insertId]);

		if (r.length === 0) {
			throw new Errors.InternalServerError('Failed to retrieve newly created section.');
		}

		const s = Section.fromPersistence(r[0]);
		return s.toSafeObject();
	}

	async updSection(sectionId, updatedData) {
		const { semesterId, professorId, capacity, days, startTime, endTime } = updatedData;
		const r = await db.query('SELECT * FROM sections WHERE section_id = ?', [sectionId]);

		if (r.length === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		await this.semExists(semesterId);
		await this.profExists(professorId);

		const e = await db.query('SELECT COUNT(*) AS count FROM enrollments WHERE section_id = ? AND status = ?', [sectionId, 'enrolled']);
		if (Number(e[0].count) > Number(capacity)) {
			throw new Errors.ValidationError('Section capacity cannot be set below current enrolled count.');
		}

		const sec = r[0];
		const c = sec.course_id;

		await db.query('UPDATE sections SET course_id = ?, semester_id = ?, professor_id = ?, capacity = ?, days = ?, start_time = ?, end_time = ? WHERE section_id = ?', [
			c,
			semesterId,
			professorId,
			capacity,
			days ?? 'async',
			startTime ?? null,
			endTime ?? null,
			sectionId,
		]);

		const x = await db.query('SELECT * FROM sections WHERE section_id = ?', [sectionId]);

		if (x.length === 0) {
			throw new Errors.InternalServerError('Failed to retrieve existing section data.');
		}

		const s = Section.fromPersistence(x[0]);

		return s.toSafeObject();
	}

	async rmvSection(sectionId) {
		const e = await db.query('SELECT COUNT(*) as count FROM sections WHERE section_id = ?', [sectionId]);

		if (e[0].count === 0) {
			throw new Errors.NotFoundError('Section not found.');
		}

		const d = await db.query('SELECT COUNT(*) AS count FROM enrollments WHERE section_id = ?', [sectionId]);

		if (d[0].count > 0) {
			throw new Errors.ValidationError('Cannot delete a section that has enrollments. Remove or archive its enrollments first.');
		}

		await db.query('DELETE FROM sections WHERE section_id = ?', [sectionId]);
	}
}

export default SectionService;
