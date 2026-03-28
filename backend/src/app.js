/*
 * During development of the backend, app.js will be a simple CLI utility
 * This allows for rapid testing and development of the backend
 * And can be adapted to the frontend integration later on.
 */

import CourseService from './services/course.service.js';
import CourseController from './cli/controllers/course.controller.js';
import AuthController from './cli/controllers/auth.controller.js';
import AuthService from './services/auth.service.js';
import AdminController from './cli/controllers/admin.controller.js';
import SectionController from './cli/controllers/section.controller.js';
import EnrollmentController from './cli/controllers/enrollment.controller.js';
import PrerequisiteController from './cli/controllers/prerequisite.controller.js';
import Prompt from './domain/prompt.js';
import { close } from './db/connection.js';
//import * as Errors from './errors/index.js';
const prompt = new Prompt();

function printMenu(title, options, promptString = 'Select an option: ') {
    console.log(`\n**** ${title} ****`);

    for (const option of options) {
        console.log(option);
    }

    console.log('\n');
    return prompt.askMenuSelection(promptString);
}

function printMessage(message) {
    console.log(`\n${message}\n`);
}

async function main() {
    try {
        const cs = new CourseService();
        await cs.init();

        const cc = new CourseController(prompt, cs);
        const as = new AuthService();
        const ac = new AuthController(prompt);
        const adm = new AdminController(prompt);
        const sc = new SectionController(prompt);
        const ec = new EnrollmentController(prompt);
        const pc = new PrerequisiteController(prompt);

        const context = { prompt, cc, cs, ac, as, sc, ec, adm, pc, currentUser: null };

        let state = 'LOGIN';

        while (state != 'EXIT') {
            switch (state) {
                case 'LOGIN':
                    state = await loginMenu(context);
                    break;
                case 'MAIN_MENU':
                    state = await mainMenu();
                    break;
                case 'COURSES_MENU':
                    state = await coursesMenu(context);
                    break;
                case 'USERS_MENU':
                    state = await usersMenu(context);
                    break;
                case 'ENROLLMENT_MENU':
                    state = await enrollmentMenu(context);
                    break;
                case 'SECTIONS_MENU':
                    state = await sectionsMenu(context);
                    break;
                case 'PREREQUISITES_MENU':
                    state = await prerequisitesMenu(context);
                    break;
                case 'LOGOUT':
                    context.currentUser = null;
                    printMessage('Logged out successfully.');
                    state = 'LOGIN';
                    break;
                default:
                    printMessage('Unknown state encountered. Exiting now...');
                    state = 'EXIT';
                    break;
            }
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        if (prompt && prompt.rl) {
            prompt.rl.close();
        }
        close();
    }
}

// Login menu
async function loginMenu(context) {
    console.log('\n**** LOGIN ****');
    console.log('Type "exit" at any prompt to quit.\n');

    const userEmail = await context.prompt.askEmail('Please enter your email address: ');
    if (userEmail.toLowerCase() == 'exit') {
        return 'EXIT';
    }

    const userPassword = await context.prompt.askPassword('Please enter your password: ');
    if (userPassword[0].toLowerCase() == 'exit') {
        return 'EXIT';
    }

    try {
        const user = await context.ac.loginUser(userEmail, userPassword);
        context.currentUser = user;
        printMessage('Login successful.');
        return 'MAIN_MENU';
    } catch (err) {
        printMessage(err.message);
        return 'LOGIN';
    }
}

async function mainMenu() {
    const selection = (await printMenu('MAIN MENU', ['1. Courses', '2. Users', '3. Enrollment', '4. Sections', '5. Prerequisites', '6. Logout', '7. Exit'])).trim();

    switch (selection.toLowerCase()) {
        case '1':
        case 'courses':
            return 'COURSES_MENU';

        case '2':
        case 'users':
            return 'USERS_MENU';

        case '3':
        case 'enrollment':
            return 'ENROLLMENT_MENU';

        case '4':
        case 'sections':
            return 'SECTIONS_MENU';

        case '5':
        case 'prerequisites':
            return 'PREREQUISITES_MENU';

        case '6':
        case 'logout':
            return 'LOGOUT';

        case '7':
        case 'exit':
            return 'EXIT';

        default:
            printMessage('Invalid selection.');
            return 'MAIN_MENU';
    }
}

async function coursesMenu(context) {
    const selection = (await printMenu('COURSES MENU', ['Enter the number that corresponds to your choice.', '1. Get Course Info', '2. Add New Course', '3. Update Existing Course', '4. Remove an Existing Course', '5. Return to Main Menu', '6. Logout', '7. Exit'])).trim();

    switch (selection.toLowerCase()) {
        case '1':
            await context.cc.getCourseInfo();
            return 'COURSES_MENU';

        case '2':
            await context.cc.addNewCourse();
            return 'COURSES_MENU';

        case '3':
            await context.cc.updateCourse();
            return 'COURSES_MENU';

        case '4':
            await context.cc.removeCourse();
            return 'COURSES_MENU';

        case '5':
        case 'back':
        case 'main':
            return 'MAIN_MENU';

        case '6':
        case 'logout':
            return 'LOGOUT';

        case '7':
        case 'exit':
            return 'EXIT';

        default:
            printMessage('Invalid selection.');
            return 'COURSES_MENU';
    }
}

async function usersMenu(context) {
    const selection = (await printMenu('USERS MENU', ['Enter the number that corresponds to your choice.', '1. Get Current User Info', '2. Update User Info', '3. ADMIN - Add New User', '4. ADMIN - Remove a User', '5. ADMIN - Set User Role', '6. Return to Main Menu', '7. Logout', '8. Exit'])).trim();

    switch (selection.toLowerCase()) {
        case '1':
            console.log(await context.ac.getUserInfo(context.currentUser));
            return 'USERS_MENU';

        case '2':
            context.currentUser = await context.ac.updateUserInfo(context.currentUser);
            return 'USERS_MENU';

        case '3':
            await context.adm.addUser();
            return 'USERS_MENU';

        case '4':
            await context.adm.removeUser();
            return 'USERS_MENU';

        case '5':
            await context.adm.setUserType();
            return 'USERS_MENU';

        case '6':
        case 'back':
        case 'main':
            return 'MAIN_MENU';

        case '7':
        case 'logout':
            return 'LOGOUT';

        case '8':
        case 'exit':
            return 'EXIT';

        default:
            printMessage('Invalid selection.');
            return 'USERS_MENU';
    }
}

async function enrollmentMenu(context) {
    const selection = (await printMenu('ENROLLMENT MENU', ['Enter the number that corresponds to your choice.', '1. Enroll in a Section', '2. Drop Enrollment', '3. View My Enrollments', '4. View Section Enrollment Roster', '5. Return to Main Menu', '6. Logout', '7. Exit'])).trim();

    try {
        switch (selection.toLowerCase()) {
            case '1': {
                await context.ec.enrollInSection(context.currentUser);
                return 'ENROLLMENT_MENU';
            }

            case '2': {
                await context.ec.dropEnrollment(context.currentUser);
                return 'ENROLLMENT_MENU';
            }

            case '3': {
                await context.ec.viewMyEnrollments(context.currentUser);
                return 'ENROLLMENT_MENU';
            }

            case '4': {
                await context.ec.viewSectionRoster();
                return 'ENROLLMENT_MENU';
            }

            case '5':
            case 'back':
            case 'main':
                return 'MAIN_MENU';

            case '6':
            case 'logout':
                return 'LOGOUT';

            case '7':
            case 'exit':
                return 'EXIT';

            default:
                printMessage('Invalid selection.');
                return 'ENROLLMENT_MENU';
        }
    } catch (err) {
        printMessage(`Error: ${err.message}`);
        return 'ENROLLMENT_MENU';
    }
}

async function sectionsMenu(context) {
    const selection = (await printMenu('SECTIONS MENU', ['Enter the number that corresponds to your choice.', '1. Get Section Info', '2. View Sections by Course', '3. View Sections by Semester', '4. Add New Section', '5. Update Existing Section', '6. Remove an Existing Section', '7. Return to Main Menu', '8. Logout', '9. Exit'])).trim();

    try {
        switch (selection.toLowerCase()) {
            case '1': {
                const section = await context.sc.getSectionInfo();
                console.log('\nSection Info:\n', section, '\n');
                return 'SECTIONS_MENU';
            }

            case '2': {
                const sections = await context.sc.viewSectionsByCourse();
                console.log('\nSections:\n', sections, '\n');
                return 'SECTIONS_MENU';
            }

            case '3': {
                const sections = await context.sc.viewSectionsBySemester();
                console.log('\nSections:\n', sections, '\n');
                return 'SECTIONS_MENU';
            }

            case '4': {
                await context.sc.addSection();
                printMessage('Section added successfully.');
                return 'SECTIONS_MENU';
            }

            case '5': {
                await context.sc.updateSection();
                return 'SECTIONS_MENU';
            }

            case '6': {
                await context.sc.removeSection();
                return 'SECTIONS_MENU';
            }

            case '7':
            case 'back':
            case 'main':
                return 'MAIN_MENU';

            case '8':
            case 'logout':
                return 'LOGOUT';

            case '9':
            case 'exit':
                return 'EXIT';

            default:
                printMessage('Invalid selection.');
                return 'SECTIONS_MENU';
        }
    } catch (err) {
        printMessage(`Error: ${err.message}`);
        return 'SECTIONS_MENU';
    }
}

async function prerequisitesMenu(context) {
    const selection = (await printMenu('PREREQUISITES MENU', ['Enter the number that corresponds to your choice.', '1. View Prerequisites for a Course', '2. Add a Prerequisite', '3. Remove a Prerequisite', '4. Validate Prerequisite Chain', '5. Return to Main Menu', '6. Logout', '7. Exit'])).trim();

    try {
        switch (selection.toLowerCase()) {
            case '1': {
                await context.pc.viewPrerequisites();
                return 'PREREQUISITES_MENU';
            }

            case '2': {
                await context.pc.addPrerequisite();
                return 'PREREQUISITES_MENU';
            }

            case '3': {
                await context.pc.removePrerequisite();
                return 'PREREQUISITES_MENU';
            }

            case '4': {
                await context.pc.validatePrerequisiteChain();
                return 'PREREQUISITES_MENU';
            }

            case '5':
            case 'back':
            case 'main':
                return 'MAIN_MENU';

            case '6':
            case 'logout':
                return 'LOGOUT';

            case '7':
            case 'exit':
                return 'EXIT';

            default:
                printMessage('Invalid selection.');
                return 'PREREQUISITES_MENU';
        }
    } catch (err) {
        printMessage(`Error: ${err.message}`);
        return 'PREREQUISITES_MENU';
    }
}

main();