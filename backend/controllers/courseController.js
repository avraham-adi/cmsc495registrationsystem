// Given the current STATE, direct the call from COURSES_MENU to the appropriate service call.

//import * as readline from 'node:readline/promises';
//import { stdin as input, stdout as output } from 'node:process';

class CourseController {
    rl;

    constructor(rl, cs) {
        this.rl = rl;
        this.cs = cs;
    }

    // Get Course Info
    async getCourseInfo() {
        const selection = await this.rl.question('Please enter the Course Code: ');
        try {
            console.log(this.cs.getCourseInfo(selection));
        } catch (err) {
            console.error('Invalid course code! Error Code: ', err)
        }
    }

    // Add New Course
    async addNewCourse() {
        const ccr = (await this.rl.question('Please enter the Course Code: ')).trim();
        const cct = (await this.rl.question('Please enter the Course Title: ')).trim();
        const ccd = (await this.rl.question('Please enter the Course Description: ')).trim();
        const ccc = (await this.rl.question('Please enter the Course Credits: ')).trim();
        var courseData = {
            course_code: ccr,
            title: cct,
            description: ccd,
            credits: ccc,
        };

        try {
            await this.cs.addNewCourse(courseData);
            await this.cs.refresh();
            console.log('\n\n\nCourse successfully added!\n\n\n');
        } catch (err) {
            console.error(err);
        }
    }

    // Update Existing Course
    async updateCourse() {
        const selection = (await this.rl.question('Please enter the Course Code: ')).trim();

        const changeSelection = (
            await this.rl.question(
                'What would you like to change?\n1. Course Title\n2. Course Description\n3. Course Credits\n\n\nEnter all numbers you wish to change: '
            )
        ).trim();

        let bool = false;
        let cct = this.cs.getCourseTitle(selection);
        let ccd = this.cs.getCourseDescription(selection);
        let ccc = this.cs.getCourseCredits(selection);
        for (let char of changeSelection) {
            if (char == '1') {
                cct = (await this.rl.question('Please enter the Course Title: ')).trim();
                bool = true;
            } else if (char == '2') {
                ccd = (await this.rl.question('Please enter the Course Description: ')).trim();
                bool = true;
            } else if (char == '3') {
                ccc = (await this.rl.question('Please enter the Course Credits: ')).trim();
                bool = true;
            }

            if (bool === true) {
                // Update information
                await this.cs.updateCourse(selection, cct, ccd, ccc);
            }

            bool = false;
        }
    }

    // Remove an Existing Course
    async removeCourse() {
        const selection = (await this.rl.question('Please enter the Course Code: ')).trim();

        try {
            await this.cs.removeCourse(selection);
            console.log('\n\n\nCourse successfully removed!\n\n\n');
        } catch (err) {
            console.error(err);
        }
    }
}

export default CourseController;
