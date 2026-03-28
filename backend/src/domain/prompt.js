// Readline prompting helper function to make input normalization and validation easier and centralized, making scalability easier.
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as Errors from '../errors/index.js';

class Prompt {
    constructor() {
        this.rl = readline.createInterface({ input, output });
    }
    // Where readline is used in app.js, refactor the code to utilize the correct methods under Prompt instead.
    async askText(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userText = await this.rl.question(questionString);
                let processedInput = await this.normalization(userText, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Text input invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askRequiredText(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userText = await this.rl.question(questionString);
                let processedInput = await this.normalization(userText, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }

                // NEEDS VALIDATION METHOD TO CHECK FOR BLANK TEXT GENERALLY

                if (processedInput === '') throw new Errors.ValidationError();
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Required text cannot be empty. Please try again!\n\n\n', err);
            }
        }
    }

    async askInt(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userInt = await this.rl.question(questionString);
                let processedInput = await this.normalization(userInt, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }
                await this.validation(processedInput, 'INTEGER');
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Integer type invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askOptionalText(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: true };
        let result = false;
        while (result === false) {
            try {
                let userText = await this.rl.question(questionString);
                let processedInput = await this.normalization(userText, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Text input invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askCourseCode(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userCourseCode = await this.rl.question(questionString);
                let processedInput = await this.normalization(userCourseCode, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }

                await this.validation(processedInput, 'COURSE_CODE');
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Course code type invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askEmail(questionString) {
        const options = { trim: true, normalize: true, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userEmail = await this.rl.question(questionString);
                let processedInput = await this.normalization(userEmail, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }

                await this.validation(processedInput, 'EMAIL');
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Email type invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askMenuSelection(questionString) {
        const options = { trim: true, normalize: true, allowEmpty: false };
        let result = false;
        while (result === false) {
            try {
                let userSelection = await this.rl.question(questionString);
                let processedInput = await this.normalization(userSelection, options);
                if (processedInput === 'exit') {
                    return processedInput;
                }
                await this.validation(processedInput, 'MENU_SELECTION');
                result = true;
                return processedInput;
            } catch (err) {
                console.error('Validation Error: Menu selection invalid. Please try again!\n\n\n', err);
            }
        }
    }

    async askPassword(questionString) {
        const options = { trim: true, normalize: false, allowEmpty: false };
        let result = false;
        while (result === false) {
            let userPassword = await this.rl.question(questionString);
            let processedInput = await this.normalization(userPassword, options);
            if (processedInput === 'exit') {
                return [processedInput, true];
            }
            try {
                // If password is not compliant, return processedInput and false, otherwise return processedInput and true
                await this.validation(processedInput, 'PASSWORD');
                result = true;
                return [processedInput, true];
            } catch {
                return [processedInput, false];
            }
        }
    }

    async normalization(userInput, options) {
        //options = { trim: false, normalize: false, allowEmpty: false };
        if (options.trim === true) {
            userInput = userInput.trim();
        }
        if (options.normalize === true) {
            userInput = userInput.toLowerCase();
        }
        if (options.allowEmpty === true && userInput === '') {
            return null;
        }

        return userInput;
    }

    async validation(processedInput, inputType) {
        const typeArray = {
            EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            COURSE_CODE: /^[A-Z]{4}\d{3}$/,
            INTEGER: /^-?\d+$/,
            MENU_SELECTION: /^\d+$|^[a-z]+$/,
            PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
        };

        switch (inputType.toLowerCase()) {
            case 'email':
                if (typeArray.EMAIL.test(processedInput) === false) {
                    throw new Errors.ValidationError();
                }
                return true;
            case 'course_code':
            case 'course code':
                if (typeArray.COURSE_CODE.test(processedInput) === false) {
                    throw new Errors.ValidationError();
                }
                return true;
            case 'integer':
                if (typeArray.INTEGER.test(processedInput) === false) {
                    throw new Errors.ValidationError();
                }
                return true;
            case 'menu_selection':
            case 'menu selection':
                if (typeArray.MENU_SELECTION.test(processedInput) === false) {
                    throw new Errors.ValidationError();
                }
                return true;
            case 'password':
                if (typeArray.PASSWORD.test(processedInput) === false) {
                    throw new Errors.ValidationError();
                }
                return true;
            default:
                throw new Errors.InvalidSelectionError();
        }
    }
}

export default Prompt;
