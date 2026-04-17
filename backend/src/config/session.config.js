import session from 'express-session';
import { query } from '../db/connection.js';

let store;

// Build Cookie Options
function buildOpt() {
	const isProduction = process.env.NODE_ENV === 'production';

	return {
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax',
		secure: isProduction,
		maxAge: 1000 * 60 * 60 * 8,
	};
}

// Get Expiry date from cookie
function getExpiry(data) {
	const c = data?.cookie?.expires;
	if (c) {
		return new Date(c);
	}

	const m = data?.cookie?.originalMaxAge ?? buildOpt().maxAge;
	return new Date(Date.now() + m);
}

// convert object into a string for DB
function serialize(data) {
	return JSON.stringify(data ?? {});
}

// Parse sessions table row.data
function deserialize(row) {
	if (!row?.data) {
		return null;
	}

	return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
}

// Helper function to get Auth out of the cookie
function getAuth(data) {
	return data?.auth ?? null;
}

// Helper function to get User ID out of the cookie
function getUserId(data) {
	return getAuth(data)?.userId ?? null;
}

// Helper functiuon to get the Session Version out of the cookie
function getVers(data) {
	return getAuth(data)?.sessVer ?? 0;
}

// Helper function to get the non-auth metadata out of the cookie
function getMeta(data) {
	const metadata = data?.metadata ?? {};

	return {
		ipAddress: metadata.ipAddress ?? null,
		userAgent: metadata.userAgent?.slice(0, 255) ?? null,
	};
}

// Helper function to enforce User ID's existence in the cookie
function assert(data) {
	const u = getUserId(data);
	if (!u) {
		throw new Error('Cannot persist a session without auth.userId.');
	}
}

// Helper function to get a row from sessions based on the Session ID
async function getRow(id) {
	const rows = await query('SELECT session_id, user_id, created_at, updated_at, expires_at, ip_addr, user_agent, sess_ver, data FROM sessions WHERE session_id = ? AND expires_at > NOW() LIMIT 1', [
		id,
	]);

	return rows[0] ?? null;
}

// Push to DB
async function push(id, data) {
	assert(data);

	const m = getMeta(data);

	await query(
		`INSERT INTO sessions
                (session_id, user_id, created_at, updated_at, expires_at, ip_addr, user_agent, sess_ver, data)
            VALUES
                (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                user_id = VALUES(user_id), updated_at = NOW(), expires_at = VALUES(expires_at), ip_addr = VALUES(ip_addr), user_agent = VALUES(user_agent), sess_ver = VALUES(sess_ver), data = VALUES(data)`,
		[id, getUserId(data), getExpiry(data), m.ipAddress, m.userAgent, getVers(data), serialize(data)]
	);
}

// Remove from DB
async function remove(id) {
	await query('DELETE FROM sessions WHERE session_id = ?', [id]);
}

async function touch(id, data) {
	await query('UPDATE sessions SET expires_at = ?, updated_at = NOW(), sess_ver = ? WHERE session_id = ?', [getExpiry(data), getVers(data), id]);
}

class MySqlSessionStore extends session.Store {
	// Get parsed JSON object
	async get(id, callback) {
		try {
			const row = await getRow(id);
			callback(null, deserialize(row));
		} catch (err) {
			callback(err);
		}
	}

	// Push to DB
	async set(id, data, callback) {
		try {
			await push(id, data);
			callback?.(null);
		} catch (err) {
			callback?.(err);
		}
	}

	// Remove from sessions
	async destroy(id, callback) {
		try {
			await remove(id);
			callback?.(null);
		} catch (err) {
			callback?.(err);
		}
	}

	// Refresh
	async touch(id, data, callback) {
		try {
			await touch(id, data);
			callback?.(null);
		} catch (err) {
			callback?.(err);
		}
	}
}

// Create new session cookie and store it
function create() {
	if (!store) {
		store = new MySqlSessionStore();
	}

	return store;
}

export { buildOpt };

// Configs
export function config() {
	return {
		name: process.env.SESSION_COOKIE_NAME,
		secret: process.env.SESSION_SECRET,
		proxy: process.env.NODE_ENV === 'production',
		resave: false,
		saveUninitialized: false,
		cookie: buildOpt(),
		store: create(),
	};
}
