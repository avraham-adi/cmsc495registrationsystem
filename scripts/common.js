import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATABASE_DIR = path.join(ROOT_DIR, 'database');
export const ENV_PATH = path.join(ROOT_DIR, '.env');

function parseEnv(contents) {
	const env = {};

	for (const rawLine of contents.split(/\r?\n/)) {
		const line = rawLine.trim();

		if (!line || line.startsWith('#')) continue;

		const idx = line.indexOf('=');
		if (idx === -1) continue;

		const key = line.slice(0, idx).trim();
		let value = line.slice(idx + 1).trim();

		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}

		env[key] = value;
	}

	return env;
}

export function loadEnv() {
	if (!fs.existsSync(ENV_PATH)) {
		throw new Error('.env file not found at project root.');
	}

	const envContents = fs.readFileSync(ENV_PATH, 'utf8');
	const parsed = parseEnv(envContents);

	for (const [key, value] of Object.entries(parsed)) {
		if (!process.env[key]) {
			process.env[key] = value;
		}
	}
}

export function requireEnv(name) {
	const value = process.env[name];

	if (!value || !String(value).trim()) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

export function getDatabaseName() {
	return process.env.MYSQL_DATABASE || 'registrationdb';
}

export function runSqlFile(filename, { database } = {}) {
	const filePath = path.join(DATABASE_DIR, filename);

	if (!fs.existsSync(filePath)) {
		throw new Error(`SQL file not found: ${filePath}`);
	}

	const host = process.env.MYSQL_HOST || '127.0.0.1';
	const port = process.env.MYSQL_PORT || '3306';
	const user = requireEnv('MYSQL_USER');
	const password = requireEnv('MYSQL_PASSWORD');

	const sql = fs.readFileSync(filePath, 'utf8');

	const args = [`--host=${host}`, `--port=${port}`, `--user=${user}`, `--password=${password}`];

	if (database) {
		args.push(database);
	}

	console.log(`Running ${filename}...`);

	execFileSync('mysql', args, {
		input: sql,
		stdio: ['pipe', 'inherit', 'inherit'],
		cwd: ROOT_DIR,
	});
}
