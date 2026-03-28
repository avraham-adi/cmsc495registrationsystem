// Given the current STATE, direct the call from COURSES_MENU to the appropriate service call.

import AuthService from '../../services/auth.service.js';

class AuthController {
    prompt;
    as;
    constructor(prompt) {
        this.prompt = prompt;
        this.as = new AuthService();
    }

    // Login User
    async loginUser(email, password) {
        // password is passwordText, boolean (compliance)
        const user = await this.as.loginUser(email, password[0]);
        const firstLoginCheck = await this.as.firstLoginCheck(user);
        if (firstLoginCheck === true) {
            console.log('Password must be changed as this is your first time signing in.\n\n\n');
            await this.changePassword(email);
        }
        if (password[1] === false) {
            console.log('Password is not compliant with Password Policy and must be changed.\n\n\n');
            await this.changePassword(email);
        }
        return user;
    }

    // Password Change
    async changePassword(email) {
        var bool = false;
        var pwd;
        while (bool === false) {
            pwd = await this.prompt.askPassword('Please enter a new password: ');
            var pwdVerification = await this.prompt.askPassword('Please re-enter the password: ');

            if (pwd[0] === pwdVerification[0]) {
                bool = true;
            } else {
                console.log('Passwords did not match, please try again.\n\n\n');
            }
            if (pwd[1] === false || pwdVerification[1] === false) {
                console.log('Password is not compliant with Password Policy.\n\n\n');
            }
        }

        await this.as.changePassword(email, pwd[0]);
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
        const changeSelection = (await this.prompt.askMenuSelection('What would you like to change?\n1. Name\n2. Email\n3. Password\n\n\nEnter all numbers you wish to change: ')).trim();

        let bool = false;
        let name = user.getName();
        let email = user.getEmail();
        for (let char of changeSelection) {
            if (char == '1') {
                name = await this.prompt.askRequiredText('Please enter new name: ');
                bool = true;
            } else if (char == '2') {
                email = await this.prompt.askEmail('Please enter new email: ');
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
