import SectionService from '../services/sectionService.js';

class SectionController {
    rl;
    ss;

    constructor(rl) {
        this.rl = rl;
        this.ss = new SectionService();
    }

    async getSectionInfo() {
        const selection = (await this.rl.question('Enter the section ID: ')).trim();
        return await this.ss.getSectionInfo(selection);
    }

    async viewSectionsByCourse() {
        const course_code = (await this.rl.question('Enter the course code: ')).trim();
        return await this.ss.getSectionsByCourse(course_code);
    }

    async viewSectionsBySemester() {
        const term = (await this.rl.question('Enter the term: ')).trim();
        const year = (await this.rl.question('Enter the year: ')).trim();
        return await this.ss.getSectionsBySemester(term, year);
    }

    async addSection() {
        const course_code = (await this.rl.question('Enter course code (I.E., CMSC 100): ')).trim();
        const term = (await this.rl.question('Enter semester term (I.E., Fall, Spring, Summer): ')).trim();
        const year = (await this.rl.question('Enter semester year (I.E., 2026): ')).trim();
        const professor_email = (await this.rl.question('Enter professor email (must already exist in system): ')).trim();
        const capacity = (await this.rl.question('Enter section capacity (Integer): ')).trim();
        const days = (await this.rl.question('Enter meeting days (I.E., MWF, TR, or leave blank for async): ')).trim();
        const start_time = (await this.rl.question('Enter start time (HH:MM:SS, 24-hour format, or leave blank for async): ')).trim() || null;
        const end_time = (await this.rl.question('Enter end time (HH:MM:SS, 24-hour format, or leave blank for async): ')).trim() || null;

        await this.ss.addSection(course_code, term, year, professor_email, capacity, days, start_time, end_time);
    }

    async updateSection() {
        const section_id = Number((await this.rl.question('Enter section ID to update: ')).trim());

        const selection = (
            await this.rl.question('What would you like to change?\n' + '1. Professor\n2. Capacity\n3. Days\n4. Start Time\n5. End Time\n\n' + 'Enter all numbers (e.g., 135): ')
        ).trim();

        let updates = {};

        const handlers = {
            1: async () => {
                updates.professor_email = (await this.rl.question('Enter new professor email: ')).trim();
            },
            2: async () => {
                updates.capacity = Number((await this.rl.question('Enter new capacity: ')).trim());
            },
            3: async () => {
                updates.days = (await this.rl.question('Enter new days (I.E., MWF, TR): ')).trim();
            },
            4: async () => {
                updates.start_time = (await this.rl.question('Enter start time (HH:MM:SS or blank): ')).trim() || null;
            },
            5: async () => {
                updates.end_time = (await this.rl.question('Enter end time (HH:MM:SS or blank): ')).trim() || null;
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
        const section_id = (await this.rl.question('Enter section ID to remove: ')).trim();

        const confirm = (await this.rl.question('Are you sure you want to delete this section? (yes/no): ')).trim().toLowerCase();

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
