/*
Adi Avraham
CMSC495 Group Golf Capstone Project
session.service.js
input
request session objects, response objects, and authenticated user identifiers
output
session payloads, saved sessions, and session teardown side effects
description
Creates, refreshes, hydrates, and destroys server-side session state for authenticated users.
*/

import AuthService from './auth.service.js';
import * as Errors from '../errors/index.js';

class SessionService {
	constructor() {
		this.authService = new AuthService();
	}

	// Builds the minimal session payload stored on req.session.auth.
	createPld(user) {
		const userId = user.getUserID();
		const sessionVersion = user.getSessVer();

		return {
			userId,
			sess_ver: sessionVersion,
			sessVer: sessionVersion,
		};
	}

	// Recomputes the current session payload from the latest database-backed user state.
	async getPld(id) {
		const user = await this.authService.getUser({ id });
		return this.createPld(user);
	}

	// Hydrates the request user shape from the server-authoritative session user id.
	async hydrate(id) {
		if (!id) {
			throw new Errors.AuthenticationError('Authentication required.');
		}

		const user = await this.authService.getUser({ id });

		return {
			id: user.getUserID(),
			name: user.getName(),
			email: user.getEmail(),
			first_login: user.getFirstLogin(),
			role: user.getRole(),
			role_id: user.getRoleID(),
			role_details: user.getRoleDetails(),
		};
	}

	// Regenerates the session id and stores fresh auth metadata after login.
	async establish(req, id) {
		const payload = await this.getPld(id);

		await new Promise((resolve, reject) => {
			req.session.regenerate((err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});

		req.session.auth = payload;
		req.session.metadata = {
			ipAddress: req.ip ?? null,
			userAgent: req.get('user-agent') ?? null,
		};

		await new Promise((resolve, reject) => {
			req.session.save((err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});

		return payload;
	}

	// Rewrites the existing session payload after profile or password updates.
	async refresh(req, id) {
		const payload = await this.getPld(id);

		req.session.auth = payload;
		req.session.metadata = {
			...(req.session?.metadata ?? {}),
			ipAddress: req.ip ?? req.session?.metadata?.ipAddress ?? null,
			userAgent: req.get('user-agent') ?? req.session?.metadata?.userAgent ?? null,
		};

		await new Promise((resolve, reject) => {
			req.session.save((err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});

		return payload;
	}

	// Destroys the backing session row and clears the client cookie.
	async destroy(req, res) {
		await new Promise((resolve, reject) => {
			req.session.destroy((err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});

		res.clearCookie(process.env.SESSION_COOKIE_NAME);
		return { cleared: true };
	}
}

export default SessionService;
