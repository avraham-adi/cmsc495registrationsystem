import EnrollmentService from '../services/enrollmentService.js';

class EnrollmentController {
    rl;
    es;

    constructor(rl) {
        this.rl = rl;
        this.es = new EnrollmentService();
    }

    async enrollInSection(currentUser) {
        const section_id = Number((await this.rl.question('Enter section ID to enroll in: ')).trim());

        await this.es.enrollInSection(currentUser.getEmail(), section_id);

        console.log('\nSuccessfully enrolled in section.\n');
    }

    async dropEnrollment(currentUser) {
        const section_id = Number((await this.rl.question('Enter section ID to drop: ')).trim());

        await this.es.dropEnrollment(currentUser.getEmail(), section_id);

        console.log('\nEnrollment dropped successfully.\n');
    }

    async viewMyEnrollments(currentUser) {
        const enrollments = await this.es.getStudentEnrollments(currentUser.getEmail());

        console.log('\nYour Enrollments:\n', enrollments, '\n');
    }

    async viewSectionRoster() {
        const section_id = Number((await this.rl.question('Enter section ID to view roster: ')).trim());

        const roster = await this.es.getSectionRoster(section_id);

        console.log('\nSection Roster:\n', roster, '\n');
    }
}

export default EnrollmentController;
