import * as db from '../db/connection.js';
import * as Errors from '../errors/index.js';
import User from '../domain/user.js';

class AdminService {
    constructor() {}

    // Add New User
    async addUser(name, email, password) {
        const existing = await db.queryAdm('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            throw new Errors.DuplicateEntryError('User with this email already exists.');
        }

        await db.queryAdm('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, password]);
    }

    // Remove User
    async removeUser(user_id) {
        const existing = await db.queryAdm('SELECT user_id FROM users WHERE user_id = ?', [user_id]);

        if (existing.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        await db.queryAdm('DELETE FROM users WHERE user_id = ?', [user_id]);
    }

    // Set User Type
    async setUserRole(user_id, userType) {
        const normalizedUserType = String(userType).toLowerCase();
        const user = await this.getUserById(user_id);

        if (normalizedUserType === 'student') {
            const exists = await db.queryAdm('SELECT * FROM students WHERE user_id = ?', [user.user_id]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a student.');
            }

            await db.queryAdm("INSERT INTO students (user_id, major) VALUES (?, 'Computer Science')", [user.user_id]);
        } else if (normalizedUserType === 'professor') {
            const exists = await db.queryAdm('SELECT * FROM professors WHERE user_id = ?', [user.user_id]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a professor.');
            }

            await db.queryAdm("INSERT INTO professors (user_id, department) VALUES (?, 'Engineering')", [user.user_id]);
        } else {
            throw new Errors.ValidationError('Invalid user type. Must be "student" or "professor".');
        }
    }

    // Get All Users
    async getAllUsers() {
        const users = await db.queryAdm('SELECT user_id, name, email FROM users', []);

        return users;
    }

    // Get User by ID
    async getUserById(user_id) {
        const users = await db.queryAdm('SELECT user_id, name, email FROM users WHERE user_id = ?', [user_id]);

        if (users.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        return users[0];
    }

    // Get User by Email
    async getUserByEmail(email) {
        const user = new User();
        await user.initByEmail(email);

        return user.getSafeUserInfo();
    }
}

export default AdminService;
