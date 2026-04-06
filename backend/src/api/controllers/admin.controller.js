import AdminService from '../../services/admin.service.js';

class AdminController {
	constructor() {
		this.a = new AdminService();
		this.addUser = this.addUser.bind(this);
		this.rmvUser = this.rmvUser.bind(this);
		this.getUser = this.getUser.bind(this);
		this.setRole = this.setRole.bind(this);
		this.getUsers = this.getUsers.bind(this);
	}

	// Add New User
	async addUser(req, res, next) {
		try {
			const { name, email, detail, type } = req.body;
			const user = await this.a.addUser(name, email, detail, type);

			return res.status(201).json(user);
		} catch (err) {
			next(err);
		}
	}

	// Remove User
	async rmvUser(req, res, next) {
		try {
			const { id } = req.params;
			await this.a.rmvUser(id, req.user);

			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Set User Type (Student / Professor)
	async setRole(req, res, next) {
		try {
			const { id } = req.params;
			const { type, detail } = req.body;
			const user = await this.a.setRole(id, detail, type, null, req.user);

			return res.status(200).json(user);
		} catch (err) {
			next(err);
		}
	}

	// View All Users
	async getUsers(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', role = null } = req.query;
			const result = await this.a.getUsers(page, limit, search, role);

			return res.status(200).json({
				User: result.data.map((u) => ({ User: u })),
				Meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Get User by ID
	async getUser(req, res, next) {
		try {
			const { id } = req.params;
			const user = await this.a.getUser(id);

			return res.status(200).json(user);
		} catch (err) {
			next(err);
		}
	}
}

export default AdminController;
