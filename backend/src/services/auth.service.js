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
		const r = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login FROM users WHERE email = ?',
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

		const user = await this.getCurrentUserInfo(u.toSafeObject());
		const ifl = user.getFirstLogin();

		if (ifl === true) {
			return {
				user: user,
				firstLogin: ifl,
			};
		}
		return {
			user: user,
			firstLogin: ifl,
		};
	}

	// Change Password enforces Password Policy, Hashing, and persistence
	async changePassword(authUser = null, password) {
		if (authUser === null) {
			throw new Errors.AuthenticationError('Authentication required.');
		}
		this.validatePasswordPolicy(password, authUser);

		const hash = await bcrypt.hash(password, saltRounds);
		const result = await this.setPassword(authUser.id, hash);

		return {
			user: result,
			firstLogin: result.getFirstLogin(),
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
			const email = user.email?.toLowerCase() ?? '';
			const localPart = email.split('@')[0] ?? '';

			if (localPart && password.toLowerCase().includes(localPart)) {
				throw new Errors.ValidationError('Password cannot contain the email local-part.');
			}
		}
	}

	// Set Password in Database
	async setPassword(id, password) {
		await db.query('UPDATE users SET password_hash = ?, first_login = ? WHERE user_id = ?', [password, false, id]);
		const result = await this.getCurrentUserInfo({ id: id });
		return result;
	}

	async getCurrentUserInfo(authUser) {
		if (!authUser) {
			throw new Errors.AuthenticationError('Authentication required.');
		}

		const rows = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login FROM users WHERE user_id = ?',
			[authUser.id]
		);
		const user = User.fromPersistence(rows[0]);
		const roleRows = await this.updateUserType(user.getUserID());
		const roleUser = user.withRole(roleRows);

		return roleUser;
	}

	async updateUserInfo(name, email, id) {
		const e = await db.query('SELECT COUNT(*) AS count FROM users WHERE email = ? AND user_id <> ?', [email, id]);
		if (e[0].count > 0) {
			throw new Errors.DuplicateEntryError('User with this email already exists.');
		}
		await db.query('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, id]);
		const r = await db.query('SELECT user_id AS id, name, email, first_login FROM users WHERE user_id = ?', [id]);
		const u = User.fromPersistence(r[0]);

		return this.getCurrentUserInfo(u.toSafeObject());
	}

	// Get User Type
	async updateUserType(id) {
		const student = await db.query('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
		const professor = await db.query('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
		const admin = await db.query('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);

		if (admin.length > 0) {
			return { role: 'ADMIN', role_id: admin[0].employee_id, role_details: admin[0].access_level };
		}

		if (professor.length > 0) {
			return { role: 'PROFESSOR', role_id: professor[0].professor_id, role_details: professor[0].department };
		}

		if (student.length > 0) {
			return { role: 'STUDENT', role_id: student[0].student_id, role_details: student[0].major };
		}

		throw new Errors.NotFoundError('User does not have an assigned role type.');
	}
}

export default AuthService;
