-- Supplemental enrollment seed for realistic student histories.
-- Assumes schema.sql and seeding_data.sql have already populated users, students,
-- courses, semesters, and sections.

USE `registrationdb`;

DELETE FROM `enrollments`;

CREATE TEMPORARY TABLE `seed_student_semester_plan` (
  `major` VARCHAR(45) NOT NULL,
  `term` VARCHAR(8) NOT NULL,
  `year` INT NOT NULL,
  `slot` TINYINT NOT NULL,
  `course_code` VARCHAR(10) NOT NULL,
  `status` ENUM('enrolled', 'completed', 'waitlisted') NOT NULL
);

INSERT INTO `seed_student_semester_plan` (`major`, `term`, `year`, `slot`, `course_code`, `status`) VALUES
('Computer Science', 'Spring', 2024, 1, 'CMSC100', 'completed'),
('Computer Science', 'Spring', 2024, 2, 'CMSC105', 'completed'),
('Computer Science', 'Spring', 2024, 3, 'ENGL102', 'completed'),
('Computer Science', 'Spring', 2024, 4, 'HIST115', 'completed'),
('Computer Science', 'Spring', 2024, 5, 'MATH105', 'completed'),
('Computer Science', 'Spring', 2024, 6, 'IFSM201', 'completed'),
('Computer Science', 'Summer', 2024, 1, 'CMSC115', 'completed'),
('Computer Science', 'Summer', 2024, 2, 'CMSC150', 'completed'),
('Computer Science', 'Summer', 2024, 3, 'ENGL103', 'completed'),
('Computer Science', 'Summer', 2024, 4, 'HIST116', 'completed'),
('Computer Science', 'Summer', 2024, 5, 'MATH107', 'completed'),
('Computer Science', 'Summer', 2024, 6, 'PHYS121', 'completed'),
('Computer Science', 'Fall', 2024, 1, 'CMSC215', 'completed'),
('Computer Science', 'Fall', 2024, 2, 'CMSC220', 'completed'),
('Computer Science', 'Fall', 2024, 3, 'ENGL240', 'completed'),
('Computer Science', 'Fall', 2024, 4, 'HIST125', 'completed'),
('Computer Science', 'Fall', 2024, 5, 'MATH108', 'completed'),
('Computer Science', 'Fall', 2024, 6, 'PHYS122', 'completed'),
('Computer Science', 'Spring', 2025, 1, 'CMSC310', 'completed'),
('Computer Science', 'Spring', 2025, 2, 'CMSC320', 'completed'),
('Computer Science', 'Spring', 2025, 3, 'ENGL281', 'completed'),
('Computer Science', 'Spring', 2025, 4, 'HIST141', 'completed'),
('Computer Science', 'Spring', 2025, 5, 'MATH115', 'completed'),
('Computer Science', 'Spring', 2025, 6, 'CHEM121', 'completed'),
('Computer Science', 'Summer', 2025, 1, 'CMSC315', 'completed'),
('Computer Science', 'Summer', 2025, 2, 'CMSC325', 'completed'),
('Computer Science', 'Summer', 2025, 3, 'ENGL294', 'completed'),
('Computer Science', 'Summer', 2025, 4, 'HIST142', 'completed'),
('Computer Science', 'Summer', 2025, 5, 'MATH140', 'completed'),
('Computer Science', 'Summer', 2025, 6, 'IFSM300', 'completed'),
('Computer Science', 'Fall', 2025, 1, 'CMSC330', 'completed'),
('Computer Science', 'Fall', 2025, 2, 'CMSC335', 'completed'),
('Computer Science', 'Fall', 2025, 3, 'CMSC340', 'completed'),
('Computer Science', 'Fall', 2025, 4, 'CMSC345', 'completed'),
('Computer Science', 'Fall', 2025, 5, 'MATH141', 'completed'),
('Computer Science', 'Fall', 2025, 6, 'IFSM301', 'completed'),
('Computer Science', 'Spring', 2026, 1, 'CMSC405', 'completed'),
('Computer Science', 'Spring', 2026, 2, 'CMSC412', 'completed'),
('Computer Science', 'Spring', 2026, 3, 'CMSC415', 'completed'),
('Computer Science', 'Spring', 2026, 4, 'CMSC420', 'completed'),
('Computer Science', 'Spring', 2026, 5, 'CMSC427', 'completed'),
('Computer Science', 'Spring', 2026, 6, 'MATH241', 'completed'),
('Computer Science', 'Fall', 2026, 1, 'CMSC425', 'enrolled'),
('Computer Science', 'Fall', 2026, 2, 'CMSC430', 'enrolled'),
('Computer Science', 'Fall', 2026, 3, 'CMSC440', 'enrolled'),
('Computer Science', 'Fall', 2026, 4, 'CMSC451', 'enrolled'),
('Computer Science', 'Fall', 2026, 5, 'CMSC465', 'waitlisted'),
('Computer Science', 'Fall', 2026, 6, 'CMSC495', 'waitlisted'),

('Mathematics', 'Spring', 2024, 1, 'MATH105', 'completed'),
('Mathematics', 'Spring', 2024, 2, 'MATH107', 'completed'),
('Mathematics', 'Spring', 2024, 3, 'ENGL102', 'completed'),
('Mathematics', 'Spring', 2024, 4, 'HIST115', 'completed'),
('Mathematics', 'Spring', 2024, 5, 'CMSC100', 'completed'),
('Mathematics', 'Spring', 2024, 6, 'IFSM201', 'completed'),
('Mathematics', 'Summer', 2024, 1, 'MATH108', 'completed'),
('Mathematics', 'Summer', 2024, 2, 'MATH115', 'completed'),
('Mathematics', 'Summer', 2024, 3, 'ENGL103', 'completed'),
('Mathematics', 'Summer', 2024, 4, 'HIST116', 'completed'),
('Mathematics', 'Summer', 2024, 5, 'CMSC105', 'completed'),
('Mathematics', 'Summer', 2024, 6, 'PHYS121', 'completed'),
('Mathematics', 'Fall', 2024, 1, 'MATH140', 'completed'),
('Mathematics', 'Fall', 2024, 2, 'MATH141', 'completed'),
('Mathematics', 'Fall', 2024, 3, 'ENGL240', 'completed'),
('Mathematics', 'Fall', 2024, 4, 'HIST125', 'completed'),
('Mathematics', 'Fall', 2024, 5, 'CMSC115', 'completed'),
('Mathematics', 'Fall', 2024, 6, 'PHYS122', 'completed'),
('Mathematics', 'Spring', 2025, 1, 'MATH241', 'completed'),
('Mathematics', 'Spring', 2025, 2, 'MATH246', 'completed'),
('Mathematics', 'Spring', 2025, 3, 'ENGL281', 'completed'),
('Mathematics', 'Spring', 2025, 4, 'HIST141', 'completed'),
('Mathematics', 'Spring', 2025, 5, 'CMSC150', 'completed'),
('Mathematics', 'Spring', 2025, 6, 'CHEM121', 'completed'),
('Mathematics', 'Summer', 2025, 1, 'MATH301', 'completed'),
('Mathematics', 'Summer', 2025, 2, 'MATH340', 'completed'),
('Mathematics', 'Summer', 2025, 3, 'ENGL294', 'completed'),
('Mathematics', 'Summer', 2025, 4, 'HIST142', 'completed'),
('Mathematics', 'Summer', 2025, 5, 'CMSC215', 'completed'),
('Mathematics', 'Summer', 2025, 6, 'IFSM300', 'completed'),
('Mathematics', 'Fall', 2025, 1, 'MATH402', 'completed'),
('Mathematics', 'Fall', 2025, 2, 'MATH463', 'completed'),
('Mathematics', 'Fall', 2025, 3, 'ENGL303', 'completed'),
('Mathematics', 'Fall', 2025, 4, 'HIST156', 'completed'),
('Mathematics', 'Fall', 2025, 5, 'CMSC220', 'completed'),
('Mathematics', 'Fall', 2025, 6, 'IFSM301', 'completed'),
('Mathematics', 'Spring', 2026, 1, 'ENGL310', 'completed'),
('Mathematics', 'Spring', 2026, 2, 'HIST157', 'completed'),
('Mathematics', 'Spring', 2026, 3, 'IFSM304', 'completed'),
('Mathematics', 'Spring', 2026, 4, 'CHEM103', 'completed'),
('Mathematics', 'Spring', 2026, 5, 'CMSC310', 'completed'),
('Mathematics', 'Spring', 2026, 6, 'CMSC320', 'completed'),
('Mathematics', 'Fall', 2026, 1, 'ENGL311', 'enrolled'),
('Mathematics', 'Fall', 2026, 2, 'HIST202', 'enrolled'),
('Mathematics', 'Fall', 2026, 3, 'IFSM310', 'enrolled'),
('Mathematics', 'Fall', 2026, 4, 'CHEM113', 'enrolled'),
('Mathematics', 'Fall', 2026, 5, 'CMSC315', 'waitlisted'),
('Mathematics', 'Fall', 2026, 6, 'CMSC427', 'waitlisted'),

('English', 'Spring', 2024, 1, 'ENGL102', 'completed'),
('English', 'Spring', 2024, 2, 'ENGL103', 'completed'),
('English', 'Spring', 2024, 3, 'HIST115', 'completed'),
('English', 'Spring', 2024, 4, 'HIST116', 'completed'),
('English', 'Spring', 2024, 5, 'MATH105', 'completed'),
('English', 'Spring', 2024, 6, 'CMSC100', 'completed'),
('English', 'Summer', 2024, 1, 'ENGL240', 'completed'),
('English', 'Summer', 2024, 2, 'ENGL250', 'completed'),
('English', 'Summer', 2024, 3, 'HIST125', 'completed'),
('English', 'Summer', 2024, 4, 'HIST141', 'completed'),
('English', 'Summer', 2024, 5, 'MATH107', 'completed'),
('English', 'Summer', 2024, 6, 'IFSM201', 'completed'),
('English', 'Fall', 2024, 1, 'ENGL281', 'completed'),
('English', 'Fall', 2024, 2, 'ENGL294', 'completed'),
('English', 'Fall', 2024, 3, 'HIST142', 'completed'),
('English', 'Fall', 2024, 4, 'HIST156', 'completed'),
('English', 'Fall', 2024, 5, 'MATH108', 'completed'),
('English', 'Fall', 2024, 6, 'CMSC105', 'completed'),
('English', 'Spring', 2025, 1, 'ENGL303', 'completed'),
('English', 'Spring', 2025, 2, 'ENGL310', 'completed'),
('English', 'Spring', 2025, 3, 'HIST157', 'completed'),
('English', 'Spring', 2025, 4, 'HIST202', 'completed'),
('English', 'Spring', 2025, 5, 'MATH115', 'completed'),
('English', 'Spring', 2025, 6, 'IFSM300', 'completed'),
('English', 'Summer', 2025, 1, 'ENGL311', 'completed'),
('English', 'Summer', 2025, 2, 'ENGL312', 'completed'),
('English', 'Summer', 2025, 3, 'HIST289', 'completed'),
('English', 'Summer', 2025, 4, 'HIST309', 'completed'),
('English', 'Summer', 2025, 5, 'MATH140', 'completed'),
('English', 'Summer', 2025, 6, 'CMSC115', 'completed'),
('English', 'Fall', 2025, 1, 'ENGL363', 'completed'),
('English', 'Fall', 2025, 2, 'ENGL364', 'completed'),
('English', 'Fall', 2025, 3, 'HIST316L', 'completed'),
('English', 'Fall', 2025, 4, 'HIST326', 'completed'),
('English', 'Fall', 2025, 5, 'IFSM301', 'completed'),
('English', 'Fall', 2025, 6, 'CMSC150', 'completed'),
('English', 'Spring', 2026, 1, 'ENGL381', 'completed'),
('English', 'Spring', 2026, 2, 'ENGL384', 'completed'),
('English', 'Spring', 2026, 3, 'ENGL386', 'completed'),
('English', 'Spring', 2026, 4, 'HIST337', 'completed'),
('English', 'Spring', 2026, 5, 'HIST365', 'completed'),
('English', 'Spring', 2026, 6, 'IFSM304', 'completed'),
('English', 'Fall', 2026, 1, 'ENGL389', 'enrolled'),
('English', 'Fall', 2026, 2, 'ENGL406', 'enrolled'),
('English', 'Fall', 2026, 3, 'ENGL418', 'enrolled'),
('English', 'Fall', 2026, 4, 'ENGL430', 'enrolled'),
('English', 'Fall', 2026, 5, 'ENGL433', 'waitlisted'),
('English', 'Fall', 2026, 6, 'ENGL495', 'waitlisted'),

('History', 'Spring', 2024, 1, 'HIST115', 'completed'),
('History', 'Spring', 2024, 2, 'HIST116', 'completed'),
('History', 'Spring', 2024, 3, 'ENGL102', 'completed'),
('History', 'Spring', 2024, 4, 'ENGL103', 'completed'),
('History', 'Spring', 2024, 5, 'MATH105', 'completed'),
('History', 'Spring', 2024, 6, 'CMSC100', 'completed'),
('History', 'Summer', 2024, 1, 'HIST125', 'completed'),
('History', 'Summer', 2024, 2, 'HIST141', 'completed'),
('History', 'Summer', 2024, 3, 'ENGL240', 'completed'),
('History', 'Summer', 2024, 4, 'ENGL250', 'completed'),
('History', 'Summer', 2024, 5, 'MATH107', 'completed'),
('History', 'Summer', 2024, 6, 'IFSM201', 'completed'),
('History', 'Fall', 2024, 1, 'HIST142', 'completed'),
('History', 'Fall', 2024, 2, 'HIST156', 'completed'),
('History', 'Fall', 2024, 3, 'ENGL281', 'completed'),
('History', 'Fall', 2024, 4, 'ENGL294', 'completed'),
('History', 'Fall', 2024, 5, 'MATH108', 'completed'),
('History', 'Fall', 2024, 6, 'CMSC105', 'completed'),
('History', 'Spring', 2025, 1, 'HIST157', 'completed'),
('History', 'Spring', 2025, 2, 'HIST202', 'completed'),
('History', 'Spring', 2025, 3, 'ENGL303', 'completed'),
('History', 'Spring', 2025, 4, 'ENGL310', 'completed'),
('History', 'Spring', 2025, 5, 'MATH115', 'completed'),
('History', 'Spring', 2025, 6, 'IFSM300', 'completed'),
('History', 'Summer', 2025, 1, 'HIST289', 'completed'),
('History', 'Summer', 2025, 2, 'HIST309', 'completed'),
('History', 'Summer', 2025, 3, 'ENGL311', 'completed'),
('History', 'Summer', 2025, 4, 'ENGL312', 'completed'),
('History', 'Summer', 2025, 5, 'MATH140', 'completed'),
('History', 'Summer', 2025, 6, 'CMSC115', 'completed'),
('History', 'Fall', 2025, 1, 'HIST316L', 'completed'),
('History', 'Fall', 2025, 2, 'HIST326', 'completed'),
('History', 'Fall', 2025, 3, 'HIST337', 'completed'),
('History', 'Fall', 2025, 4, 'ENGL363', 'completed'),
('History', 'Fall', 2025, 5, 'IFSM301', 'completed'),
('History', 'Fall', 2025, 6, 'CMSC150', 'completed'),
('History', 'Spring', 2026, 1, 'HIST365', 'completed'),
('History', 'Spring', 2026, 2, 'HIST377', 'completed'),
('History', 'Spring', 2026, 3, 'HIST381', 'completed'),
('History', 'Spring', 2026, 4, 'HIST392', 'completed'),
('History', 'Spring', 2026, 5, 'ENGL364', 'completed'),
('History', 'Spring', 2026, 6, 'IFSM304', 'completed'),
('History', 'Fall', 2026, 1, 'HIST461', 'enrolled'),
('History', 'Fall', 2026, 2, 'HIST462', 'enrolled'),
('History', 'Fall', 2026, 3, 'HIST464', 'enrolled'),
('History', 'Fall', 2026, 4, 'HIST465', 'enrolled'),
('History', 'Fall', 2026, 5, 'HIST483', 'waitlisted'),
('History', 'Fall', 2026, 6, 'HIST495', 'waitlisted'),

('Physics', 'Spring', 2024, 1, 'PHYS121', 'completed'),
('Physics', 'Spring', 2024, 2, 'MATH107', 'completed'),
('Physics', 'Spring', 2024, 3, 'MATH108', 'completed'),
('Physics', 'Spring', 2024, 4, 'ENGL102', 'completed'),
('Physics', 'Spring', 2024, 5, 'CMSC100', 'completed'),
('Physics', 'Spring', 2024, 6, 'CHEM121', 'completed'),
('Physics', 'Summer', 2024, 1, 'PHYS122', 'completed'),
('Physics', 'Summer', 2024, 2, 'MATH115', 'completed'),
('Physics', 'Summer', 2024, 3, 'MATH140', 'completed'),
('Physics', 'Summer', 2024, 4, 'ENGL103', 'completed'),
('Physics', 'Summer', 2024, 5, 'CMSC105', 'completed'),
('Physics', 'Summer', 2024, 6, 'CHEM103', 'completed'),
('Physics', 'Fall', 2024, 1, 'MATH141', 'completed'),
('Physics', 'Fall', 2024, 2, 'MATH241', 'completed'),
('Physics', 'Fall', 2024, 3, 'CMSC115', 'completed'),
('Physics', 'Fall', 2024, 4, 'ENGL240', 'completed'),
('Physics', 'Fall', 2024, 5, 'CHEM113', 'completed'),
('Physics', 'Fall', 2024, 6, 'IFSM201', 'completed'),
('Physics', 'Spring', 2025, 1, 'MATH246', 'completed'),
('Physics', 'Spring', 2025, 2, 'MATH340', 'completed'),
('Physics', 'Spring', 2025, 3, 'CMSC150', 'completed'),
('Physics', 'Spring', 2025, 4, 'ENGL281', 'completed'),
('Physics', 'Spring', 2025, 5, 'CHEM297', 'completed'),
('Physics', 'Spring', 2025, 6, 'IFSM300', 'completed'),
('Physics', 'Summer', 2025, 1, 'MATH301', 'completed'),
('Physics', 'Summer', 2025, 2, 'MATH402', 'completed'),
('Physics', 'Summer', 2025, 3, 'CMSC215', 'completed'),
('Physics', 'Summer', 2025, 4, 'CMSC220', 'completed'),
('Physics', 'Summer', 2025, 5, 'ENGL294', 'completed'),
('Physics', 'Summer', 2025, 6, 'IFSM301', 'completed'),
('Physics', 'Fall', 2025, 1, 'MATH463', 'completed'),
('Physics', 'Fall', 2025, 2, 'CMSC310', 'completed'),
('Physics', 'Fall', 2025, 3, 'CMSC315', 'completed'),
('Physics', 'Fall', 2025, 4, 'CMSC320', 'completed'),
('Physics', 'Fall', 2025, 5, 'ENGL303', 'completed'),
('Physics', 'Fall', 2025, 6, 'IFSM304', 'completed'),
('Physics', 'Spring', 2026, 1, 'CMSC330', 'completed'),
('Physics', 'Spring', 2026, 2, 'CMSC335', 'completed'),
('Physics', 'Spring', 2026, 3, 'CMSC340', 'completed'),
('Physics', 'Spring', 2026, 4, 'CMSC427', 'completed'),
('Physics', 'Spring', 2026, 5, 'ENGL310', 'completed'),
('Physics', 'Spring', 2026, 6, 'IFSM310', 'completed'),
('Physics', 'Fall', 2026, 1, 'CMSC405', 'enrolled'),
('Physics', 'Fall', 2026, 2, 'CMSC412', 'enrolled'),
('Physics', 'Fall', 2026, 3, 'CMSC415', 'enrolled'),
('Physics', 'Fall', 2026, 4, 'CMSC451', 'enrolled'),
('Physics', 'Fall', 2026, 5, 'CMSC465', 'waitlisted'),
('Physics', 'Fall', 2026, 6, 'CMSC495', 'waitlisted'),

('Chemistry', 'Spring', 2024, 1, 'CHEM121', 'completed'),
('Chemistry', 'Spring', 2024, 2, 'CHEM103', 'completed'),
('Chemistry', 'Spring', 2024, 3, 'MATH105', 'completed'),
('Chemistry', 'Spring', 2024, 4, 'ENGL102', 'completed'),
('Chemistry', 'Spring', 2024, 5, 'CMSC100', 'completed'),
('Chemistry', 'Spring', 2024, 6, 'IFSM201', 'completed'),
('Chemistry', 'Summer', 2024, 1, 'CHEM113', 'completed'),
('Chemistry', 'Summer', 2024, 2, 'PHYS121', 'completed'),
('Chemistry', 'Summer', 2024, 3, 'MATH107', 'completed'),
('Chemistry', 'Summer', 2024, 4, 'ENGL103', 'completed'),
('Chemistry', 'Summer', 2024, 5, 'CMSC105', 'completed'),
('Chemistry', 'Summer', 2024, 6, 'HIST115', 'completed'),
('Chemistry', 'Fall', 2024, 1, 'CHEM297', 'completed'),
('Chemistry', 'Fall', 2024, 2, 'PHYS122', 'completed'),
('Chemistry', 'Fall', 2024, 3, 'MATH108', 'completed'),
('Chemistry', 'Fall', 2024, 4, 'ENGL240', 'completed'),
('Chemistry', 'Fall', 2024, 5, 'CMSC115', 'completed'),
('Chemistry', 'Fall', 2024, 6, 'HIST116', 'completed'),
('Chemistry', 'Spring', 2025, 1, 'MATH115', 'completed'),
('Chemistry', 'Spring', 2025, 2, 'MATH140', 'completed'),
('Chemistry', 'Spring', 2025, 3, 'ENGL281', 'completed'),
('Chemistry', 'Spring', 2025, 4, 'CMSC150', 'completed'),
('Chemistry', 'Spring', 2025, 5, 'HIST125', 'completed'),
('Chemistry', 'Spring', 2025, 6, 'IFSM300', 'completed'),
('Chemistry', 'Summer', 2025, 1, 'MATH141', 'completed'),
('Chemistry', 'Summer', 2025, 2, 'MATH241', 'completed'),
('Chemistry', 'Summer', 2025, 3, 'ENGL294', 'completed'),
('Chemistry', 'Summer', 2025, 4, 'CMSC215', 'completed'),
('Chemistry', 'Summer', 2025, 5, 'CMSC220', 'completed'),
('Chemistry', 'Summer', 2025, 6, 'HIST141', 'completed'),
('Chemistry', 'Fall', 2025, 1, 'MATH246', 'completed'),
('Chemistry', 'Fall', 2025, 2, 'CMSC310', 'completed'),
('Chemistry', 'Fall', 2025, 3, 'CMSC320', 'completed'),
('Chemistry', 'Fall', 2025, 4, 'ENGL303', 'completed'),
('Chemistry', 'Fall', 2025, 5, 'HIST142', 'completed'),
('Chemistry', 'Fall', 2025, 6, 'IFSM301', 'completed'),
('Chemistry', 'Spring', 2026, 1, 'MATH340', 'completed'),
('Chemistry', 'Spring', 2026, 2, 'CMSC315', 'completed'),
('Chemistry', 'Spring', 2026, 3, 'CMSC340', 'completed'),
('Chemistry', 'Spring', 2026, 4, 'ENGL310', 'completed'),
('Chemistry', 'Spring', 2026, 5, 'HIST156', 'completed'),
('Chemistry', 'Spring', 2026, 6, 'IFSM304', 'completed'),
('Chemistry', 'Fall', 2026, 1, 'CMSC345', 'enrolled'),
('Chemistry', 'Fall', 2026, 2, 'CMSC412', 'enrolled'),
('Chemistry', 'Fall', 2026, 3, 'ENGL311', 'enrolled'),
('Chemistry', 'Fall', 2026, 4, 'HIST157', 'enrolled'),
('Chemistry', 'Fall', 2026, 5, 'IFSM310', 'waitlisted'),
('Chemistry', 'Fall', 2026, 6, 'MATH301', 'waitlisted'),

('Nursing', 'Spring', 2024, 1, 'NURS302', 'completed'),
('Nursing', 'Spring', 2024, 2, 'NURS322', 'completed'),
('Nursing', 'Spring', 2024, 3, 'ENGL102', 'completed'),
('Nursing', 'Spring', 2024, 4, 'HIST115', 'completed'),
('Nursing', 'Spring', 2024, 5, 'MATH105', 'completed'),
('Nursing', 'Spring', 2024, 6, 'IFSM201', 'completed'),
('Nursing', 'Summer', 2024, 1, 'NURS352', 'completed'),
('Nursing', 'Summer', 2024, 2, 'NURS372', 'completed'),
('Nursing', 'Summer', 2024, 3, 'ENGL103', 'completed'),
('Nursing', 'Summer', 2024, 4, 'HIST116', 'completed'),
('Nursing', 'Summer', 2024, 5, 'MATH107', 'completed'),
('Nursing', 'Summer', 2024, 6, 'CMSC100', 'completed'),
('Nursing', 'Fall', 2024, 1, 'NURS392', 'completed'),
('Nursing', 'Fall', 2024, 2, 'NURS412', 'completed'),
('Nursing', 'Fall', 2024, 3, 'ENGL240', 'completed'),
('Nursing', 'Fall', 2024, 4, 'HIST125', 'completed'),
('Nursing', 'Fall', 2024, 5, 'MATH108', 'completed'),
('Nursing', 'Fall', 2024, 6, 'IFSM300', 'completed'),
('Nursing', 'Spring', 2025, 1, 'NURS432', 'completed'),
('Nursing', 'Spring', 2025, 2, 'NURS452', 'completed'),
('Nursing', 'Spring', 2025, 3, 'ENGL281', 'completed'),
('Nursing', 'Spring', 2025, 4, 'HIST141', 'completed'),
('Nursing', 'Spring', 2025, 5, 'MATH115', 'completed'),
('Nursing', 'Spring', 2025, 6, 'IFSM301', 'completed'),
('Nursing', 'Summer', 2025, 1, 'NURS462', 'completed'),
('Nursing', 'Summer', 2025, 2, 'NURS472', 'completed'),
('Nursing', 'Summer', 2025, 3, 'ENGL294', 'completed'),
('Nursing', 'Summer', 2025, 4, 'HIST142', 'completed'),
('Nursing', 'Summer', 2025, 5, 'MATH140', 'completed'),
('Nursing', 'Summer', 2025, 6, 'IFSM304', 'completed'),
('Nursing', 'Fall', 2025, 1, 'NURS496', 'completed'),
('Nursing', 'Fall', 2025, 2, 'IFSM305', 'completed'),
('Nursing', 'Fall', 2025, 3, 'ENGL303', 'completed'),
('Nursing', 'Fall', 2025, 4, 'HIST156', 'completed'),
('Nursing', 'Fall', 2025, 5, 'MATH141', 'completed'),
('Nursing', 'Fall', 2025, 6, 'CMSC105', 'completed'),
('Nursing', 'Spring', 2026, 1, 'IFSM310', 'completed'),
('Nursing', 'Spring', 2026, 2, 'IFSM370', 'completed'),
('Nursing', 'Spring', 2026, 3, 'ENGL310', 'completed'),
('Nursing', 'Spring', 2026, 4, 'HIST157', 'completed'),
('Nursing', 'Spring', 2026, 5, 'MATH246', 'completed'),
('Nursing', 'Spring', 2026, 6, 'CMSC115', 'completed'),
('Nursing', 'Fall', 2026, 1, 'IFSM380', 'enrolled'),
('Nursing', 'Fall', 2026, 2, 'IFSM432', 'enrolled'),
('Nursing', 'Fall', 2026, 3, 'ENGL311', 'enrolled'),
('Nursing', 'Fall', 2026, 4, 'HIST202', 'enrolled'),
('Nursing', 'Fall', 2026, 5, 'CMSC150', 'waitlisted'),
('Nursing', 'Fall', 2026, 6, 'IFSM495', 'waitlisted'),

('Information Systems Management', 'Spring', 2024, 1, 'IFSM201', 'completed'),
('Information Systems Management', 'Spring', 2024, 2, 'IFSM300', 'completed'),
('Information Systems Management', 'Spring', 2024, 3, 'ENGL102', 'completed'),
('Information Systems Management', 'Spring', 2024, 4, 'HIST115', 'completed'),
('Information Systems Management', 'Spring', 2024, 5, 'MATH105', 'completed'),
('Information Systems Management', 'Spring', 2024, 6, 'CMSC100', 'completed'),
('Information Systems Management', 'Summer', 2024, 1, 'IFSM301', 'completed'),
('Information Systems Management', 'Summer', 2024, 2, 'IFSM304', 'completed'),
('Information Systems Management', 'Summer', 2024, 3, 'ENGL103', 'completed'),
('Information Systems Management', 'Summer', 2024, 4, 'HIST116', 'completed'),
('Information Systems Management', 'Summer', 2024, 5, 'MATH107', 'completed'),
('Information Systems Management', 'Summer', 2024, 6, 'CMSC105', 'completed'),
('Information Systems Management', 'Fall', 2024, 1, 'IFSM305', 'completed'),
('Information Systems Management', 'Fall', 2024, 2, 'IFSM310', 'completed'),
('Information Systems Management', 'Fall', 2024, 3, 'ENGL240', 'completed'),
('Information Systems Management', 'Fall', 2024, 4, 'HIST125', 'completed'),
('Information Systems Management', 'Fall', 2024, 5, 'MATH108', 'completed'),
('Information Systems Management', 'Fall', 2024, 6, 'CMSC115', 'completed'),
('Information Systems Management', 'Spring', 2025, 1, 'IFSM311', 'completed'),
('Information Systems Management', 'Spring', 2025, 2, 'IFSM370', 'completed'),
('Information Systems Management', 'Spring', 2025, 3, 'ENGL281', 'completed'),
('Information Systems Management', 'Spring', 2025, 4, 'HIST141', 'completed'),
('Information Systems Management', 'Spring', 2025, 5, 'MATH115', 'completed'),
('Information Systems Management', 'Spring', 2025, 6, 'CMSC150', 'completed'),
('Information Systems Management', 'Summer', 2025, 1, 'IFSM380', 'completed'),
('Information Systems Management', 'Summer', 2025, 2, 'IFSM432', 'completed'),
('Information Systems Management', 'Summer', 2025, 3, 'ENGL294', 'completed'),
('Information Systems Management', 'Summer', 2025, 4, 'HIST142', 'completed'),
('Information Systems Management', 'Summer', 2025, 5, 'MATH140', 'completed'),
('Information Systems Management', 'Summer', 2025, 6, 'CMSC215', 'completed'),
('Information Systems Management', 'Fall', 2025, 1, 'IFSM438', 'completed'),
('Information Systems Management', 'Fall', 2025, 2, 'IFSM441', 'completed'),
('Information Systems Management', 'Fall', 2025, 3, 'ENGL303', 'completed'),
('Information Systems Management', 'Fall', 2025, 4, 'HIST156', 'completed'),
('Information Systems Management', 'Fall', 2025, 5, 'MATH141', 'completed'),
('Information Systems Management', 'Fall', 2025, 6, 'CMSC220', 'completed'),
('Information Systems Management', 'Spring', 2026, 1, 'IFSM461', 'completed'),
('Information Systems Management', 'Spring', 2026, 2, 'IFSM486A', 'completed'),
('Information Systems Management', 'Spring', 2026, 3, 'ENGL310', 'completed'),
('Information Systems Management', 'Spring', 2026, 4, 'HIST157', 'completed'),
('Information Systems Management', 'Spring', 2026, 5, 'MATH246', 'completed'),
('Information Systems Management', 'Spring', 2026, 6, 'CMSC320', 'completed'),
('Information Systems Management', 'Fall', 2026, 1, 'IFSM486B', 'enrolled'),
('Information Systems Management', 'Fall', 2026, 2, 'IFSM495', 'enrolled'),
('Information Systems Management', 'Fall', 2026, 3, 'CMSC340', 'enrolled'),
('Information Systems Management', 'Fall', 2026, 4, 'CMSC345', 'enrolled'),
('Information Systems Management', 'Fall', 2026, 5, 'ENGL311', 'waitlisted'),
('Information Systems Management', 'Fall', 2026, 6, 'HIST202', 'waitlisted');

CREATE TEMPORARY TABLE `seed_student_profiles` AS
SELECT
  s.`student_id`,
  s.`major`,
  ROW_NUMBER() OVER (PARTITION BY s.`major` ORDER BY s.`student_id`) AS `major_index`,
  MOD(ROW_NUMBER() OVER (PARTITION BY s.`major` ORDER BY s.`student_id`) - 1, 4) AS `pace_group`
FROM `students` s;

CREATE TEMPORARY TABLE `seed_ranked_sections` AS
SELECT
  `section_id`,
  `course_id`,
  `semester_id`,
  ROW_NUMBER() OVER (PARTITION BY `course_id`, `semester_id` ORDER BY `section_id`) AS `section_rank`
FROM `sections`;

CREATE TEMPORARY TABLE `seed_candidate_enrollments` AS
SELECT
  sp.`student_id`,
  plan.`term`,
  plan.`year`,
  plan.`slot`,
  c.`credits`,
  s.`capacity` AS `section_capacity`,
  sec.`section_id`,
  CASE WHEN plan.`term` = 'Fall' AND plan.`year` = 2026 THEN 1 ELSE 0 END AS `is_current_term`
FROM `seed_student_profiles` sp
JOIN `seed_student_semester_plan` plan ON plan.`major` = sp.`major`
JOIN `semesters` sem ON sem.`term` = plan.`term` AND sem.`year` = plan.`year`
JOIN `courses` c ON c.`course_code` = plan.`course_code`
JOIN `seed_ranked_sections` sec
  ON sec.`course_id` = c.`course_id`
 AND sec.`semester_id` = sem.`semester_id`
 AND sec.`section_rank` = CASE plan.`slot`
    WHEN 1 THEN 1
    WHEN 2 THEN 2
    WHEN 3 THEN 3
    WHEN 4 THEN 4
    WHEN 5 THEN 5
    ELSE 6
  END
JOIN `sections` s ON s.`section_id` = sec.`section_id`
WHERE NOT (
  (
    plan.`term` = 'Fall' AND plan.`year` = 2026
    AND (
      (sp.`pace_group` = 1 AND plan.`slot` IN (5, 6))
      OR (sp.`pace_group` = 2 AND plan.`slot` IN (4, 5, 6))
      OR (sp.`pace_group` = 3 AND plan.`slot` IN (3, 5, 6))
    )
  )
  OR (
    (plan.`term` <> 'Fall' OR plan.`year` <> 2026)
    AND (
      (sp.`pace_group` = 1 AND plan.`term` = 'Summer' AND plan.`slot` = 6)
      OR (
        sp.`pace_group` = 2
        AND (
          (plan.`year` = 2024 AND plan.`term` IN ('Spring', 'Summer') AND plan.`slot` IN (5, 6))
          OR (plan.`year` = 2025 AND plan.`term` = 'Summer' AND plan.`slot` = 6)
        )
      )
      OR (sp.`pace_group` = 3 AND plan.`year` = 2024 AND plan.`term` = 'Spring' AND plan.`slot` = 6)
    )
  )
);

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
SELECT
  ranked.`student_id`,
  ranked.`section_id`,
  CASE
    WHEN ranked.`is_current_term` = 1 THEN
      CASE
        WHEN ranked.`section_queue_position` <= ranked.`section_capacity` THEN 'enrolled'
        ELSE 'waitlisted'
      END
    ELSE 'completed'
  END AS `status`
FROM (
  SELECT
    candidate.*,
    ROW_NUMBER() OVER (
      PARTITION BY
        candidate.`student_id`,
        candidate.`year`,
        candidate.`term`,
        s.`days`,
        s.`start_time`,
        s.`end_time`
      ORDER BY candidate.`slot`
    ) AS `student_time_rank`,
    ROW_NUMBER() OVER (
      PARTITION BY candidate.`section_id`
      ORDER BY candidate.`student_id`
    ) AS `section_queue_position`,
    SUM(candidate.`credits`) OVER (
      PARTITION BY candidate.`student_id`, candidate.`year`, candidate.`term`
      ORDER BY candidate.`slot`
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `semester_credit_total`,
    SUM(candidate.`credits`) OVER (
      PARTITION BY candidate.`student_id`
      ORDER BY
        candidate.`year` DESC,
        CASE candidate.`term`
          WHEN 'Fall' THEN 1
          WHEN 'Summer' THEN 2
          ELSE 3
        END,
        candidate.`slot` DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `overall_credit_total`
  FROM `seed_candidate_enrollments` candidate
  JOIN `sections` s ON s.`section_id` = candidate.`section_id`
) ranked
WHERE ranked.`student_time_rank` = 1
  AND ranked.`semester_credit_total` <= 18
  AND ranked.`overall_credit_total` <= 100;

-- Keep the primary demo student on a single active waitlist in the current term.
DELETE enrollment_record
FROM `enrollments` enrollment_record
INNER JOIN `students` student_record
  ON student_record.`student_id` = enrollment_record.`student_id`
INNER JOIN `users` user_record
  ON user_record.`user_id` = student_record.`user_id`
INNER JOIN `sections` section_record
  ON section_record.`section_id` = enrollment_record.`section_id`
INNER JOIN `courses` course_record
  ON course_record.`course_id` = section_record.`course_id`
INNER JOIN `semesters` semester_record
  ON semester_record.`semester_id` = section_record.`semester_id`
WHERE user_record.`email` = 'walke_etha001@guru.edu'
  AND enrollment_record.`status` = 'waitlisted'
  AND semester_record.`term` = 'Fall'
  AND semester_record.`year` = 2026
  AND course_record.`course_code` = 'CMSC495';

DROP TEMPORARY TABLE IF EXISTS `seed_candidate_enrollments`;
DROP TEMPORARY TABLE IF EXISTS `seed_ranked_sections`;
DROP TEMPORARY TABLE IF EXISTS `seed_student_profiles`;
DROP TEMPORARY TABLE IF EXISTS `seed_student_semester_plan`;
