import { loadEnv } from './common.js';
import { runSchema } from './dbSchema.js';
import { runSeed } from './dbSeed.js';
import { runEnrollmentSeed } from './dbEnrollment.js';

try {
	loadEnv();
	runSchema();
	await runSeed();
	runEnrollmentSeed();
	console.log('Database reset complete.');
} catch (error) {
	console.error(`db:reset failed: ${error.message}`);
	process.exit(1);
}
