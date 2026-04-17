/*
Adi Avraham
CMSC495 Group Golf Capstone Project
user.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the user domain model, role hydration, and safe serialization helpers.
*/

import * as Errors from '../errors/index.js';

class User {
	#id;
	#name;
	#email;
	#password_hash;
	#first_login;
	#sess_ver;
	#role;
	#role_id;
	#role_details;

	// Default Constructor
	constructor({ id, name, email, password_hash = null, first_login, sess_ver = 0, role = null, role_id = null, role_details = null }) {
		this.#id = id;
		this.#name = name;
		this.#email = email;
		this.#password_hash = password_hash;
		this.#first_login = first_login;
		this.#sess_ver = sess_ver;
		this.#role = role;
		this.#role_id = role_id;
		this.#role_details = role_details;
	}

	// Constructs a User instance from a raw database result row.
	static fromPersistence(row) {
		if (!row) {
			throw new Errors.ValidationError('Row cannot be empty.');
		}

		const user = new User({
			id: row.id,
			name: row.name,
			email: row.email,
			password_hash: row.password_hash ?? null,
			first_login: row.first_login,
			sess_ver: row.sess_ver ?? 0,
			role: row.role ?? null,
			role_id: row.role_id ?? null,
			role_details: row.role_details ?? null,
		});

		return user;
	}

	// Constructs a User instance from a sanitized object (No password_hash);
	static fromSafeObject(data) {
		if (!data) {
			throw new Errors.ValidationError('Object data is required.');
		}

		return new User({
			id: data.id,
			name: data.name,
			email: data.email,
			first_login: data.first_login,
			sess_ver: data.sess_ver ?? data.sessVer ?? 0,
			role: data.role ?? null,
			role_id: data.role_id ?? null,
			role_details: data.role_details ?? null,
		});
	}

	// Get User ID
	getUserID() {
		return this.#id;
	}

	// Get User Name
	getName() {
		return this.#name;
	}

	// Get User Email
	getEmail() {
		return this.#email;
	}

	// Get User Password Hash
	getPasswordHash() {
		return this.#password_hash;
	}

	// Get User First Login Status
	getFirstLogin() {
		return this.#first_login === 1;
	}

	getSessVer() {
		return this.#sess_ver;
	}

	// Get User Role
	getRole() {
		return this.#role;
	}

	// Get User Role ID
	getRoleID() {
		return this.#role_id;
	}

	// Get user Role Details
	getRoleDetails() {
		return this.#role_details;
	}

	// Returns whether the User has a role (boolean)
	hasRole() {
		return this.#role !== null;
	}

	// Returns whether the User is a student (boolean)
	isStudent() {
		return this.#role === 'STUDENT';
	}

	// Returns whether the User is a professor (boolean)
	isProfessor() {
		return this.#role === 'PROFESSOR';
	}

	// Returns whether the User is an admin (boolean)
	isAdmin() {
		return this.#role === 'ADMIN';
	}

	// Returns whether the User instance has the same id as the input user object (boolean)
	hasSameIdentityAs(otherUser) {
		if (!(otherUser instanceof User)) {
			return false;
		}

		return this.#id === otherUser.getUserID();
	}

	// Creates a new User instance with updated role-related info while preserving all other properties
	withRole({ role, role_id = null, role_details = null }) {
		return new User({
			id: this.#id,
			name: this.#name,
			email: this.#email,
			password_hash: this.#password_hash,
			first_login: this.#first_login,
			sess_ver: this.#sess_ver,
			role,
			role_id,
			role_details,
		});
	}

	// Creates a new User instance with the Password Hash and first_login removed
	withoutPasswordHash() {
		return new User({
			id: this.#id,
			name: this.#name,
			email: this.#email,
			first_login: this.#first_login,
			sess_ver: this.#sess_ver,
			role: this.#role,
			role_id: this.#role_id,
			role_details: this.#role_details,
		});
	}

	// Produces a sanitized representation of the user (public use)
	toSafeObject() {
		return {
			id: this.#id,
			name: this.#name,
			email: this.#email,
			first_login: this.#first_login,
			role: this.#role,
			role_id: this.#role_id,
			role_details: this.#role_details,
		};
	}

	// Produces a full representation of the user including sensitive fields (internal use)
	toPersistenceObject() {
		return {
			id: this.#id,
			name: this.#name,
			email: this.#email,
			password_hash: this.#password_hash,
			first_login: this.#first_login,
			sess_ver: this.#sess_ver,
			role: this.#role,
			role_id: this.#role_id,
			role_details: this.#role_details,
		};
	}
}

export default User;
