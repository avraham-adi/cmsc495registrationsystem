import * as db from '../db/db.js';
import * as Errors from '../errors/index.js';

class AdminService {
    constructor() {}

    // Add New User
    async addUser(name, email, password) {
        const existing = await db.queryAdm('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            throw new Errors.DuplicateEntryError('User with this email already exists.');
        }

        await db.queryAdm('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [
            name,
            email,
            password,
        ]);
    }

    // Remove User
    async removeUser(email) {
        const existing = await db.queryAdm('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        await db.queryAdm('DELETE FROM users WHERE email = ?', [email]);
    }

    // Set User Type
    async setUserType(email, userType) {
        const user = this.getUserByEmail(email);
        if (userType === 'student') {
            const exists = await db.queryAdm('SELECT * FROM students WHERE user_id = ?', [
                user.getUserID(),
            ]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a student.');
            }

            await db.queryAdm(
                "INSERT INTO students (user_id, major) VALUES (?, 'Computer Science')",
                [user.getUserID()]
            );
        } else if (userType === 'professor') {
            const exists = await db.queryAdm('SELECT * FROM professors WHERE user_id = ?', [
                user.getUserID(),
            ]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a professor.');
            }

            await db.queryAdm(
                "INSERT INTO professors (user_id, department) VALUES (?, 'Engineering')",
                [user.getUserID()]
            );
        } else {
            throw new Errors.ValidationError(
                'Invalid user type. Must be "student" or "professor".'
            );
        }
    }

    // Get All Users
    async getAllUsers() {
        const users = await db.queryAdm('SELECT user_id, name, email FROM users', []);

        return users;
    }

    // Get User by Email
    async getUserByEmail(email) {
        const users = await db.queryAdm('SELECT user_id, name, email FROM users WHERE email = ?', [
            email,
        ]);

        if (users.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        return users[0];
    }
}

export default AdminService;
