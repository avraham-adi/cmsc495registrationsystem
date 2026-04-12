/*
Adi Avraham
CMSC495 Group Golf Capstone Project
admin.controller.js
input
validated admin route requests and route parameters
output
HTTP responses for user administration workflows
description
Handles admin CRUD endpoints for listing users, creating users, updating roles, and deleting accounts.
*/

import AdminService from '../../services/admin.service.js';

class AdminController {
	constructor() {
		this.adminService = new AdminService();
		this.addUser = this.addUser.bind(this);
		this.rmvUser = this.rmvUser.bind(this);
		this.getUser = this.getUser.bind(this);
		this.setRole = this.setRole.bind(this);
		this.getUsers = this.getUsers.bind(this);
	}

	// Creates a new student, professor, or admin user from the validated request body.
	async addUser(req, res, next) {
		try {
			const { name, email, detail, type } = req.body;
			const user = await this.adminService.addUser(name, email, detail, type);

			return res.status(201).json(user);
		} catch (err) {
			next(err);
		}
	}

	// Deletes a user account after the service enforces self-delete and last-admin protections.
	async rmvUser(req, res, next) {
		try {
			const { id } = req.params;
			await this.adminService.rmvUser(id, req.user);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Changes a user's role and role details while preserving role-table consistency.
	async setRole(req, res, next) {
		try {
			const { id } = req.params;
			const { type, detail } = req.body;
			const user = await this.adminService.setRole(id, detail, type, null, req.user);

			return res.status(200).json(user);
		} catch (err) {
			next(err);
		}
	}

	// Returns a paginated user list with optional search and role filters.
	async getUsers(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', role = null } = req.query;
			const result = await this.adminService.getUsers(page, limit, search, role);

			return res.status(200).json({
				User: result.data.map((user) => ({ User: user })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Returns a single user record by id for admin detail and edit flows.
	async getUser(req, res, next) {
		try {
			const { id } = req.params;
			const user = await this.adminService.getUser(id);

			return res.status(200).json(user);
		} catch (err) {
			next(err);
		}
	}
}

export default AdminController;
