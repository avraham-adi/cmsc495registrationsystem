/**
 * authService
 *
 * Responsibilities:
 * Handle user calls to the database for authentication and validation.
 * Determine whether a user is still on their first login.
 * Enforce password policy during credential rotation.
 */

import User from '../domain/user.js';
import * as Errors from '../errors/index.js';
import * as bcrypt from 'bcrypt';
import * as db from '../db/connection.js';

const saltRounds = 10;

class AuthService {
    constructor() {}

    // Initialize User
    async loginUser(email, password) {
        const user = new User();
        await user.initByEmail(email);

        const isFirstLogin = this.isFirstLoginUser(user);

        if (isFirstLogin) {
            if (password !== 'Password') {
                throw new Errors.AuthenticationError('Invalid email and/or password.');
            }

            return {
                user,
                firstLogin: true,
            };
        }

        const passwordCheck = await bcrypt.compare(password, user.getPasswordHash());

        if (passwordCheck === false) {
            throw new Errors.AuthenticationError('Invalid email and/or password.');
        }

        return {
            user,
            firstLogin: false,
        };
    }

    // Check for First Time Login
    isFirstLoginUser(user) {
        return user.getPasswordHash() === 'Password';
    }

    // Change Password enforces Password Policy, Hashing, and persistence
    async changePassword(authUser, password) {
        const userID = authUser?.id;

        if (!userID) {
            throw new Errors.AuthenticationError('Authentication required.');
        }

        const user = new User();
        await user.initByID(userID);

        this.validatePasswordPolicy(password, user);

        const hash = await bcrypt.hash(password, saltRounds);
        await this.setPassword(user.getUserID(), hash);
    }

    validatePasswordPolicy(password, user = null) {
        if (!password || typeof password !== 'string') {
            throw new Errors.ValidationError('Password is required.');
        }

        if (password === 'Password') {
            throw new Errors.ValidationError('Password cannot be the default password.');
        }

        if (password.length < 8) {
            throw new Errors.ValidationError('Password must be at least 8 characters long.');
        }

        if (!/[A-Z]/.test(password)) {
            throw new Errors.ValidationError('Password must contain at least one uppercase letter.');
        }

        if (!/[a-z]/.test(password)) {
            throw new Errors.ValidationError('Password must contain at least one lowercase letter.');
        }

        if (!/[0-9]/.test(password)) {
            throw new Errors.ValidationError('Password must contain at least one number.');
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            throw new Errors.ValidationError('Password must contain at least one special character.');
        }

        if (user) {
            const email = user.getEmail?.()?.toLowerCase() ?? '';
            const localPart = email.split('@')[0] ?? '';

            if (localPart && password.toLowerCase().includes(localPart)) {
                throw new Errors.ValidationError('Password cannot contain the email local-part.');
            }
        }
    }

    // Set Password Hash
    async setPassword(user_id, password) {
        await db.queryAdm('UPDATE users SET password_hash = ? WHERE user_id = ?', [password, user_id]);
    }

    // Set User Type
    async setUserType(user_id, userType) {
        if (userType === 'student') {
            const exists = await db.queryAdm('SELECT * FROM students WHERE user_id = ?', [user_id]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a student.');
            }
            await db.queryAdm("INSERT INTO students (user_id, major) VALUES (?, 'Computer Science')", [user_id]);
        } else if (userType === 'professor') {
            const exists = await db.queryAdm('SELECT * FROM professors WHERE user_id = ?', [user_id]);

            if (exists.length > 0) {
                throw new Errors.DuplicateEntryError('User is already a professor.');
            }
            await db.queryAdm("INSERT INTO professors (user_id, department) VALUES (?, 'Engineering')", [user_id]);
        } else {
            throw new Errors.ValidationError('Invalid user type. Must be "student" or "professor".');
        }

        return null;
    }

    async getUserById(user_id) {
        const result = await db.queryStd('SELECT user_id, name, email FROM users WHERE user_id = ?', [user_id]);

        if (result.length === 0) {
            throw new Errors.NotFoundError('User not found.');
        }

        return result[0];
    }

    async getCurrentUserInfo(authUser) {
        const userID = authUser?.id;

        if (!userID) {
            throw new Errors.AuthenticationError('Authentication required.');
        }

        const user = new User();
        await user.initByID(userID);

        return user.getSafeUserInfo();
    }

    async updateUserInfo(user, name, email) {
        const userID = user.getUserID();
        await db.queryAdm('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, userID]);
    }
}

export default AuthService;
