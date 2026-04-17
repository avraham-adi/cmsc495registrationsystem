import { loadEnv } from './common.js';
import { runSchema } from './dbSchema.js';
import { runSeed } from './dbSeed.js';

try {
	loadEnv();
	runSchema();
	runSeed();
	console.log('Project setup complete.');
} catch (error) {
	console.error(`setup failed: ${error.message}`);
	process.exit(1);
}
