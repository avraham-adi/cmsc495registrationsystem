import SectionService from '../../services/section.service.js';

class SectionController {
    prompt;
    ss;

    constructor(prompt) {
        this.prompt = prompt;
        this.ss = new SectionService();
    }

    async getSectionInfo() {
        const selection = await this.prompt.askInt('Enter the section ID: ');
        return await this.ss.getSectionInfo(selection);
    }

    async viewSectionsByCourse() {
        const course_code = await this.prompt.askCourseCode('Enter the course code: ');
        return await this.ss.getSectionsByCourse(course_code);
    }

    async viewSectionsBySemester() {
        const term = await this.prompt.askRequiredText('Enter the term: ');
        const year = await this.prompt.askInt('Enter the year: ');
        return await this.ss.getSectionsBySemester(term, year);
    }

    async addSection() {
        const course_code = await this.prompt.askCourseCode('Enter course code (I.E., CMSC100): ');
        const term = await this.prompt.askRequiredText('Enter semester term (I.E., Fall, Spring, Summer): ');
        const year = await this.prompt.askInt('Enter semester year (I.E., 2026): ');
        const professor_email = await this.prompt.askEmail('Enter professor email (must already exist in system): ');
        const capacity = await this.prompt.askInt('Enter section capacity (Integer): ');
        const days = await this.prompt.askOptionalText('Enter meeting days (I.E., MWF, TR, or leave blank for async): ');
        const start_time = (await this.prompt.askOptionalText('Enter start time (HH:MM:SS, 24-hour format, or leave blank for async): '));
        const end_time = (await this.prompt.askOptionalText('Enter end time (HH:MM:SS, 24-hour format, or leave blank for async): '));

        await this.ss.addSection(course_code, term, year, professor_email, capacity, days, start_time, end_time);
    }

    async updateSection() {
        const section_id = Number(await this.prompt.askInt('Enter section ID to update: '));

        const selection = (
            await this.prompt.askMenuSelection('What would you like to change?\n' + '1. Professor\n2. Capacity\n3. Days\n4. Start Time\n5. End Time\n\n' + 'Enter all numbers (e.g., 135): ')
        ).trim();

        let updates = {};

        const handlers = {
            1: async () => {
                updates.professor_email = await this.prompt.askEmail('Enter new professor email: ');
            },
            2: async () => {
                updates.capacity = Number(await this.prompt.askInt('Enter new capacity: '));
            },
            3: async () => {
                updates.days = await this.prompt.askOptionalText('Enter new days (I.E., MWF, TR) or leave blank for async: ');
            },
            4: async () => {
                updates.start_time = (await this.prompt.askOptionalText('Enter start time (HH:MM:SS or blank): '));
            },
            5: async () => {
                updates.end_time = (await this.prompt.askOptionalText('Enter end time (HH:MM:SS or blank): '));
            },
        };

        for (let char of selection) {
            if (handlers[char]) {
                await handlers[char]();
            }
        }

        await this.ss.updateSection(section_id, updates);

        console.log('\nSection updated successfully.\n');
    }

    async removeSection() {
        const section_id = await this.prompt.askInt('Enter section ID to remove: ');

        const confirm = (await this.prompt.askText('Are you sure you want to delete this section? (yes/no): ')).toLowerCase();

        if (confirm !== 'yes') {
            console.log('\nOperation cancelled.\n');
            return;
        }
        try {
            await this.ss.removeSection(section_id);

            console.log('\nSection removed successfully.\n');
        } catch (err) {
            console.error('Invalid Section ID Error', err);
        }
    }
}

export default SectionController;
