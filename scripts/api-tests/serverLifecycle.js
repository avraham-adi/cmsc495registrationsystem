import { spawn } from 'node:child_process';
import { API_TEST_VERBOSE } from './config.js';

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForServer(baseUrl, timeoutMs) {
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(`${baseUrl}/api/health`);
			if (res.ok) {
				return true;
			}
		} catch {
			// ignore while waiting
		}

		await sleep(250);
	}

	return false;
}

export function startServer(serverEntry) {
	const child = spawn('node', [serverEntry], {
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	const logBuffer = [];

	child.stdout.setEncoding('utf-8');
	child.stderr.setEncoding('utf-8');

	child.stdout.on('data', (data) => {
		logBuffer.push(`[server] ${data}`);
		if (API_TEST_VERBOSE) {
			process.stdout.write(`[server] ${data}`);
		}
	});

	child.stderr.on('data', (data) => {
		logBuffer.push(`[server:err] ${data}`);
		if (API_TEST_VERBOSE) {
			process.stderr.write(`[server:err] ${data}`);
		}
	});

	child.getBufferedLogs = () => logBuffer.join('');

	return child;
}

export async function stopServer(child) {
	if (!child) return;

	if (child.exitCode !== null || child.killed) {
		return;
	}

	await new Promise((resolve) => {
		let settled = false;

		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(sigtermTimer);
			clearTimeout(sigkillTimer);
			resolve();
		};

		const onExit = () => {
			child.off('exit', onExit);
			child.off('close', onExit);
			finish();
		};

		const sigtermTimer = setTimeout(() => {
			if (child.exitCode === null) {
				child.kill('SIGTERM');
			}
		}, 2000);

		const sigkillTimer = setTimeout(() => {
			if (child.exitCode === null) {
				child.kill('SIGKILL');
			}
		}, 5000);

		child.once('exit', onExit);
		child.once('close', onExit);
		child.kill('SIGINT');
	});
}
