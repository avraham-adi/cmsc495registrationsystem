import AdminService from '../../services/admin.service.js';

class AdminController {
    prompt;
    as;

    constructor(prompt) {
        this.prompt = prompt;
        this.as = new AdminService();
    }

    // Add New User
    async addUser() {
        const name = await this.prompt.askRequiredText('Enter user name: ');
        const email = await this.prompt.askEmail('Enter user email: ');
        const password = 'Password';

        await this.as.addUser(name, email, password);

        console.log('\nUser created successfully.\n');
    }

    // Remove User
    async removeUser() {
        const email = await this.prompt.askEmail('Enter email of user to remove: ');

        await this.as.removeUser(email);

        console.log('\nUser removed successfully.\n');
    }

    // Set User Type (Student / Professor)
    async setUserType() {
        const email = await this.prompt.askEmail('Enter user email: ');
        const userType = await this.prompt.askText('Enter role (student/professor): ');

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
        const email = await this.prompt.askEmail('Enter email: ');

        const user = await this.as.getUserByEmail(email);

        console.log('\nUser:\n', user, '\n');
    }
}

export default AdminController;
