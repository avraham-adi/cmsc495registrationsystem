import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { close as closeDb } from '../../backend/src/db/connection.js';
import { BASE_URL, SERVER_ENTRY, SERVER_READY_TIMEOUT_MS } from './config.js';
import { createHarness, createTestEnv, LOG_PATH, resetDatabase } from './shared.js';
import { startServer, stopServer, waitForServer } from './serverLifecycle.js';
import { runCoreSuite } from './suites/core.suite.js';
import { runAdminSuite } from './suites/admin.suite.js';
import { runSessionAuthSuite } from './suites/sessionAuth.suite.js';
import { runCatalogSuite } from './suites/catalog.suite.js';
import { runEnrollmentSuite } from './suites/enrollment.suite.js';
import { runConcurrencySuite } from './suites/concurrency.suite.js';
import { runEdgeCasesSuite } from './suites/edgeCases.suite.js';
import { runUnitStyleSuite } from './suites/unitStyle.suite.js';
import { runCleanupSuite } from './suites/cleanup.suite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runApiTests() {
	const harness = createHarness(BASE_URL);
	const { clients, ctx } = createTestEnv(BASE_URL);
	const env = { harness, clients, ctx };
	let child;

	try {
		await resetDatabase();
		child = startServer(path.resolve(__dirname, '..', '..', SERVER_ENTRY.replace(/^\.\//, '')));

		const ready = await waitForServer(BASE_URL, SERVER_READY_TIMEOUT_MS);
		if (!ready) {
			throw new Error('Server did not become ready in time.');
		}

		await runCoreSuite(env);
		await runAdminSuite(env);
		await runSessionAuthSuite(env);
		await runCatalogSuite(env);
		await runEnrollmentSuite(env);
		await runConcurrencySuite(env);
		await runEdgeCasesSuite(env);
		await runUnitStyleSuite(env);
		await runCleanupSuite(env);
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	} finally {
		await harness.writeLog();
		await stopServer(child);
		await closeDb();
	}

	const failed = harness.results.filter((result) => !result.passed);
	const passed = harness.results.filter((result) => result.passed);

	console.log(`\nTest log written to ${LOG_PATH}`);
	console.log(`Passed: ${passed.length}`);
	console.log(`Failed: ${failed.length}`);

	if (failed.length > 0) {
		process.exitCode = 1;
	}
}
