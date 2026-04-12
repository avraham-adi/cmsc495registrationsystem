import { loadEnv, runSqlFile } from './common.js';

export function runEnrollmentSeed() {
    runSqlFile('seed_student_histories.sql');
    runSqlFile('fill_first_step_waitlists.sql');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        loadEnv();
        runEnrollmentSeed();
        console.log('Enrollment seed complete.');
    } catch (error) {
        console.error(`db:enrollment failed: ${error.message}`);
        process.exit(1);
    }
}
