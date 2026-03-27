// Remove once all features are implemented.
/* eslint-disable no-unused-vars */

/*
 * During development of the backend, app.js will be a simple CLI utility
 * This allows for rapid testing and development of the backend
 * And can be adapted to the frontend integration later on.
 */

// Command Menu
/**
 * Course:
 * Get Course Info -
 * getCourseTitle(course_code)
 * getCourseID(course_code)
 * getCourseDescription(course_code)
 * getCourseCredits(course_code)
 *
 * Add New Course -
 *
 *
 * Edit Existing Course -
 *
 *
 * Delete Course -
 *
 *
 * Section:
 *
 */

import CourseService from './services/courseService.js';
import CourseController from './controllers/courseController.js';
import AuthController from './controllers/authController.js';
import AuthService from './services/authService.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output, exit } from 'node:process';
import AdminController from './controllers/adminController.js';
import SectionController from './controllers/sectionController.js';
import EnrollmentController from './controllers/enrollmentController.js';
//import * as Errors from './errors/index.js';

const rl = readline.createInterface({ input, output });

async function main() {
    try {
        const cs = new CourseService();
        await cs.init();

        const cc = new CourseController(rl, cs);
        const as = new AuthService();
        const ac = new AuthController(rl);
        const adm = new AdminController(rl);
        const sc = new SectionController(rl);
        const ec = new EnrollmentController(rl);

        const context = { rl, cc, cs, ac, as, sc, ec, adm, currentUser: null };

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
                    console.log('\nLogged out successfully.\n');
                    state = 'LOGIN';
                    break;
                default:
                    console.log('\nUnknown state encountered. Exiting now...\n');
                    state = 'EXIT';
                    break;
            }
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        rl.close();
        exit();
    }
}

// Login menu
async function loginMenu(context) {
    console.log('\n **** LOGIN ****');
    console.log('Type "exit" at any prompt to quit.\n');

    const userEmail = (await rl.question('Please enter your email address: ')).trim();
    if (userEmail.toLowerCase() == 'exit') {
        return 'EXIT';
    }

    const userPassword = (await rl.question('Please enter your password: ')).trim();
    if (userPassword.toLowerCase() == 'exit') {
        return 'EXIT';
    }

    try {
        const user = await context.ac.loginUser(userEmail, userPassword);
        context.currentUser = user;
        console.log('\nLogin successful.\n');
        return 'MAIN_MENU';
    } catch (err) {
        console.log('\n', err.message, '\n');
        return 'LOGIN';
    }
}

// Main menu
async function mainMenu() {
    console.log('**** MAIN MENU ****');
    console.log('1. Courses');
    console.log('2. Users');
    console.log('3. Enrollment');
    console.log('4. Sections');
    console.log('5. Prerequisites');
    console.log('6. Logout');
    console.log('7. Exit\n');

    const selection = (await rl.question('Select an option: ')).trim();

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
            console.log('\nInvalid selection.\n');
            return 'MAIN_MENU';
    }
}

// course menu
async function coursesMenu(context) {
    console.log('**** COURSES MENU ****');
    console.log('Enter the number that corresponds to your choice.');
    console.log('1. Get Course Info');
    console.log('2. Add New Course');
    console.log('3. Update Existing Course');
    console.log('4. Remove an Existing Course');
    console.log('5. Return to Main Menu');
    console.log('6. Logout');
    console.log('7. Exit');

    const selection = (await rl.question('Select an option: ')).trim();

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
            console.log('\nInvalid selection.\n');
            return 'COURSES_MENU';
    }
}

// user menu
async function usersMenu(context) {
    console.log('**** USERS MENU ****');
    console.log('Enter the number that corresponds to your choice.');
    console.log('1. Get Current User Info');
    console.log('2. Update User Info');
    console.log('3. ADMIN - Add New User');
    console.log('4. ADMIN - Remove a User');
    console.log('5. ADMIN - Set User Role');
    console.log('6. Return to Main Menu');
    console.log('7. Logout');
    console.log('8. Exit');

    const selection = (await rl.question('Select an option: ')).trim();

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
            console.log('\nInvalid selection.\n');
            return 'USERS_MENU';
    }
}

// Enrollment Menu
async function enrollmentMenu(context) {
    console.log('**** ENROLLMENT MENU ****');
    console.log('Enter the number that corresponds to your choice.');
    console.log('1. Enroll in a Section');
    console.log('2. Drop Enrollment');
    console.log('3. View My Enrollments');
    console.log('4. View Section Enrollment Roster');
    console.log('5. Return to Main Menu');
    console.log('6. Logout');
    console.log('7. Exit');

    const selection = (await rl.question('Select an option: ')).trim();

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
                console.log('\nInvalid selection.\n');
                return 'ENROLLMENT_MENU';
        }
    } catch (err) {
        console.error('\nError:', err.message, '\n');
        return 'ENROLLMENT_MENU';
    }
}

// Sections menu
async function sectionsMenu(context) {
    console.log('**** SECTIONS MENU ****');
    console.log('Enter the number that corresponds to your choice.');
    console.log('1. Get Section Info');
    console.log('2. View Sections by Course');
    console.log('3. View Sections by Semester');
    console.log('4. Add New Section');
    console.log('5. Update Existing Section');
    console.log('6. Remove an Existing Section');
    console.log('7. Return to Main Menu');
    console.log('8. Logout');
    console.log('9. Exit');

    const selection = (await rl.question('Select an option: ')).trim();

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
                console.log('\nSection added successfully.\n');
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
                console.log('\nInvalid selection.\n');
                return 'SECTIONS_MENU';
        }
    } catch (err) {
        console.error('\nError:', err.message, '\n');
        return 'SECTIONS_MENU';
    }
}

// Prerequisites menu
async function prerequisitesMenu(context) {
    console.log('**** PREREQUISITES MENU ****');
    console.log('Enter the number that corresponds to your choice.');
    console.log('1. View Prerequisites for a Course');
    console.log('2. Add a Prerequisite');
    console.log('3. Remove a Prerequisite');
    console.log('4. Validate Prerequisite Chain');
    console.log('5. Return to Main Menu');
    console.log('6. Logout');
    console.log('7. Exit');

    const selection = (await rl.question('Select an option: ')).trim();

    switch (selection.toLowerCase()) {
        case '1':
            console.log('\nView Prerequisites for a Course is not implemented yet.\n');
            return 'PREREQUISITES_MENU';

        case '2':
            console.log('\nAdd a Prerequisite is not implemented yet.\n');
            return 'PREREQUISITES_MENU';

        case '3':
            console.log('\nRemove a Prerequisite is not implemented yet.\n');
            return 'PREREQUISITES_MENU';

        case '4':
            console.log('\nValidate Prerequisite Chain is not implemented yet.\n');
            return 'PREREQUISITES_MENU';

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
            console.log('\nInvalid selection.\n');
            return 'PREREQUISITES_MENU';
    }
}

main();
