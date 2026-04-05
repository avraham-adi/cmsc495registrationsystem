import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';
import PrerequisiteService from './prerequisite.service.js';
import SectionService from './section.service.js';
import Enrollment from '../domain/enrollment.js';

class EnrollmentService {
    constructor() {
        this.section = new SectionService();
        this.pre = new PrerequisiteService();
    }

    async addEnroll(studentId, sectionId, actingUser) {
        this.verifyOwn(studentId, actingUser);

        const s = await db.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
        if (s.length === 0) {
            throw new Errors.NotFoundError('Student');
        }

        const sec = await this.section.getSection(sectionId);

        const pre = await this.pre.getPrereqs(sec.course_id);
        if (pre.data.length > 0) {
            const c = await db.query('SELECT s.course_id FROM enrollments e INNER JOIN sections s ON e.section_id = s.section_id WHERE e.student_id = ? AND e.status = ?', [studentId, 'completed']);
            const ids = new Set(c.map((row) => row.course_id));
            const miss = pre.data.filter((prereq) => !ids.has(prereq.courseId));

            if (miss.length > 0) {
                throw new Errors.PrerequisiteNotMetError(
                    sec.course_id,
                    miss.map((prereq) => prereq.courseCode)
                );
            }
        }

        const e = await db.query('SELECT * FROM enrollments WHERE student_id = ? AND section_id = ? LIMIT 1', [studentId, sectionId]);
        if (e.length > 0) {
            throw new Errors.ValidationError('Student already has an enrollment record for this section.');
        }

        const id = await this.enrollHelp(sectionId, studentId);

        const r = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [id]);
        const en = Enrollment.fromPersistence(r[0]);
        return en.toObject();
    }

    async updEnroll(enrollmentId, status, actingUser, accessCode = null) {
        const r = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);
        if (r.length === 0) {
            throw new Errors.NotFoundError('Enrollment');
        }

        const cur = r[0];
        this.verifyOwn(cur.student_id, actingUser);
        if (actingUser?.role === 'STUDENT' && !(status === 'dropped' || (status === 'enrolled' && accessCode))) {
            throw new Errors.AuthorizationError('Students may only drop their own enrollments or use a valid access code to enroll.');
        }

        if (status === cur.status) {
            const en = Enrollment.fromPersistence(cur);
            return en.toObject();
        }

        if (status === 'dropped') {
            if (!['enrolled', 'waitlisted'].includes(cur.status)) {
                throw new Errors.ValidationError('Only enrolled or waitlisted records can be dropped.');
            }

            await db.query('UPDATE enrollments SET status = ? WHERE enrollment_id = ?', [status, enrollmentId]);

            if (cur.status === 'enrolled') {
                await this.enrollHelp(cur.section_id);
            }
        } else if (status === 'completed') {
            if (cur.status !== 'enrolled') {
                throw new Errors.ValidationError('Only enrolled records can be marked completed.');
            }

            await db.query('UPDATE enrollments SET status = ? WHERE enrollment_id = ?', [status, enrollmentId]);
        } else if (status === 'enrolled') {
            if (cur.status !== 'waitlisted') {
                throw new Errors.ValidationError('Only waitlisted records can be moved to enrolled.');
            }

            if (!accessCode) {
                throw new Errors.ValidationError('A valid access code is required to move from waitlisted to enrolled.');
            }

            await this.enrollWithCode(cur.section_id, null, enrollmentId, accessCode);
        } else {
            throw new Errors.ValidationError('Manual transition to waitlisted is not allowed.');
        }

        const x = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);
        const en = Enrollment.fromPersistence(x[0]);
        return en.toObject();
    }

    async getEnroll(enrollmentId, actingUser) {
        const r = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);

        if (!r.length) {
            throw new Errors.NotFoundError('Enrollment');
        }

        const en = Enrollment.fromPersistence(r[0]);

        this.verifyOwn(en.getStudentID(), actingUser);

        return en.toObject();
    }

    async rmvEnroll(enrollmentId, actingUser) {
        const r = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);
        if (r.length === 0) {
            throw new Errors.NotFoundError('Enrollment');
        }

        const en = Enrollment.fromPersistence(r[0]);

        this.verifyOwn(en.getStudentID(), actingUser);
        await db.query('DELETE FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);

        await this.enrollHelp(en.getSectionID());

        return {
            message: 'Enrollment removed successfully.',
        };
    }

    verifyOwn(studentId, actingUser) {
        if (actingUser?.role === 'STUDENT' && Number(actingUser.role_id) !== Number(studentId)) {
            throw new Errors.AuthorizationError('Students may only manage their own enrollments.');
        }
    }

    async enrollWithCode(sectionId, studentId = null, enrollmentId = null, accessCode) {
        const con = await db.getConnection();
        try {
            await db.beginTransaction(con);

            const s = await db.queryWithConnection(con, 'SELECT access_codes, capacity FROM sections WHERE section_id = ? FOR UPDATE', [sectionId]);
            if (s.length === 0) {
                throw new Errors.NotFoundError('Section');
            }

            const codes = { ...(s[0].access_codes ?? {}) };
            const key = Object.keys(codes).find((k) => /^code\d+$/.test(k) && codes[k] === accessCode);
            if (!key || codes[key + '_used'] !== false) {
                throw new Errors.ValidationError('Invalid or already used access code.');
            }

            codes[key + '_used'] = true;
            await db.queryWithConnection(con, 'UPDATE sections SET access_codes = ? WHERE section_id = ?', [JSON.stringify(codes), sectionId]);

            if (enrollmentId) {
                const e = await db.queryWithConnection(
                    con,
                    'SELECT enrollment_id, status FROM enrollments WHERE section_id = ? ORDER BY enrollment_id ASC FOR UPDATE',
                    [sectionId]
                );
                const cnt = e.filter((row) => row.status === 'enrolled').length;
                const first = e.find((row) => row.status === 'waitlisted');

                if (cnt >= Number(s[0].capacity)) {
                    throw new Errors.SectionFullError(sectionId);
                }

                if (!first || Number(first.enrollment_id) !== Number(enrollmentId)) {
                    throw new Errors.ValidationError('Only the next waitlisted student may be promoted.');
                }

                await db.queryWithConnection(con, 'UPDATE enrollments SET status = ? WHERE enrollment_id = ?', ['enrolled', enrollmentId]);
                await db.commit(con);
                return enrollmentId;
            }

            try {
                const r = await db.queryWithConnection(con, 'INSERT INTO enrollments (student_id, section_id, status) VALUES (?, ?, ?)', [studentId, sectionId, 'enrolled']);
                await db.commit(con);
                return r.insertId;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Errors.ValidationError('Student already has an enrollment record for this section.');
                }
                throw err;
            }
        } catch (err) {
            await db.rollback(con);
            throw err;
        } finally {
            db.releaseConnection(con);
        }
    }

    async enrollHelp(sectionId, studentId = null) {
        const con = await db.getConnection();
        try {
            await db.beginTransaction(con);

            const c = await db.queryWithConnection(con, 'SELECT capacity FROM sections WHERE section_id = ? FOR UPDATE', [sectionId]);
            if (c.length === 0) {
                throw new Errors.NotFoundError('Section');
            }

            const cap = Number(c[0].capacity);
            const e = await db.queryWithConnection(con, 'SELECT enrollment_id, status FROM enrollments WHERE section_id = ? ORDER BY enrollment_id ASC FOR UPDATE', [sectionId]);

            const cnt = e.filter((row) => row.status === 'enrolled').length;
            const wait = e.filter((row) => row.status === 'waitlisted');
            let wc = wait.length;

            let eCnt = cnt;

            if (wait.length > 0 && eCnt < cap) {
                for (const row of wait) {
                    if (eCnt >= cap) {
                        break;
                    }

                    await db.queryWithConnection(con, 'UPDATE enrollments SET status = ? WHERE enrollment_id = ?', ['enrolled', row.enrollment_id]);
                    eCnt += 1;
                    wc -= 1;
                }
            }

            if (!studentId) {
                await db.commit(con);
                return;
            }

            if (eCnt < cap) {
                try {
                    const r = await db.queryWithConnection(con, 'INSERT INTO enrollments (student_id, section_id, status) VALUES (?, ?, ?)', [studentId, sectionId, 'enrolled']);
                    await db.commit(con);
                    return r.insertId;
                } catch (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        throw new Errors.ValidationError('Student already has an enrollment record for this section.');
                    }
                    throw err;
                }
            }

            if (wc < 3) {
                try {
                    const r = await db.queryWithConnection(con, 'INSERT INTO enrollments (student_id, section_id, status) VALUES (?, ?, ?)', [studentId, sectionId, 'waitlisted']);
                    await db.commit(con);
                    return r.insertId;
                } catch (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        throw new Errors.ValidationError('Student already has an enrollment record for this section.');
                    }
                    throw err;
                }
            }

            throw new Errors.SectionFullError(sectionId);
        } catch (err) {
            await db.rollback(con);
            throw err;
        } finally {
            db.releaseConnection(con);
        }
    }
}

export default EnrollmentService;
