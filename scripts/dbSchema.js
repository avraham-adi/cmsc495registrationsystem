import { loadEnv, runSqlFile } from './common.js';

export function runSchema() {
	runSqlFile('schema.sql');
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		loadEnv();
		runSchema();
		console.log('Schema setup complete.');
	} catch (error) {
		console.error(`db:schema failed: ${error.message}`);
		process.exit(1);
	}
}
