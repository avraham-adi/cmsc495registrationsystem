/**
 * authService
 *
 * Responsibilities:
 * Handle User calls to the database for authentication and validation
 * Depending on user type, set appropriate restrictions
 * On successful login, load user data into memory
 * On logout, unload user data from memory and ensure database matches.
 */

import User from '../models/user.js';
import * as Errors from '../errors/index.js';
import * as bcrypt from 'bcrypt';
import * as db from '../db/db.js';

const saltRounds = 10;

class AuthService {
    constructor() {}

    // Initialize User
    async loginUser(email, password) {
        const user = new User(email);
        await user.init();
        
        const result = await this.firstLoginCheck(user);
        if (result === true) {
            return user;
        }

        const passwordCheck = await bcrypt.compare(password, user.getPasswordHash());

        if (passwordCheck === false) {
            throw new Errors.AuthenticationError('Invalid email and/or password.');
        }

        return user;
    }

    // Check for First Time Login
    async firstLoginCheck(user) {
        if (user.getPasswordHash() === 'Password') {
            return true;
        } else {
            return false;
        }
    }

    // Change Password enforces Password Policy, Hashing, and persistence
    async changePassword(email, password) {
        const hash = await bcrypt.hash(password, saltRounds);
        await this.setPassword(email, hash);
    }

    // Set Password Hash
    async setPassword(email, password) {
        await db.queryAdm('UPDATE users SET password_hash = ? WHERE email = ?', [password, email]);
    }

    // Set User Type
    async setUserType(user_id, userType) {
        if (userType === 'student') {
            const exists = await db.queryAdm('SELECT * FROM students WHERE user_id = ?', [user_id]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a student.');
            }
            await db.queryAdm(
                "INSERT INTO students (user_id, major) VALUES (?, 'Computer Science')",
                [user_id]
            );
        } else if (userType === 'professor') {
            const exists = await db.queryAdm('SELECT * FROM professors WHERE user_id = ?', [
                user_id,
            ]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a professor.');
            }
            await db.queryAdm(
                "INSERT INTO professors (user_id, department) VALUES (?, 'Engineering')",
                [user_id]
            );
        } else {
            throw new Errors.ValidationError(
                'Invalid user type. Must be "student" or "professor".'
            );
        }

        return null;
    }

    async getUserInfo(user) {
        await user.refresh();
        return user.getUserInfo();
    }

    async updateUserInfo(user, name, email) {
        const userID = user.getUserID();
        await db.queryAdm(
            'UPDATE users SET name = ?, email = ? WHERE user_id = ?',
            [name, email, userID]
        );
    }

    async logoutUser(user) {
        const dbUser = new User(user.getEmail());
        await dbUser.init();

        if (dbUser.compareUser(user) === true) {
            return null;
        } else {
            await db.queryAdm(
                'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE user_id = ?',
                [user.getName(), user.getEmail(), user.getPasswordHash(), user.getUserID()]
            );
            return null;
        }
    }
}

export default AuthService;
