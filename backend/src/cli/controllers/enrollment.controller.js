import EnrollmentService from '../../services/enrollment.service.js';

class EnrollmentController {
    prompt;
    es;

    constructor(prompt) {
        this.prompt = prompt;
        this.es = new EnrollmentService();
    }

    async enrollInSection(currentUser) {
        const section_id = Number(await this.prompt.askInt('Enter section ID to enroll in: '));
        const student_id = await this.es.getStudentIdByEmail(currentUser.getEmail());
        const enrollment = await this.es.getEnrollment(student_id, section_id);
        let accessCode = null;
        if (enrollment && enrollment.status === 'waitlisted') {
            accessCode = await this.prompt.askQuestion('Enter professor access code if applicable, or press Enter to continue: ');
        }

        await this.es.enrollInSection(currentUser.getEmail(), section_id, accessCode);

        console.log('\nSuccessfully enrolled in section.\n');
    }

    async dropEnrollment(currentUser) {
        const section_id = Number(await this.prompt.askInt('Enter section ID to drop: '));

        await this.es.dropEnrollment(currentUser.getEmail(), section_id);

        console.log('\nEnrollment dropped successfully.\n');
    }

    async viewMyEnrollments(currentUser) {
        const enrollments = await this.es.getStudentEnrollments(currentUser.getEmail());

        console.log('\nYour Enrollments:\n', enrollments, '\n');
    }

    async viewSectionRoster() {
        const section_id = Number(await this.prompt.askInt('Enter section ID to view roster: '));

        const roster = await this.es.getSectionRoster(section_id);

        console.log('\nSection Roster:\n', roster, '\n');
    }
}

export default EnrollmentController;
