/*
Adi Avraham
CMSC495 Group Golf Capstone Project
auth.service.js
input
authenticated user state, request data, and database query inputs
output
normalized auth records, password updates, and profile mutations
description
Validates credentials, enforces password rules, and hydrates full user role state from MySQL.
*/

import User from '../domain/user.js';
import * as Errors from '../errors/index.js';
import * as bcrypt from 'bcrypt';
import * as db from '../db/connection.js';

const saltRounds = 10;

class AuthService {
	constructor() {}

	// Authenticates a user and returns the fully hydrated session-safe user payload.
	async login(email, password) {
		const userRows = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login, sess_ver FROM users WHERE email = ?',
			[email]
		);

		if (userRows.length === 0) {
			throw new Errors.AuthenticationError('Invalid email and/or password.');
		}

		const persistedUser = User.fromPersistence(userRows[0]);

		const passwordMatches = await bcrypt.compare(password, persistedUser.getPasswordHash());

		if (passwordMatches === false) {
			throw new Errors.AuthenticationError('Invalid email and/or password.');
		}

		const user = await this.getUser(persistedUser.toSafeObject());
		const firstLogin = user.getFirstLogin();

		if (firstLogin === true) {
			return {
				user: user.toSafeObject(),
				firstLogin,
			};
		}
		return {
			user: user.toSafeObject(),
			firstLogin,
		};
	}

	// Updates the authenticated user's password and rotates the backing session version.
	async updPass(authUser = null, password) {
		if (authUser === null) {
			throw new Errors.AuthenticationError('Authentication required.');
		}
		this.validatePasswordPolicy(password, authUser);

		const passwordHash = await bcrypt.hash(password, saltRounds);
		const user = await this.setPass(authUser.id, passwordHash);

		return {
			user: user.toSafeObject(),
			firstLogin: user.getFirstLogin(),
		};
	}

	// Enforces the shared password policy used by first-login and later password changes.
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

	// Persists a password hash and returns the refreshed user record.
	async setPass(id, password) {
		await db.query('UPDATE users SET password_hash = ?, first_login = ?, sess_ver = sess_ver + 1 WHERE user_id = ?', [password, false, id]);
		return this.getUser({ id });
	}

	// Reloads the full user record and server-authoritative role metadata from the database.
	async getUser(authUser) {
		if (!authUser) {
			throw new Errors.AuthenticationError('Authentication required.');
		}

		const userRows = await db.query(
			'SELECT user_id AS id, name, email, password_hash, first_login, sess_ver FROM users WHERE user_id = ?',
			[authUser.id]
		);
		const user = User.fromPersistence(userRows[0]);
		const role = await this.updType(user.getUserID());
		const hydratedUser = user.withRole(role);

		return hydratedUser;
	}

	// Updates profile fields while protecting email uniqueness across all users.
	async updUser(name, email, id) {
		const duplicateRows = await db.query('SELECT COUNT(*) AS count FROM users WHERE email = ? AND user_id <> ?', [email, id]);
		if (duplicateRows[0].count > 0) {
			throw new Errors.DuplicateEntryError('User with this email already exists.');
		}
		await db.query('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, id]);
		const userRows = await db.query('SELECT user_id AS id, name, email, first_login, sess_ver FROM users WHERE user_id = ?', [id]);
		const user = User.fromPersistence(userRows[0]);

		const refreshedUser = await this.getUser(user.toSafeObject());
		return refreshedUser.toSafeObject();
	}

	// Resolves the current role row so authorization always reflects the database, not the cookie.
	async updType(id) {
		const studentRows = await db.query('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
		const professorRows = await db.query('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
		const adminRows = await db.query('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);

		if (adminRows.length > 0) {
			return { role: 'ADMIN', role_id: adminRows[0].employee_id, role_details: adminRows[0].access_level };
		}

		if (professorRows.length > 0) {
			return { role: 'PROFESSOR', role_id: professorRows[0].professor_id, role_details: professorRows[0].department };
		}

		if (studentRows.length > 0) {
			return { role: 'STUDENT', role_id: studentRows[0].student_id, role_details: studentRows[0].major };
		}

		throw new Errors.NotFoundError('User does not have an assigned role type.');
	}
}

export default AuthService;
