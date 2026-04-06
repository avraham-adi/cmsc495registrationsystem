import AuthService from '../../services/auth.service.js';
import SessionService from '../../services/session.service.js';

class AuthController {
	constructor() {
		this.a = new AuthService();
		this.s = new SessionService();
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.getSelf = this.getSelf.bind(this);
		this.updPass = this.updPass.bind(this);
		this.updUser = this.updUser.bind(this);
	}

	// Express Login Method
	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const result = await this.a.login(email, password);
			await this.s.establish(req, result.user.id);

			return res.status(200).json({
				message: 'Login Successful',
				firstLogin: result.firstLogin,
				User: result.user,
			});
		} catch (err) {
			next(err);
		}
	}

	// Express Logout Method
	async logout(req, res, next) {
		try {
			await this.s.destroy(req, res);
			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Express Get Current User Method
	async getSelf(req, res, next) {
		try {
			return res.status(200).json({ User: req.user });
		} catch (err) {
			next(err);
		}
	}

	// Express Change Password method
	async updPass(req, res, next) {
		try {
			const { password } = req.body;
			const result = await this.a.updPass(req.user, password);
			await this.s.establish(req, result.user.id);

			return res.status(200).json({ User: result.user });
		} catch (err) {
			next(err);
		}
	}

	// Express Update User Info
	async updUser(req, res, next) {
		try {
			const { name, email } = req.body;
			const user = await this.a.updUser(name, email, req.user.id);
			await this.s.refresh(req, user.id);

			return res.status(200).json({ User: user });
		} catch (err) {
			next(err);
		}
	}
}

export default AuthController;
