// Given the current STATE, direct the call from COURSES_MENU to the appropriate service call.

import AuthService from '../services/authService.js';

class AuthController {
    rl;
    as;
    constructor(rl) {
        this.rl = rl;
        this.as = new AuthService();
    }

    // Login User
    async loginUser(email, password) {
        const user = await this.as.loginUser(email, password);
        const firstLoginCheck = await this.as.firstLoginCheck(user);
        if (firstLoginCheck === true) {
            console.log('Password must be changed as this is your first time signing in.\n\n\n');
            await this.changePassword(email);
        }
        return user;
    }

    // Password Change
    async changePassword(email) {
        var bool = false;
        var pwd;
        while (bool === false) {
            pwd = await this.rl.question('Please enter a new password: ');
            var pwdVerification = await this.rl.question('Please re-enter the password: ');

            if (pwd === pwdVerification) {
                bool = true;
            } else {
                console.log('Passwords did not match, please try again.');
            }
        }

        await this.as.changePassword(email, pwd);
    }

    // Logout User
    async logoutUser(user) {
        const logout = await this.as.logoutUser(user);
        return logout;
    }

    // Display User Info
    async getUserInfo(user) {
        const userInfo = await this.as.getUserInfo(user);
        return userInfo;
    }

    async updateUserInfo(user) {
        const changeSelection = (
            await this.rl.question(
                'What would you like to change?\n1. Name\n2. Email\n3. Password\n\n\nEnter all numbers you wish to change: '
            )
        ).trim();

        let bool = false;
        let name = user.getName();
        let email = user.getEmail();
        for (let char of changeSelection) {
            if (char == '1') {
                name = (await this.rl.question('Please enter the Course Title: ')).trim();
                bool = true;
            } else if (char == '2') {
                email = (await this.rl.question('Please enter the Course Description: ')).trim();
                bool = true;
            }

            if (bool === true) {
                // Update information
                this.as.updateUserInfo(user, name, email);
            }

            if (char == '3') {
                this.changePassword(email);
            }

            bool = false;
        }

        user.refresh();
        return user;
    }
}

export default AuthController;
