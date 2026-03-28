import { spawn } from 'node:child_process';
import process from 'node:process';

const child = spawn('node', ['./backend/src/app.js']);
child.stdout.setEncoding('utf-8');

// TEST DATA
const TEST_USER_EMAIL = `test_${Date.now()}@gmail.com`;

const ADMIN_EMAIL = 'verst_max1@gmail.com';
const ADMIN_PASSWORD = 'AppleR039!';

const PROFESSOR_EMAIL = 'wolff_toto00@gmail.com';

const TEST_PREREQ_COURSE = 'CMSC105';
const TEST_PREREQ_REQUIRED_COURSE = 'CMSC100';

// STATE + BUFFER
let buffer = '';
let state = 'LOGIN_EMAIL';

// HELPERS
function write(input) {
    console.log(`[INPUT] ${input}`);
    child.stdin.write(input + '\n');
}

function has(text) {
    return buffer.toLowerCase().includes(text.toLowerCase());
}

function hasAll(...texts) {
    return texts.every((text) => has(text));
}

// STATE MACHINE ENGINE
function advance() {
    let progressed = true;

    while (progressed) {
        progressed = false;

        switch (state) {
            // LOGIN
            case 'LOGIN_EMAIL':
                if (has('enter your email')) {
                    write(ADMIN_EMAIL);
                    state = 'LOGIN_PASSWORD';
                    progressed = true;
                }
                break;

            case 'LOGIN_PASSWORD':
                if (has('enter your password')) {
                    write(ADMIN_PASSWORD);
                    state = 'MAIN_MENU';
                    progressed = true;
                }
                break;

            // MAIN → USERS
            case 'MAIN_MENU':
                if (hasAll('main menu', '1. courses', '7. exit', 'select an option')) {
                    write('2');
                    buffer = '';
                    state = 'USERS_MENU';
                    progressed = true;
                }
                break;

            // USERS → ADD
            case 'USERS_MENU':
                if (hasAll('users menu', '1. get current user info', '8. exit', 'select an option')) {
                    write('3');
                    buffer = '';
                    state = 'ADD_USER_NAME';
                    progressed = true;
                }
                break;

            case 'ADD_USER_NAME':
                if (has('enter user name')) {
                    write('Test User');
                    buffer = '';
                    state = 'ADD_USER_EMAIL';
                    progressed = true;
                }
                break;

            case 'ADD_USER_EMAIL':
                if (has('enter user email')) {
                    write(TEST_USER_EMAIL);
                    buffer = '';
                    state = 'AFTER_ADD_USER';
                    progressed = true;
                }
                break;

            case 'AFTER_ADD_USER':
                if (has('user created successfully') || has('already exists')) {
                    state = 'REMOVE_USER_SELECT';
                    progressed = true;
                }
                break;

            // REMOVE USER
            case 'REMOVE_USER_SELECT':
                if (hasAll('users menu', '1. get current user info', '8. exit', 'select an option')) {
                    write('4');
                    buffer = '';
                    state = 'REMOVE_USER_EMAIL';
                    progressed = true;
                }
                break;

            case 'REMOVE_USER_EMAIL':
                if (has('enter email')) {
                    write(TEST_USER_EMAIL);
                    buffer = '';
                    state = 'BACK_TO_MAIN';
                    progressed = true;
                }
                break;

            // BACK → MAIN → SECTIONS
            case 'BACK_TO_MAIN':
                if (hasAll('users menu', '1. get current user info', '8. exit', 'select an option')) {
                    write('6');
                    buffer = '';
                    state = 'MAIN_TO_SECTIONS';
                    progressed = true;
                }
                break;

            case 'MAIN_TO_SECTIONS':
                if (hasAll('main menu', '1. courses', '7. exit', 'select an option')) {
                    write('4');
                    buffer = '';
                    state = 'SECTIONS_MENU';
                    progressed = true;
                }
                break;

            // SECTIONS → ADD
            case 'SECTIONS_MENU':
                if (hasAll('sections menu', '1. get section info', '9. exit', 'select an option')) {
                    write('4');
                    buffer = '';
                    state = 'SECTION_COURSE';
                    progressed = true;
                }
                break;

            case 'SECTION_COURSE':
                if (has('course code')) {
                    write('CMSC100');
                    buffer = '';
                    state = 'SECTION_TERM';
                    progressed = true;
                }
                break;

            case 'SECTION_TERM':
                if (has('semester term')) {
                    write('Fall');
                    buffer = '';
                    state = 'SECTION_YEAR';
                    progressed = true;
                }
                break;

            case 'SECTION_YEAR':
                if (has('semester year')) {
                    write('2026');
                    buffer = '';
                    state = 'SECTION_PROF';
                    progressed = true;
                }
                break;

            case 'SECTION_PROF':
                if (has('professor email')) {
                    write(PROFESSOR_EMAIL);
                    buffer = '';
                    state = 'SECTION_CAP';
                    progressed = true;
                }
                break;

            case 'SECTION_CAP':
                if (has('capacity')) {
                    write('30');
                    buffer = '';
                    state = 'SECTION_DAYS';
                    progressed = true;
                }
                break;

            case 'SECTION_DAYS':
                if (has('meeting days')) {
                    write('MWF');
                    buffer = '';
                    state = 'SECTION_START';
                    progressed = true;
                }
                break;

            case 'SECTION_START':
                if (has('start time')) {
                    write('09:00:00');
                    buffer = '';
                    state = 'SECTION_END';
                    progressed = true;
                }
                break;

            case 'SECTION_END':
                if (has('end time')) {
                    write('10:00:00');
                    buffer = '';
                    state = 'SECTION_DONE';
                    progressed = true;
                }
                break;

            case 'SECTION_DONE':
                if (hasAll('section added successfully', 'sections menu', '1. get section info', '9. exit', 'select an option')) {
                    write('7');
                    buffer = '';
                    state = 'MAIN_TO_PREREQUISITES';
                    progressed = true;
                }
                break;

            // PREREQUISITES
            case 'MAIN_TO_PREREQUISITES':
                if (hasAll('main menu', '1. courses', '7. exit', 'select an option')) {
                    write('5');
                    buffer = '';
                    state = 'PREREQUISITES_MENU_ADD';
                    progressed = true;
                }
                break;

            case 'PREREQUISITES_MENU_ADD':
                if (hasAll('prerequisites menu', '1. view prerequisites for a course', '7. exit', 'select an option')) {
                    write('2');
                    buffer = '';
                    state = 'PREREQ_ADD_COURSE';
                    progressed = true;
                }
                break;

            case 'PREREQ_ADD_COURSE':
                if (has('receive the prerequisite')) {
                    write(TEST_PREREQ_COURSE);
                    buffer = '';
                    state = 'PREREQ_ADD_REQUIRED';
                    progressed = true;
                }
                break;

            case 'PREREQ_ADD_REQUIRED':
                if (has('prerequisite course code to add')) {
                    write(TEST_PREREQ_REQUIRED_COURSE);
                    buffer = '';
                    state = 'PREREQ_AFTER_ADD';
                    progressed = true;
                }
                break;

            case 'PREREQ_AFTER_ADD':
                if (hasAll('prerequisites menu', '1. view prerequisites for a course', '7. exit', 'select an option') && (has('added prerequisite') || has('already exists'))) {
                    write('1');
                    buffer = '';
                    state = 'PREREQ_VIEW_COURSE';
                    progressed = true;
                }
                break;

            case 'PREREQ_VIEW_COURSE':
                if (has('view prerequisites for')) {
                    write(TEST_PREREQ_COURSE);
                    buffer = '';
                    state = 'PREREQ_AFTER_VIEW';
                    progressed = true;
                }
                break;

            case 'PREREQ_AFTER_VIEW':
                if (hasAll('prerequisites menu', '1. view prerequisites for a course', '7. exit', 'select an option')) {
                    write('4');
                    buffer = '';
                    state = 'PREREQ_VALIDATE_COURSE';
                    progressed = true;
                }
                break;

            case 'PREREQ_VALIDATE_COURSE':
                if (has('validate prerequisite chain')) {
                    write(TEST_PREREQ_COURSE);
                    buffer = '';
                    state = 'PREREQ_AFTER_VALIDATE';
                    progressed = true;
                }
                break;

            case 'PREREQ_AFTER_VALIDATE':
                if (hasAll('prerequisites menu', '1. view prerequisites for a course', '7. exit', 'select an option')) {
                    write('3');
                    buffer = '';
                    state = 'PREREQ_REMOVE_COURSE';
                    progressed = true;
                }
                break;

            case 'PREREQ_REMOVE_COURSE':
                if (has('remove a prerequisite from')) {
                    write(TEST_PREREQ_COURSE);
                    buffer = '';
                    state = 'PREREQ_REMOVE_REQUIRED';
                    progressed = true;
                }
                break;

            case 'PREREQ_REMOVE_REQUIRED':
                if (has('prerequisite course code to remove')) {
                    write(TEST_PREREQ_REQUIRED_COURSE);
                    buffer = '';
                    state = 'PREREQ_AFTER_REMOVE';
                    progressed = true;
                }
                break;

            case 'PREREQ_AFTER_REMOVE':
                if (hasAll('prerequisites menu', '1. view prerequisites for a course', '7. exit', 'select an option')) {
                    write('5');
                    buffer = '';
                    state = 'MAIN_TO_ENROLLMENT';
                    progressed = true;
                }
                break;

            // ENROLLMENT
            case 'MAIN_TO_ENROLLMENT':
                if (hasAll('main menu', '1. courses', '7. exit', 'select an option')) {
                    write('3');
                    buffer = '';
                    state = 'ENROLL_MENU';
                    progressed = true;
                }
                break;

            case 'ENROLL_MENU':
                if (hasAll('enrollment menu', '1. enroll in a section', '7. exit', 'select an option')) {
                    write('1');
                    buffer = '';
                    state = 'ENROLL_SECTION';
                    progressed = true;
                }
                break;

            case 'ENROLL_SECTION':
                if (has('section id')) {
                    write('1');
                    buffer = '';
                    state = 'VIEW_ENROLLMENTS';
                    progressed = true;
                }
                break;

            case 'VIEW_ENROLLMENTS':
                if (hasAll('enrollment menu', '1. enroll in a section', '7. exit', 'select an option')) {
                    write('3');
                    buffer = '';
                    state = 'DROP_ENROLL';
                    progressed = true;
                }
                break;

            case 'DROP_ENROLL':
                if (hasAll('enrollment menu', '1. enroll in a section', '7. exit', 'select an option')) {
                    write('2');
                    buffer = '';
                    state = 'DROP_SECTION';
                    progressed = true;
                }
                break;

            case 'DROP_SECTION':
                if (has('section id')) {
                    write('1');
                    buffer = '';
                    state = 'EXIT';
                    progressed = true;
                }
                break;

            // EXIT
            case 'EXIT':
                if (hasAll('enrollment menu', '1. enroll in a section', '7. exit', 'select an option')) {
                    write('5');
                    buffer = '';
                    state = 'FINAL_EXIT';
                    progressed = true;
                }
                break;

            case 'FINAL_EXIT':
                if (hasAll('main menu', '1. courses', '7. exit', 'select an option')) {
                    write('7');
                    state = 'DONE';
                    progressed = false;
                }
                break;
        }
    }
}

// STREAM HANDLER
child.stdout.on('data', (data) => {
    process.stdout.write(data);
    buffer += data;

    advance();
});

child.stderr.on('data', (data) => {
    process.stderr.write(data);
});
