import AuthService from '../../services/auth.service.js';
import jwt from 'jsonwebtoken';

class AuthController {
	constructor() {
		this.a = new AuthService();
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.getCurrentUser = this.getCurrentUser.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.updateUserInfo = this.updateUserInfo.bind(this);
	}

	// Express Login Method
	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const result = await this.a.login(email, password);
			const token = this.token(result.user);

			return res.status(200).json({
				message: 'Login Successful',
				firstLogin: result.firstLogin,
				token,
				user: result.user.toSafeObject(),
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Logout Method
	async logout(req, res, next) {
		try {
			return res.status(200).json({ message: 'Logout Successful' });
		} catch (err) {
			next(err);
		}
	}

	// Express Get Current User Method
	// params: id, header, token
	async getCurrentUser(req, res, next) {
		try {
			const userInfo = await this.a.getCurrentUserInfo(req.user);
			const user = userInfo.toSafeObject();
			//const token = this.token(user);

			return res.status(200).json({ user: user.toSafeObject() });
		} catch (err) {
			next(err);
		}
	}

	// Express Change Password method
	async changePassword(req, res, next) {
		try {
			const { password } = req.body;
			const result = await this.a.changePassword(req.user, password);
			const token = this.token(result.user);

			return res.status(200).json({
				message: 'Password changed successfully.',
				firstLogin: result.firstLogin,
				token,
				user: result.user.toSafeObject(),
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Update User Info
	async updateUserInfo(req, res, next) {
		try {
			const { name, email } = req.body;
			const user = await this.a.updateUserInfo(name, email, req.user.id);
			const token = this.token(user);

			return res.status(200).json({
				message: 'Updated user info successfully.',
				token,
				user: user.toSafeObject(),
			});
		} catch (err) {
			next(err);
		}
	}

	// Helper method to create JWT token
	token(user) {
		return jwt.sign(
			{ user: user.toSafeObject() ?? null, firstLogin: user.getFirstLogin() },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);
	}
}

export default AuthController;
