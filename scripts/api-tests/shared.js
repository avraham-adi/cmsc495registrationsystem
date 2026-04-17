import path from 'node:path';
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import { ADMIN_USER } from './config.js';
import { ROOT_DIR } from '../common.js';

dotenv.config({ quiet: true });

const execFileAsync = promisify(execFile);
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'sid';
export const LOG_PATH = path.join(ROOT_DIR, 'Test Report.md');

function inspect(value) {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	if (typeof value === 'string') return value;

	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

export function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

export function assertStatus(response, status) {
	assert(response.status === status, `Expected HTTP ${status}, received ${response.status}.`);
}

export function assertHasKeys(value, keys, label) {
	assert(value && typeof value === 'object', `${label} must be an object.`);

	for (const key of keys) {
		assert(Object.hasOwn(value, key), `${label} is missing "${key}".`);
	}
}

export function strongPassword(label) {
	return `${label}#2026!Aa1`;
}

export function defaultPassword(name, email) {
	return `${name}${email}`;
}

export function findFirstCode(codes) {
	return Object.entries(codes).find(([key, value]) => /^code\d+$/.test(key) && typeof value === 'string')?.[1] ?? null;
}

export async function resetDatabase() {
	await execFileAsync('node', ['./scripts/dbReset.js'], {
		cwd: ROOT_DIR,
	});
}

export class CookieClient {
	constructor(baseUrl, cookie = '') {
		this.baseUrl = baseUrl;
		this.cookie = cookie;
	}

	clone() {
		return new CookieClient(this.baseUrl, this.cookie);
	}

	clear() {
		this.cookie = '';
	}

	async request(endpoint, options = {}) {
		const { method = 'GET', headers = {}, body } = options;
		const finalHeaders = { ...headers };

		if (this.cookie) {
			finalHeaders.Cookie = this.cookie;
		}

		if (body !== undefined) {
			finalHeaders['Content-Type'] = 'application/json';
		}

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method,
			headers: finalHeaders,
			body: body === undefined ? undefined : JSON.stringify(body),
		});

		const setCookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [response.headers.get('set-cookie')].filter(Boolean);

		const sessionCookie = setCookies.find((value) => value.startsWith(`${COOKIE_NAME}=`));
		if (sessionCookie) {
			this.cookie = sessionCookie.split(';', 1)[0];
		}

		const raw = await response.text();
		let parsed = null;

		if (raw) {
			try {
				parsed = JSON.parse(raw);
			} catch {
				parsed = raw;
			}
		}

		return {
			status: response.status,
			ok: response.ok,
			body: parsed,
			text: raw,
			headers: Object.fromEntries(response.headers.entries()),
		};
	}
}

export function createHarness(baseUrl) {
	const results = [];
	let count = 0;

	async function run(title, endpoint, requestDetails, expectedResponse, fn) {
		count += 1;
		const record = {
			id: count,
			title,
			endpoint,
			request: requestDetails,
			expected: expectedResponse,
			actual: null,
			passed: false,
		};

		try {
			const actual = await fn();
			record.actual = actual;
			record.passed = true;
			console.log(`PASS ${count}: ${title}`);
		} catch (error) {
			record.actual = {
				error: error.message,
				stack: error.stack,
			};
			console.log(`FAIL ${count}: ${title}`);
		}

		results.push(record);
		return record;
	}

	async function login(client, email, password) {
		return client.request('/user/login', {
			method: 'POST',
			body: { email, password },
		});
	}

	async function ensureCurrentPassword(client, identity) {
		const loginResponse = await login(client, identity.email, identity.password);
		assertStatus(loginResponse, 200);
		assertHasKeys(loginResponse.body, ['message', 'firstLogin', 'User'], 'Login response');

		if (loginResponse.body.firstLogin) {
			const patchResponse = await client.request('/user/me', {
				method: 'PATCH',
				body: { password: identity.nextPassword },
			});
			assertStatus(patchResponse, 200);
			identity.password = identity.nextPassword;
		}

		return loginResponse;
	}

	function responseSummary(response) {
		return {
			status: response.status,
			body: response.body,
		};
	}

	async function writeLog() {
		const failed = results.filter((result) => !result.passed);
		const passed = results.filter((result) => result.passed);
		const block = (label, value) => [`**${label}:**`, '```json', inspect(value), '```'].join('\n');
		const format = (result) =>
			[
				`### Test ${result.id}: ${result.title}`,
				'',
				`**Endpoint:** \`${result.endpoint}\``,
				'',
				block('Request', result.request),
				'',
				block('Expected Response', result.expected),
				'',
				block('Actual Response', result.actual),
				'',
				`**${result.passed ? 'PASS' : 'FAIL'}**`,
				'',
			].join('\n');

		const contents = [
			'# Test Report',
			'',
			`- Failed: ${failed.length}`,
			`- Passed: ${passed.length}`,
			`- Total: ${results.length}`,
			'',
			'## TESTS FAILED',
			'',
			...(failed.length ? failed.map(format) : ['None', '']),
			'## TESTS PASSED',
			'',
			...(passed.length ? passed.map(format) : ['None', '']),
		].join('\n');

		await fs.writeFile(LOG_PATH, contents, 'utf8');
	}

	return {
		baseUrl,
		results,
		run,
		login,
		ensureCurrentPassword,
		responseSummary,
		writeLog,
	};
}

export function createTestEnv(baseUrl) {
	const clients = {
		anonymous: new CookieClient(baseUrl),
		admin: new CookieClient(baseUrl),
		student: new CookieClient(baseUrl),
		professor: new CookieClient(baseUrl),
		otherStudent: new CookieClient(baseUrl),
	};

	const ctx = {
		admin: {
			email: ADMIN_USER.email,
			password: ADMIN_USER.password,
			nextPassword: strongPassword('AdminRunner'),
			user: null,
		},
		users: {
			professor: {
				name: 'Runner Professor',
				email: 'runner.professor@example.edu',
				detail: 'Computer Science',
				type: 'PROFESSOR',
				password: null,
				nextPassword: strongPassword('ProfessorRunner'),
				user: null,
			},
			student: {
				name: 'Runner Student',
				email: 'runner.student@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('StudentRunner'),
				user: null,
			},
			otherStudent: {
				name: 'Runner Student Two',
				email: 'runner.student2@example.edu',
				detail: 'Mathematics',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('StudentRunnerTwo'),
				user: null,
			},
			temp: {
				name: 'Runner Temp',
				email: 'runner.temp@example.edu',
				detail: 'History',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('TempRunner'),
				user: null,
			},
		},
		course1: null,
		course2: null,
		semester: null,
		section: null,
		accessCodes: null,
		extraCodes: null,
		enrollment1: null,
		enrollment2: null,
		enrollmentCode1: null,
		extraUsers: [],
		extraCourses: [],
		extraSemesters: [],
		extraSections: [],
		extraEnrollments: [],
		extraPrereqs: [],
	};

	for (const user of Object.values(ctx.users)) {
		user.password = defaultPassword(user.name, user.email);
	}

	return { clients, ctx };
}
