/*
Adi Avraham
CMSC495 Group Golf Capstone Project
admin.service.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Implements admin-facing user, course, prerequisite, semester, and section management operations.
*/

import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';
import User from '../domain/user.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

class AdminService {
    constructor() {}

    async getRole(id, connection = null) {
        const q = connection ? (sql, params) => db.queryWithConnection(connection, sql, params) : (sql, params) => db.query(sql, params);

        const a = await q('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [id]);
        if (a.length > 0) {
            return {
                role: 'ADMIN',
                role_id: a[0].employee_id,
                role_details: a[0].access_level,
            };
        }

        const p = await q('SELECT professor_id, department FROM professors WHERE user_id = ?', [id]);
        if (p.length > 0) {
            return {
                role: 'PROFESSOR',
                role_id: p[0].professor_id,
                role_details: p[0].department,
            };
        }

        const s = await q('SELECT student_id, major FROM students WHERE user_id = ?', [id]);
        if (s.length > 0) {
            return {
                role: 'STUDENT',
                role_id: s[0].student_id,
                role_details: s[0].major,
            };
        }

        return null;
    }

    async getAdminCnt(connection = null) {
        const q = connection ? (sql, params) => db.queryWithConnection(connection, sql, params) : (sql, params) => db.query(sql, params);
        const rows = await q('SELECT COUNT(*) AS count FROM admins', []);
        return rows[0].count;
    }

    // Add New User
    async addUser(name, email, roleDetails, userType) {
        const e = await db.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
        const c = e[0].count;

        if (c > 0) {
            throw new Errors.DuplicateEntryError('User with this email already exists.');
        }

        const p = name + email;
        const h = await bcrypt.hash(p, saltRounds);

        const con = await db.getConnection();

        try {
            await db.beginTransaction(con);

            let r;
            try {
                r = await db.queryWithConnection(con, 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, h]);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Errors.DuplicateEntryError('User with this email already exists.');
                }
                throw err;
            }

            const id = r.insertId;

            await this.setRole(id, roleDetails, userType, con);

            await db.commit(con);
            return this.getUser(id);
        } catch (err) {
            await db.rollback(con);
            throw err;
        } finally {
            db.releaseConnection(con);
        }
    }

    // Remove User
    async rmvUser(id, actingUser = null) {
        const e = await db.query('SELECT COUNT(*) AS count FROM users WHERE user_id = ?', [id]);
        const c = e[0].count;

        if (c === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        if (actingUser?.id && Number(id) === Number(actingUser.id)) {
            throw new Errors.AuthorizationError('Admins cannot remove their own account.');
        }

        const role = await this.getRole(id);
        if (role?.role === 'ADMIN' && (await this.getAdminCnt()) <= 1) {
            throw new Errors.AuthorizationError('At least one admin must remain in the system.');
        }

        await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    }

    // get SQL Query for Inserting Role-Specific Data
    getRoleQry(userType) {
        const t = String(userType).toLowerCase();

        if (t === 'admin') {
            return {
                sql: 'INSERT INTO admins (user_id, access_level) VALUES (?, ?)',
            };
        }

        if (t === 'professor') {
            return {
                sql: 'INSERT INTO professors (user_id, department) VALUES (?, ?)',
            };
        }

        if (t === 'student') {
            return {
                sql: 'INSERT INTO students (user_id, major) VALUES (?, ?)',
            };
        }

        throw new Errors.ValidationError('Invalid user type.');
    }

    // Set User Type
    async setRole(id, roleDetails, userType, connection = null, actingUser = null) {
        const role = this.getRoleQry(userType);
        const con = connection ?? (await db.getConnection());
        const own = connection === null;
        const q = (sql, params) => db.queryWithConnection(con, sql, params);

        try {
            if (own) {
                await db.beginTransaction(con);
            }

            const e = await q('SELECT COUNT(*) AS count FROM users WHERE user_id = ?', [id]);

            if (e[0].count === 0) {
                throw new Errors.NotFoundError('User not found.');
            }

            const cur = await this.getRole(id, con);
            const next = String(userType).toUpperCase();

            if (actingUser?.id && Number(id) === Number(actingUser.id) && cur?.role === 'ADMIN' && next !== 'ADMIN') {
                throw new Errors.AuthorizationError('Admins cannot remove their own admin role.');
            }

            if (cur?.role === 'ADMIN' && next !== 'ADMIN' && (await this.getAdminCnt(con)) <= 1) {
                throw new Errors.AuthorizationError('At least one admin must remain in the system.');
            }

            await q('DELETE FROM admins WHERE user_id = ?', [id]);
            await q('DELETE FROM professors WHERE user_id = ?', [id]);
            await q('DELETE FROM students WHERE user_id = ?', [id]);

            await q(role.sql, [id, roleDetails]);

            if (own) {
                await db.commit(con);
                return this.getUser(id);
            }

            return id;
        } catch (err) {
            if (own) {
                await db.rollback(con);
            }
            throw err;
        } finally {
            if (own) {
                db.releaseConnection(con);
            }
        }
    }

    // Get All Users
    async getUsers(page = 1, limit = 10, search = '', role = null) {
        const p = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const l = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 10;
        const o = (p - 1) * l;
        const map = {
            ADMIN: 'admins',
            PROFESSOR: 'professors',
            STUDENT: 'students',
        };

        let w = [];
        let a = [];

        if (search) {
            w.push('(name LIKE ? OR email LIKE ?)');
            a.push('%' + search + '%', '%' + search + '%');
        }

        if (role) {
            const r = String(role).toUpperCase();
            const t = map[r];

            if (!t) {
                throw new Errors.ValidationError('Invalid role filter.');
            }

            w.push('user_id IN (SELECT user_id FROM ' + t + ' )');
        }

        const q = w.length > 0 ? 'WHERE ' + w.join(' AND ') : '';
        const c = await db.query('SELECT COUNT(*) AS count FROM users ' + q, a);
        const r = await db.query('SELECT user_id AS id, name, email, first_login FROM users ' + q + ' ORDER BY name ASC, user_id ASC LIMIT ? OFFSET ?', [...a, l, o]);
        const data = await Promise.all(
            r.map(async (row) => {
                const role = await this.getRole(row.id);
                return User.fromSafeObject({ ...row, ...(role ?? {}) }).toSafeObject();
            })
        );

        return {
            data,
            meta: {
                page: p,
                limit: l,
                total: c[0].count,
                totalPages: Math.ceil(c[0].count / l),
            },
        };
    }

    // Get User by ID
    async getUser(id) {
        const r = await db.query('SELECT user_id AS id, name, email, first_login FROM users WHERE user_id = ?', [id]);

        if (r.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        const role = await this.getRole(id);
        const u = User.fromSafeObject({ ...r[0], ...(role ?? {}) }).toSafeObject();

        return u;
    }
}

export default AdminService;
