// Stores the current user in memory as an object
import * as db from '../db/db.js';
import * as Errors from '../errors/index.js';

class User {
    #user_id;
    name;
    #email;
    #password_hash;
    #role = {};

    constructor(email) {
        this.#email = email;
    }

    // Initialize user information from email into memory, then check for role and initialize role information into memory.
    async init() {
        const results = await db.queryStd(
            'SELECT user_id, name, password_hash FROM users WHERE email = ?',
            [this.#email]
        );

        if (results.length == 0) {
            throw new Errors.AuthenticationError('Invalid email and/or password.');
        }

        const row = results[0];

        this.#user_id = row.user_id;
        this.name = row.name;
        this.#password_hash = row.password_hash;

        const studentSearch = await db.queryStd('SELECT * FROM students WHERE user_id = ?', [
            this.#user_id,
        ]);

        const professorSearch = await db.queryStd('SELECT * FROM professors WHERE user_id = ?', [
            this.#user_id,
        ]);

        const adminSearch = await db.queryStd('SELECT * FROM admins WHERE user_id = ?', [
            this.#user_id,
        ]);

        if (studentSearch.length > 0) {
            const row = studentSearch[0];
            let user_id = row.user_id;
            let student_id = row.student_id;
            let major = row.major;

            this.#role = {
                ROLE: 'STUDENT',
                USER_ID: user_id,
                ROLE_ID: student_id,
                ROLE_ATTRIBUTE: major,
            };
        } else if (professorSearch.length > 0) {
            const row = professorSearch[0];
            let user_id = row.user_id;
            let professor_id = row.professor_id;
            let department = row.department;

            this.#role = {
                ROLE: 'PROFESSOR',
                USER_ID: user_id,
                ROLE_ID: professor_id,
                ROLE_ATTRIBUTE: department,
            };
        } else if (adminSearch.length > 0) {
            const row = adminSearch[0];
            let user_id = row.user_id;
            let employee_id = row.employee_id;
            let access_level = row.access_level;

            this.#role = {
                ROLE: 'ADMIN',
                USER_ID: user_id,
                ROLE_ID: employee_id,
                ROLE_ATTRIBUTE: access_level,
            };
        }
    }

    getUserInfo() {
        const user = [
            this.getUserID(),
            this.getName(),
            this.getEmail(),
            this.getPasswordHash(),
            this.getRole(),
            this.getRoleID(),
            this.getRoleAttribute(),
        ];

        return user;
    }

    compareUser(user) {
        return JSON.stringify(this.getUserInfo()) === JSON.stringify(user.getUserInfo());
    }

    getUserID() {
        return this.#user_id;
    }

    getName() {
        return this.name;
    }

    getEmail() {
        return this.#email;
    }

    getPasswordHash() {
        return this.#password_hash;
    }

    getRole() {
        return this.#role.ROLE;
    }

    getRoleID() {
        return this.#role.ROLE_ID;
    }

    getRoleAttribute() {
        return this.#role.ROLE_ATTRIBUTE;
    }

    async refresh() {
        await this.init();
    }
}

export default User;
