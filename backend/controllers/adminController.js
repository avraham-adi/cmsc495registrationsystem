import AdminService from '../services/adminService.js';

class AdminController {
    rl;
    as;

    constructor(rl) {
        this.rl = rl;
        this.as = new AdminService();
    }

    // Add New User
    async addUser() {
        const name = (await this.rl.question('Enter user name: ')).trim();
        const email = (await this.rl.question('Enter user email: ')).trim();
        const password = 'Password';

        await this.as.addUser(name, email, password);

        console.log('\nUser created successfully.\n');
    }

    // Remove User
    async removeUser() {
        const email = (await this.rl.question('Enter email of user to remove: ')).trim();

        await this.as.removeUser(email);

        console.log('\nUser removed successfully.\n');
    }

    // Set User Type (Student / Professor)
    async setUserType() {
        const email = Number((await this.rl.question('Enter user email: ')).trim());
        const userType = (await this.rl.question('Enter role (student/professor): ')).trim();

        await this.as.setUserType(email, userType);

        console.log('\nUser role updated successfully.\n');
    }

    // View All Users
    async getAllUsers() {
        const users = await this.as.getAllUsers();

        console.log('\nUsers:\n', users, '\n');
    }

    // Get User by Email
    async getUserByEmail() {
        const email = (await this.rl.question('Enter email: ')).trim();

        const user = await this.as.getUserByEmail(email);

        console.log('\nUser:\n', user, '\n');
    }
}

export default AdminController;
