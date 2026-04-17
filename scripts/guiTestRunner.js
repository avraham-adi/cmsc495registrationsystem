import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT_DIR = process.cwd();
const RESULTS_PATH = path.join(ROOT_DIR, 'frontend', '.gui-test-results.json');
const REPORT_PATH = path.join(ROOT_DIR, 'GUI Test Report.md');

function flattenAssertions(node, bucket = []) {
	if (!node || typeof node !== 'object') {
		return bucket;
	}

	if (Array.isArray(node.assertionResults)) {
		for (const assertion of node.assertionResults) {
			bucket.push(assertion);
		}
	}

	if ((!Array.isArray(node.assertionResults) || node.assertionResults.length === 0) && node.status === 'failed' && node.name) {
		bucket.push({
			fullName: node.name,
			title: node.name,
			status: 'failed',
			failureMessages: node.message ? [node.message] : [],
		});
	}

	if (Array.isArray(node.testResults)) {
		for (const child of node.testResults) {
			flattenAssertions(child, bucket);
		}
	}

	return bucket;
}

function formatFailure(assertion, index) {
	const title = assertion.fullName ?? assertion.title ?? `GUI Test ${index}`;
	const status = assertion.status ?? 'failed';
	const lines = Array.isArray(assertion.failureMessages) ? assertion.failureMessages : [];

	return [`### ${index}. ${title}`, '', `- Status: \`${status}\``, ...(lines.length > 0 ? ['', '```text', lines.join('\n\n'), '```'] : []), ''].join('\n');
}

async function writeReport(results) {
	const assertions = flattenAssertions(results);
	const failed = assertions.filter((entry) => entry.status === 'failed');
	const passed = assertions.filter((entry) => entry.status === 'passed');

	const contents = [
		'# GUI Test Report',
		'',
		`- Failed: ${failed.length}`,
		`- Passed: ${passed.length}`,
		`- Total: ${assertions.length}`,
		'',
		'## TESTS FAILED',
		'',
		...(failed.length > 0 ? failed.map((entry, index) => formatFailure(entry, index + 1)) : ['None', '']),
		'## TESTS PASSED',
		'',
		...(passed.length > 0 ? passed.map((entry, index) => `${index + 1}. ${entry.fullName ?? entry.title}`) : ['None']),
		'',
	].join('\n');

	await fs.writeFile(REPORT_PATH, contents, 'utf8');
}

async function run() {
	try {
		await execFileAsync('node', ['./node_modules/vitest/vitest.mjs', 'run', '--config', 'frontend/vite.config.ts', '--reporter=json', '--outputFile', RESULTS_PATH], { cwd: ROOT_DIR });
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error('Vitest is not installed.');
		}

		if (typeof error.stdout !== 'string' && typeof error.stderr !== 'string') {
			throw error;
		}
	}

	const raw = await fs.readFile(RESULTS_PATH, 'utf8');
	const parsed = JSON.parse(raw);
	await writeReport(parsed);

	const assertions = flattenAssertions(parsed);
	const failed = assertions.filter((entry) => entry.status === 'failed');

	console.log(`GUI test log written to ${REPORT_PATH}`);
	console.log(`Passed: ${assertions.length - failed.length}`);
	console.log(`Failed: ${failed.length}`);

	if (failed.length > 0) {
		process.exitCode = 1;
	}
}

await run();
