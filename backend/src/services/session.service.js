import AuthService from './auth.service.js';
import * as Errors from '../errors/index.js';

class SessionService {
	constructor() {
		this.a = new AuthService();
	}

	createPld(u) {
		const id = u.getUserID();
		const ver = u.getSessVer();

		return {
			userId: id,
			sess_ver: ver,
			sessVer: ver,
		};
	}

	async getPld(id) {
		const u = await this.a.getUser({ id });
		return this.createPld(u);
	}

	async hydrate(id) {
		if (!id) {
			throw new Errors.AuthenticationError('Authentication required.');
		}

		// TODO(SESSION_AUTH_MIGRATION): use this lookup from session middleware to build req.user for each request.
		const u = await this.a.getUser({ id: id });

		return {
			id: u.getUserID(),
			name: u.getName(),
			email: u.getEmail(),
			first_login: u.getFirstLogin(),
			role: u.getRole(),
			role_id: u.getRoleID(),
			role_details: u.getRoleDetails(),
		};
	}

	async establish(req, id) {
		const p = await this.getPld(id);

		await new Promise((resolve, reject) => {
			req.session.regenerate((err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});

		req.session.auth = p;
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

		return p;
	}

	async refresh(req, id) {
		const p = await this.getPld(id);

		req.session.auth = p;
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

		return p;
	}

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
