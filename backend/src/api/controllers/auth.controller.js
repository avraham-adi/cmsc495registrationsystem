/*
Adi Avraham
CMSC495 Group Golf Capstone Project
auth.controller.js
input
validated authentication HTTP requests and authenticated user context
output
JSON auth responses, session updates, and forwarded Express errors
description
Handles login, logout, self-read, password-change, and profile-update HTTP actions for authenticated sessions.
*/

import AuthService from '../../services/auth.service.js';
import SessionService from '../../services/session.service.js';

class AuthController {
	constructor() {
		this.authService = new AuthService();
		this.sessionService = new SessionService();
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.getSelf = this.getSelf.bind(this);
		this.updPass = this.updPass.bind(this);
		this.updUser = this.updUser.bind(this);
	}

	// Authenticates credentials and establishes a fresh session for the user.
	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const result = await this.authService.login(email, password);
			await this.sessionService.establish(req, result.user.id);

			return res.status(200).json({
				message: 'Login Successful',
				firstLogin: result.firstLogin,
				User: result.user,
			});
		} catch (err) {
			next(err);
		}
	}

	// Destroys the current session and clears the session cookie.
	async logout(req, res, next) {
		try {
			await this.sessionService.destroy(req, res);
			return res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	// Returns the authenticated user already hydrated by session middleware.
	async getSelf(req, res, next) {
		try {
			return res.status(200).json({ User: req.user });
		} catch (err) {
			next(err);
		}
	}

	// Updates the current user's password and refreshes the bound session identity.
	async updPass(req, res, next) {
		try {
			const { password } = req.body;
			const result = await this.authService.updPass(req.user, password);
			await this.sessionService.establish(req, result.user.id);

			return res.status(200).json({ User: result.user });
		} catch (err) {
			next(err);
		}
	}

	// Updates the current user's profile and refreshes the session payload.
	async updUser(req, res, next) {
		try {
			const { name, email } = req.body;
			const user = await this.authService.updUser(name, email, req.user.id);
			await this.sessionService.refresh(req, user.id);

			return res.status(200).json({ User: user });
		} catch (err) {
			next(err);
		}
	}
}

export default AuthController;
