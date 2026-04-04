export function createTestContext() {
    const now = Date.now();

    const newUser = {
        name: `API Test User ${now}`,
        email: `api_test_${now}@gmail.com`,
        userType: 'STUDENT',
    };

    newUser.password = `${newUser.name}${newUser.email}`;

    return {
        adminAuth: null,
        nonAdminAuth: null,
        updatedNonAdminAuth: null,
        createdCourseId: null,
        newUser,
        updatedUserProfile: {
            name: `Updated API Test User ${now}`,
            email: `api_test_updated_${now}@gmail.com`,
        },
        newUserUpdatedPassword: `UpdatedPass!${now}A1`,
        finalUserPassword: `FinalPass!${now}B2`,
        passwordPolicyTests: {
            tooShort: 'Aa1!a',
            missingUppercase: 'lowercase1!',
            missingLowercase: 'UPPERCASE1!',
            missingNumber: 'NoNumber!',
            missingSpecial: 'NoSpecial1',
            containsEmailLocalPart: `${newUser.email.split('@')[0]}!Aa1`,
        },
        courseTest: {
            create: {
                code: `APIT${String(now).slice(-3)}`,
                title: `API Test Course ${now}`,
                desc: 'Created by apiTestRunner for CRUD validation.',
                cred: 3,
            },
            update: {
                code: `APUT${String(now + 1).slice(-3)}`,
                title: `Updated API Test Course ${now + 1}`,
                desc: 'Updated by apiTestRunner for CRUD validation.',
                cred: 4,
            },
        },
        sectionTest: {
            create: {
                capacity: 24,
                days: 'MW',
                startTime: '09:00',
                endTime: '10:15',
            },
            update: {
                capacity: 18,
                days: 'TR',
                startTime: '13:30',
                endTime: '14:45',
            },
        },
    };
}
