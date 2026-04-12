import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { loadEnv, getDatabaseName, DATABASE_DIR, requireEnv } from './common.js';

const USER_INSERTION_MARKER = '-- CODEX_SEED_USER_INSERTION_POINT';

async function insertSeedUsers(connection) {
    const [rows] = await connection.query(`
        SELECT name, email FROM seed_admin_pool
        UNION ALL
        SELECT name, email FROM seed_faculty_pool
        UNION ALL
        SELECT name, email FROM seed_student_pool
    `);

    if (!Array.isArray(rows) || rows.length === 0) {
        return;
    }

    const values = await Promise.all(
        rows.map(async (row) => {
            const password = `${row.name}${row.email}`;
            const passwordHash = await bcrypt.hash(password, 10);
            return [row.name, row.email, passwordHash, 1, 0];
        })
    );

    await connection.query(
        'INSERT INTO users (name, email, password_hash, first_login, sess_ver) VALUES ?',
        [values]
    );
}

export async function runSeed() {
    const database = getDatabaseName();
    const filePath = path.join(DATABASE_DIR, 'seeding_data.sql');
    const sql = fs.readFileSync(filePath, 'utf8');

    if (!sql.includes(USER_INSERTION_MARKER)) {
        throw new Error(`Seed marker not found in ${filePath}`);
    }

    const [beforeUsers, afterUsers] = sql.split(USER_INSERTION_MARKER);
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || '3306'),
        user: requireEnv('MYSQL_USER'),
        password: requireEnv('MYSQL_PASSWORD'),
        database,
        multipleStatements: true,
    });

    try {
        console.log('Running seeding_data.sql...');
        await connection.query(beforeUsers);
        await insertSeedUsers(connection);
        await connection.query(afterUsers);
    } finally {
        await connection.end();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        loadEnv();
        await runSeed();
        console.log('Database seed complete.');
    } catch (error) {
        console.error(`db:seed failed: ${error.message}`);
        process.exit(1);
    }
}
