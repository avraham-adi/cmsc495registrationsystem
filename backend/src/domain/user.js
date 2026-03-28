import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';

class User {
    #user_id;
    #name;
    #email;
    #password_hash;
    #role = null;

    constructor() {}

    async initByEmail(email) {
        const results = await db.queryStd('SELECT user_id, name, email, password_hash FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            throw new Errors.AuthenticationError('Invalid email and/or password.');
        }

        await this.#hydrateBaseUser(results[0]);
        await this.#loadRole();
    }

    async initByID(user_id) {
        const results = await db.queryStd('SELECT user_id, name, email, password_hash FROM users WHERE user_id = ?', [user_id]);

        if (results.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        await this.#hydrateBaseUser(results[0]);
        await this.#loadRole();
    }

    async #hydrateBaseUser(row) {
        this.#user_id = row.user_id;
        this.#name = row.name;
        this.#email = row.email;
        this.#password_hash = row.password_hash;
    }

    async #loadRole() {
        const studentSearch = await db.queryStd('SELECT student_id, major FROM students WHERE user_id = ?', [this.#user_id]);

        const professorSearch = await db.queryStd('SELECT professor_id, department FROM professors WHERE user_id = ?', [this.#user_id]);

        const adminSearch = await db.queryStd('SELECT employee_id, access_level FROM admins WHERE user_id = ?', [this.#user_id]);

        if (studentSearch.length > 0) {
            const row = studentSearch[0];
            this.#role = {
                role: 'STUDENT',
                role_id: row.student_id,
                role_attribute: row.major,
            };
            return;
        }

        if (professorSearch.length > 0) {
            const row = professorSearch[0];
            this.#role = {
                role: 'PROFESSOR',
                role_id: row.professor_id,
                role_attribute: row.department,
            };
            return;
        }

        if (adminSearch.length > 0) {
            const row = adminSearch[0];
            this.#role = {
                role: 'ADMIN',
                role_id: row.employee_id,
                role_attribute: row.access_level,
            };
            return;
        }

        this.#role = {
            role: null,
            role_id: null,
            role_attribute: null,
        };
    }

    async refresh() {
        if (!this.#user_id) {
            throw new Errors.ValidationError('Cannot refresh user before initialization.');
        }

        await this.initByID(this.#user_id);
    }

    compareUser(user) {
        return JSON.stringify(this.getInternalUserInfo()) === JSON.stringify(user.getInternalUserInfo());
    }

    getUserID() {
        return this.#user_id;
    }

    getName() {
        return this.#name;
    }

    getEmail() {
        return this.#email;
    }

    getPasswordHash() {
        return this.#password_hash;
    }

    getRole() {
        return this.#role?.role ?? null;
    }

    getRoleID() {
        return this.#role?.role_id ?? null;
    }

    getRoleAttribute() {
        return this.#role?.role_attribute ?? null;
    }

    getSafeUserInfo() {
        return {
            user_id: this.getUserID(),
            name: this.getName(),
            email: this.getEmail(),
            role: this.getRole(),
            role_id: this.getRoleID(),
            role_attribute: this.getRoleAttribute(),
        };
    }

    getInternalUserInfo() {
        return {
            user_id: this.getUserID(),
            name: this.getName(),
            email: this.getEmail(),
            password_hash: this.getPasswordHash(),
            role: this.getRole(),
            role_id: this.getRoleID(),
            role_attribute: this.getRoleAttribute(),
        };
    }
}

export default User;
