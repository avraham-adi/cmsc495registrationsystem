import AdminService from '../../services/admin.service.js';

class AdminController {
    constructor() {
        this.authService = new AdminService();

        this.addUser = this.addUser.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserByEmail = this.getUserByEmail.bind(this);
        this.setUserRole = this.setUserRole.bind(this);
    }

    // Add New User
    async addUser(req, res, next) {
        try {
            const { name, email } = req.body;
            const password = 'Password';

            if (!name || !email) {
                return res.status(400).json({
                    error: 'Name and email are required.',
                });
            }

            await this.authService.addUser(name, email, password);

            return res.status(201).json({
                message: 'User created successfully.',
            });
        } catch (err) {
            next(err);
        }
    }

    // Remove User
    async removeUser(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'Valid user ID is required.',
                });
            }

            await this.authService.removeUser(Number(id));

            return res.status(200).json({
                message: 'User removed successfully.',
            });
        } catch (err) {
            next(err);
        }
    }

    // Set User Type (Student / Professor)
    async setUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { userType } = req.body;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'Valid user ID is required.',
                });
            }

            if (!userType) {
                return res.status(400).json({
                    error: 'User type is required.',
                });
            }

            await this.authService.setUserRole(Number(id), userType);

            return res.status(200).json({
                message: 'User role updated successfully.',
            });
        } catch (err) {
            next(err);
        }
    }

    // View All Users
    async getAllUsers(req, res, next) {
        try {
            const users = await this.authService.getAllUsers();

            return res.status(200).json({
                users,
            });
        } catch (err) {
            next(err);
        }
    }

    // Get User by Email
    async getUserByEmail(req, res, next) {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({
                    error: 'Email is required.',
                });
            }

            const user = await this.authService.getUserByEmail(email);

            return res.status(200).json({
                user,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default AdminController;
