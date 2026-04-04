import AdminService from '../../services/admin.service.js';

class AdminController {
	constructor() {
		this.a = new AdminService();
		this.addUser = this.addUser.bind(this);
		this.removeUser = this.removeUser.bind(this);
		this.getAllUsers = this.getAllUsers.bind(this);
		this.getUserByID = this.getUserByID.bind(this);
		this.setUserRole = this.setUserRole.bind(this);
	}

	// Add New User
	async addUser(req, res, next) {
		try {
			const { name, email, roleDetails, userType } = req.body;
			await this.a.addUser(name, email, roleDetails, userType);

			return res.status(201).json({ message: 'User created successfully.' });
		} catch (err) {
			next(err);
		}
	}

	// Remove User
	async removeUser(req, res, next) {
		try {
			const { id } = req.params;
			await this.a.removeUser(id, req.user);

			return res.status(200).json({ message: 'User removed successfully.' });
		} catch (err) {
			next(err);
		}
	}

	// Set User Type (Student / Professor)
	async setUserRole(req, res, next) {
		try {
			const { id } = req.params;
			const { userType, roleDetails } = req.body;
			await this.a.setUserRole(id, roleDetails, userType, null, req.user);

			return res.status(200).json({ message: 'User role updated successfully.' });
		} catch (err) {
			next(err);
		}
	}

	// View All Users
	async getAllUsers(req, res, next) {
		try {
			const { page = 1, limit = 10, search = '', role = null } = req.query;
			const result = await this.a.getAllUsers(page, limit, search, role);

			return res.status(200).json({
				users: result.data,
				meta: result.meta,
			});
		} catch (err) {
			next(err);
		}
	}

	// Get User by ID
	async getUserByID(req, res, next) {
		try {
			const { id } = req.params;
			const user = await this.a.getUserByID(id);

			return res.status(200).json({ user });
		} catch (err) {
			next(err);
		}
	}
}

export default AdminController;
