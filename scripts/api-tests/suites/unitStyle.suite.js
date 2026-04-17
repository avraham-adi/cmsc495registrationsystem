import * as db from '../../../backend/src/db/connection.js';
import AdminService from '../../../backend/src/services/admin.service.js';
import AuthService from '../../../backend/src/services/auth.service.js';
import EnrollmentService from '../../../backend/src/services/enrollment.service.js';
import SessionService from '../../../backend/src/services/session.service.js';
import SectionService from '../../../backend/src/services/section.service.js';
import Enrollment from '../../../backend/src/domain/enrollment.js';
import Section from '../../../backend/src/domain/section.js';
import User from '../../../backend/src/domain/user.js';
import { assert } from '../shared.js';

export async function runUnitStyleSuite(env) {
	const { harness, ctx } = env;

	await harness.run('User domain helpers preserve role and session metadata', 'UNIT User.fromPersistence', { type: 'unit' }, { pass: true }, async () => {
		const user = User.fromPersistence({
			id: 77,
			name: 'Unit User',
			email: 'unit.user@example.edu',
			password_hash: 'hash',
			first_login: 0,
			sess_ver: 9,
			role: 'ADMIN',
			role_id: 1001,
			role_details: '10',
		});

		assert(user.getUserID() === 77, 'User id getter mismatch.');
		assert(user.getSessVer() === 9, 'Session version getter mismatch.');
		assert(user.isAdmin() === true, 'Admin role helper mismatch.');
		assert(user.getFirstLogin() === false, 'First-login helper mismatch.');
		assert(user.withoutPasswordHash().toSafeObject().email === 'unit.user@example.edu', 'Safe projection mismatch.');

		return { pass: true };
	});

	await harness.run('Section domain normalizes async schedule values', 'UNIT Section.fromPersistence', { type: 'unit' }, { pass: true }, async () => {
		const section = Section.fromPersistence({
			section_id: 999,
			course_id: 2,
			semester_id: 3,
			professor_id: 4,
			capacity: 20,
			days: null,
			start_time: null,
			end_time: null,
			access_codes: { code1: 'ABCD-EF12', code1_used: false },
		});

		const safe = section.toSafeObject();
		assert(safe.days === 'async', 'Async days normalization mismatch.');
		assert(safe.start_time === '', 'Async start_time normalization mismatch.');
		assert(safe.end_time === '', 'Async end_time normalization mismatch.');

		return { pass: true, safe };
	});

	await harness.run('Session payload generation only stores minimal auth state', 'UNIT SessionService.createPld', { type: 'unit' }, { pass: true }, async () => {
		const sessionService = new SessionService();
		const user = User.fromPersistence({
			id: 55,
			name: 'Session User',
			email: 'session.user@example.edu',
			password_hash: 'hash',
			first_login: 0,
			sess_ver: 4,
		});

		const payload = sessionService.createPld(user);
		assert(payload.userId === 55, 'Session payload userId mismatch.');
		assert(payload.sessVer === 4, 'Session payload version mismatch.');
		assert(Object.keys(payload).sort().join(',') === 'sessVer,sess_ver,userId', 'Session payload shape changed unexpectedly.');

		return { pass: true, payload };
	});

	await harness.run('Last-admin protections remain enforced at the service layer', 'UNIT AdminService last-admin guard', { type: 'service' }, { pass: true }, async () => {
		await db.query('DELETE FROM admins WHERE user_id <> ?', [ctx.admin.user.id]);

		const service = new AdminService();
		let removeBlocked = false;
		let roleBlocked = false;

		try {
			await service.rmvUser(ctx.admin.user.id, { id: -1 });
		} catch (error) {
			removeBlocked = error.status === 403;
		}

		try {
			await service.setRole(ctx.admin.user.id, 'Computer Science', 'STUDENT', null, { id: -1 });
		} catch (error) {
			roleBlocked = error.status === 403;
		}

		assert(removeBlocked, 'Last-admin delete protection was not enforced.');
		assert(roleBlocked, 'Last-admin role-removal protection was not enforced.');

		return { pass: true };
	});

	await harness.run('EnrollmentService enforces the waitlist-full boundary', 'UNIT EnrollmentService.addEnroll', { type: 'service' }, { pass: true }, async () => {
		const service = new EnrollmentService();
		const actingUser = { id: ctx.admin.user.id, role: 'ADMIN', role_id: ctx.admin.user.role_id };
		let blocked = false;

		try {
			await service.addEnroll(ctx.users.boundaryUser.role_id, ctx.waitlistFullSection.section_id, actingUser);
		} catch (error) {
			blocked = error.status === 409;
		}

		assert(blocked, 'Waitlist-full boundary should raise a conflict.');
		return { pass: true };
	});

	await harness.run('SectionService.getHighIdx keeps code numbering continuity', 'UNIT SectionService.getHighIdx', { type: 'unit' }, { pass: true }, async () => {
		const service = new SectionService();
		const hi = service.getHighIdx({ code1: 'A', code1_used: false, code4: 'B', code4_used: true, code12: 'C', code12_used: false });
		assert(hi === 12, 'Highest access-code index should be detected correctly.');
		return { pass: true, hi };
	});

	await harness.run('SectionService.revAcCodes removes both code and used-flag pairs', 'UNIT SectionService.revAcCodes', { type: 'service' }, { pass: true }, async () => {
		const service = new SectionService();
		const actingUser = { id: ctx.admin.user.id, role: 'ADMIN', role_id: ctx.admin.user.role_id };
		const before = await service.getAcCodes(ctx.section.section_id, actingUser);
		const code = Object.entries(before).find(([key, value]) => /^code\d+$/.test(key) && typeof value === 'string')?.[1];
		assert(code, 'Expected at least one code to revoke.');
		await service.revAcCodes(ctx.section.section_id, [code], actingUser);
		const after = await service.getAcCodes(ctx.section.section_id, actingUser);
		const key = Object.entries(before).find(([, value]) => value === code)?.[0];
		assert(!(key in after), 'Revoked code key should be removed.');
		assert(!(`${key}_used` in after), 'Revoked used-flag key should be removed.');
		return { pass: true };
	});

	await harness.run('SectionService.getCtx rejects professors accessing sections they do not own', 'UNIT SectionService.getCtx', { type: 'service' }, { pass: true }, async () => {
		const service = new SectionService();
		let blocked = false;
		try {
			await service.getCtx(ctx.section.section_id, {
				id: -1,
				role: 'PROFESSOR',
				role_id: -999,
			});
		} catch (error) {
			blocked = error.status === 403;
		}
		assert(blocked, 'Professor ownership check should reject non-owned sections.');
		return { pass: true };
	});

	await harness.run('EnrollmentService.enrollWithCode rejects invalid or already-used access codes', 'UNIT EnrollmentService.enrollWithCode', { type: 'service' }, { pass: true }, async () => {
		const service = new EnrollmentService();
		let invalidBlocked = false;
		let usedBlocked = false;

		try {
			await service.enrollWithCode(ctx.section.section_id, null, ctx.enrollment2.enrollment_id, 'NOT-A-REAL-CODE');
		} catch (error) {
			invalidBlocked = error.status === 400;
		}

		try {
			await service.enrollWithCode(ctx.concurrency.waitSection.section_id, null, ctx.concurrency.waitEnrollments.c.enrollment_id, ctx.concurrency.promotedCode);
		} catch (error) {
			usedBlocked = error.status === 400;
		}

		assert(invalidBlocked, 'Invalid code should be rejected.');
		assert(usedBlocked, 'Already-used code should be rejected.');
		return { pass: true };
	});

	await harness.run('AuthService rejects duplicate emails during profile updates', 'UNIT AuthService.updUser', { type: 'service' }, { pass: true }, async () => {
		const service = new AuthService();
		let blocked = false;
		try {
			await service.updUser('Runner Student', ctx.users.otherStudent.email, ctx.users.student.user.id);
		} catch (error) {
			blocked = error.status === 409;
		}
		assert(blocked, 'Duplicate email update should be rejected.');
		return { pass: true };
	});

	await harness.run('AdminService.setRole leaves exactly one role-table row after repeated transitions', 'UNIT AdminService.setRole', { type: 'service' }, { pass: true }, async () => {
		const service = new AdminService();
		await service.setRole(ctx.users.temp.user.id, 'Physics', 'STUDENT', null, { id: ctx.admin.user.id });
		await service.setRole(ctx.users.temp.user.id, 'Networks', 'PROFESSOR', null, { id: ctx.admin.user.id });

		const [admins, professors, students] = await Promise.all([
			db.query('SELECT COUNT(*) AS count FROM admins WHERE user_id = ?', [ctx.users.temp.user.id]),
			db.query('SELECT COUNT(*) AS count FROM professors WHERE user_id = ?', [ctx.users.temp.user.id]),
			db.query('SELECT COUNT(*) AS count FROM students WHERE user_id = ?', [ctx.users.temp.user.id]),
		]);

		const counts = [admins[0].count, professors[0].count, students[0].count].map(Number);
		assert(counts.reduce((sum, count) => sum + count, 0) === 1, 'Exactly one role-table row should remain after role replacement.');
		assert(Number(professors[0].count) === 1, 'The final role row should exist in professors.');

		const refreshed = await service.getUser(ctx.users.temp.user.id);
		ctx.users.temp.user = refreshed;
		return { pass: true, counts };
	});

	await harness.run('SessionService.destroy clears the cookie and tears down the session', 'UNIT SessionService.destroy', { type: 'unit' }, { pass: true }, async () => {
		const service = new SessionService();
		let destroyed = false;
		let cleared = null;
		const req = {
			session: {
				destroy(cb) {
					destroyed = true;
					cb(null);
				},
			},
		};
		const res = {
			clearCookie(name) {
				cleared = name;
			},
		};

		await service.destroy(req, res);
		assert(destroyed, 'Session destroy callback should be invoked.');
		assert(cleared === process.env.SESSION_COOKIE_NAME, 'Session cookie should be cleared using the configured cookie name.');
		return { pass: true, cleared };
	});

	await harness.run('Domain constructors reject malformed empty persistence rows', 'UNIT domain fromPersistence', { type: 'unit' }, { pass: true }, async () => {
		let userFailed = false;
		let sectionFailed = false;
		let enrollmentFailed = false;

		try {
			User.fromPersistence(null);
		} catch {
			userFailed = true;
		}
		try {
			Section.fromPersistence(null);
		} catch {
			sectionFailed = true;
		}
		try {
			Enrollment.fromPersistence(null);
		} catch {
			enrollmentFailed = true;
		}

		assert(userFailed && sectionFailed && enrollmentFailed, 'All domain constructors should reject empty persistence rows.');
		return { pass: true };
	});
}
