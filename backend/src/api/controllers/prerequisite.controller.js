import PrerequisiteService from '../../services/prerequisite.service.js';

export default class PrerequisiteController {
    constructor(prompt, prerequisiteService = new PrerequisiteService()) {
        this.prompt = prompt;
        this.ps = prerequisiteService;
    }

    async viewPrerequisites() {
        const courseCode = await this.prompt.askCourseCode('Enter course code to view prerequisites for (I.E., CMSC100): ');

        const result = await this.ps.getPrerequisitesForCourse(courseCode);

        if (result.prerequisites.length === 0) {
            console.log('\n', result.course.course_code, ' - ', result.course.title, ' has no prerequisites.\n');
            return result;
        }

        console.log('\nPrerequisites for ', result.course.course_code, ' - ', result.course.title, ': ');
        for (const prereq of result.prerequisites) {
            console.log('\n- ', prereq.course_code, ' - ', prereq.title);
        }
        console.log('\n');

        return result;
    }

    async addPrerequisite() {
        const courseCode = await this.prompt.askCourseCode('Enter course code that will receive the prerequisite (I.E., CMSC200): ');

        const prerequisiteCourseCode = await this.prompt.askCourseCode('Enter prerequisite course code to add (I.E., CMSC100): ');

        const result = await this.ps.addPrerequisite(courseCode, prerequisiteCourseCode);

        console.log('\nAdded prerequisite', result.prerequisite.course_code, ' to ', result.course.course_code, 'successfully.\n');

        return result;
    }

    async removePrerequisite() {
        const courseCode = await this.prompt.askCourseCode('Enter course code to remove a prerequisite from (I.E., CMSC200): ');

        const prerequisiteCourseCode = await this.prompt.askCourseCode('Enter prerequisite course code to remove (I.E., CMSC100): ');

        const result = await this.ps.removePrerequisite(courseCode, prerequisiteCourseCode);

        console.log('\nRemoved prerequisite ', result.prerequisite.course_code, ' from ', result.course.course_code, ' successfully.\n');

        return result;
    }

    async validatePrerequisiteChain() {
        const courseCode = await this.prompt.askCourseCode('Enter course code to validate prerequisite chain for (I.E., CMSC300): ');

        const result = await this.ps.validatePrerequisiteChain(courseCode);

        console.log('\n', result.message);

        if (result.valid && result.prerequisiteChain) {
            if (result.prerequisiteChain.length === 0) {
                console.log('No prerequisite chain found.\n');
            } else {
                console.log('Courses in prerequisite chain:');
                for (const course of result.prerequisiteChain) {
                    console.log('- ', course.course_code, ' - ', course.title);
                }
                console.log('\n');
            }
        } else {
            console.log('\n');
        }

        return result;
    }
}
