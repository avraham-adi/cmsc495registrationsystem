/**
 * authService
 *
 * Responsibilities:
 * Handle user calls to the database for authentication and validation.
 * Determine whether a user is still on their first login.
 * Enforce password policy during credential rotation.
 */

import User from '../domain/user.js';
import * as Errors from '../errors/index.js';
import * as bcrypt from 'bcrypt';
import * as db from '../db/connection.js';

const saltRounds = 10;

class AuthService {
	constructor() {}

	// Initialize User
	async login(email, password) {
		// TODO(SESSION_AUTH_MIGRATION): after credential verification, return the user payload needed to seed req.session.auth.
		const r = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login, sess_ver FROM users WHERE email = ?',
			[email]
		);

		if (r.length === 0) {
			throw new Errors.AuthenticationError('Invalid email and/or password.');
		}

		const u = User.fromPersistence(r[0]);

		const p = await bcrypt.compare(password, u.getPasswordHash());

		if (p === false) {
			throw new Errors.AuthenticationError('Invalid email and/or password.');
		}

		const usr = await this.getUser(u.toSafeObject());
		const fl = usr.getFirstLogin();

		if (fl === true) {
			return {
				user: usr.toSafeObject(),
				firstLogin: fl,
			};
		}
		return {
			user: usr.toSafeObject(),
			firstLogin: fl,
		};
	}

	// Change Password enforces Password Policy, Hashing, and persistence
	async updPass(authUser = null, password) {
		if (authUser === null) {
			throw new Errors.AuthenticationError('Authentication required.');
		}
		this.validatePasswordPolicy(password, authUser);

		const hash = await bcrypt.hash(password, saltRounds);
		const r = await this.setPass(authUser.id, hash);

		return {
			user: r.toSafeObject(),
			firstLogin: r.getFirstLogin(),
		};
	}

	validatePasswordPolicy(password, user = null) {
		if (!password || typeof password !== 'string') {
			throw new Errors.ValidationError('Password is required.');
		}

		if (password === 'Password') {
			throw new Errors.ValidationError('Password cannot be the default password.');
		}

		if (password.length < 8) {
			throw new Errors.ValidationError('Password must be at least 8 characters long.');
		}

		if (!/[A-Z]/.test(password)) {
			throw new Errors.ValidationError('Password must contain at least one uppercase letter.');
		}

		if (!/[a-z]/.test(password)) {
			throw new Errors.ValidationError('Password must contain at least one lowercase letter.');
		}

		if (!/[0-9]/.test(password)) {
			throw new Errors.ValidationError('Password must contain at least one number.');
		}

		if (!/[^A-Za-z0-9]/.test(password)) {
			throw new Errors.ValidationError('Password must contain at least one special character.');
		}

		if (user) {
			const e = user.email?.toLowerCase() ?? '';
			const lp = e.split('@')[0] ?? '';

			if (lp && password.toLowerCase().includes(lp)) {
				throw new Errors.ValidationError('Password cannot contain the email local-part.');
			}
		}
	}

	// Set Password in Database
	async setPass(id, password) {
		await db.query('UPDATE users SET password_hash = ?, first_login = ?, sess_ver = sess_ver + 1 WHERE user_id = ?', [password, false, id]);
		const r = await this.getUser({ id: id });
		return r;
	}

	async getUser(authUser) {
		if (!authUser) {
			throw new Errors.AuthenticationError('Authentication required.');
		}
		// TODO(SESSION_AUTH_MIGRATION): preserve this lookup path; session auth should still hydrate the full user from the database.

		const r = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login, sess_ver FROM users WHERE user_id = ?',
			[authUser.id]
		);
		const u = User.fromPersistence(r[0]);
		const role = await this.updType(u.getUserID());
		const ru = u.withRole(role);

		return ru;
	}

	async updUser(name, email, id) {
		const e = await db.query('SELECT COUNT(*) AS count FROM users WHERE email = ? AND user_id <> ?', [email, id]);
		if (e[0].count > 0) {
			throw new Errors.DuplicateEntryError('User with this email already exists.');
		}
		await db.query('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, id]);
		const r = await db.query('SELECT user_id AS id, name, email, first_login, sess_ver FROM users WHERE user_id = ?', [id]);
		const u = User.fromPersistence(r[0]);

		const usr = await this.getUser(u.toSafeObject());
		return usr.toSafeObject();
	}

	// Get User Type
	async updType(id) {
		// TODO(SESSION_AUTH_MIGRATION): role is intentionally reloaded from the database and should not be trusted from the session cookie.
		const s = await db.query('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
		const p = await db.query('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
		const a = await db.query('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);

		if (a.length > 0) {
			return { role: 'ADMIN', role_id: a[0].employee_id, role_details: a[0].access_level };
		}

		if (p.length > 0) {
			return { role: 'PROFESSOR', role_id: p[0].professor_id, role_details: p[0].department };
		}

		if (s.length > 0) {
			return { role: 'STUDENT', role_id: s[0].student_id, role_details: s[0].major };
		}

		throw new Errors.NotFoundError('User does not have an assigned role type.');
	}
}

export default AuthService;
