import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';
import Section from '../domain/section.js';
import crypto from 'crypto';

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
    async getSections(page, limit, search, courseId = null, semesterId = null, professorId = null) {
        const np = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const l = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 10;
        const o = (np - 1) * l;

        // Where and Params arrays
        let w = [];
        let p = [];

        if (search) {
            w.push('(section_id LIKE ? OR professor_id LIKE ?)');
            p.push('%' + search + '%', '%' + search + '%');
        }

        if (courseId) {
            w.push('course_id = ?');
            p.push(courseId);
        }

        if (semesterId) {
            w.push('semester_id = ?');
            p.push(semesterId);
        }

        if (professorId) {
            w.push('professor_id = ?');
            p.push(professorId);
        }

        const q = w.length > 0 ? ' WHERE ' + w.join(' AND ') : '';
        const c = await db.query('SELECT COUNT(*) AS count FROM sections' + q, p);
        const r = await db.query('SELECT * FROM sections' + q + ' ORDER BY section_id DESC LIMIT ? OFFSET ?', [...p, l, o]);

        const data = r.map((row) => Section.fromPersistence(row));

        return {
            data: data.map((s) => s.toSafeObject()),
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

        const x = await db.query('INSERT INTO sections (course_id, semester_id, professor_id, capacity, days, start_time, end_time, access_codes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [courseId, semesterId, professorId, capacity, days ?? 'async', start_time || null, end_time || null, json]);
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

        await db.query('UPDATE sections SET course_id = ?, semester_id = ?, professor_id = ?, capacity = ?, days = ?, start_time = ?, end_time = ? WHERE section_id = ?', [c, semesterId, professorId, capacity, days ?? 'async', startTime ?? null, endTime ?? null, sectionId]);

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
