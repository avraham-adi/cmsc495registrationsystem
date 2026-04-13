USE `registrationdb`;

START TRANSACTION;

CREATE TEMPORARY TABLE `seed_demo_accounts` (
  `email` VARCHAR(100) NOT NULL PRIMARY KEY
);

INSERT INTO `seed_demo_accounts` (`email`) VALUES
('walke_etha001@guru.edu'),
('harpe_dani301@guru.edu'),
('hughe_caro201@guru.edu');

CREATE TEMPORARY TABLE `seed_demo_completed_courses` AS
SELECT DISTINCT completed_section.`course_id`
FROM `students` demo_student
INNER JOIN `users` demo_user
  ON demo_user.`user_id` = demo_student.`user_id`
INNER JOIN `enrollments` completed_enrollment
  ON completed_enrollment.`student_id` = demo_student.`student_id`
 AND completed_enrollment.`status` = 'completed'
INNER JOIN `sections` completed_section
  ON completed_section.`section_id` = completed_enrollment.`section_id`
WHERE demo_user.`email` = 'walke_etha001@guru.edu';

CREATE TEMPORARY TABLE `seed_professor_current_sections` AS
SELECT
  section_record.`section_id`,
  course_record.`course_code`,
  section_record.`capacity`
FROM `sections` section_record
INNER JOIN `courses` course_record
  ON course_record.`course_id` = section_record.`course_id`
INNER JOIN `professors` professor_record
  ON professor_record.`professor_id` = section_record.`professor_id`
INNER JOIN `users` professor_user
  ON professor_user.`user_id` = professor_record.`user_id`
INNER JOIN (
  SELECT `semester_id`
  FROM `semesters`
  ORDER BY `year` DESC, `semester_id` DESC
  LIMIT 1
) current_semester
  ON current_semester.`semester_id` = section_record.`semester_id`
WHERE professor_user.`email` = 'harpe_dani301@guru.edu';

CREATE TEMPORARY TABLE `seed_demo_waitlist_section` AS
SELECT
  professor_section.`section_id`,
  professor_section.`course_code`,
  professor_section.`capacity`
FROM `seed_professor_current_sections` professor_section
INNER JOIN `courses` course_record
  ON course_record.`course_code` = professor_section.`course_code`
WHERE EXISTS (
    SELECT 1
    FROM `prerequisites` prerequisite_record
    WHERE prerequisite_record.`course_id` = course_record.`course_id`
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `prerequisites` prerequisite_record
    WHERE prerequisite_record.`course_id` = course_record.`course_id`
      AND prerequisite_record.`prerequisite_course_id` NOT IN (
        SELECT `course_id`
        FROM `seed_demo_completed_courses`
      )
  )
ORDER BY professor_section.`course_code` ASC
LIMIT 1;

CREATE TEMPORARY TABLE `seed_demo_waitlist_section_exclusion` AS
SELECT `section_id`
FROM `seed_demo_waitlist_section`;

CREATE TEMPORARY TABLE `seed_demo_professor_targets` AS
SELECT
  1 AS `display_order`,
  waitlist_section.`section_id`,
  waitlist_section.`course_code`,
  waitlist_section.`capacity`,
  1 AS `non_demo_waitlist_count`
FROM `seed_demo_waitlist_section` waitlist_section
UNION ALL
SELECT
  ranked_section.`display_order`,
  ranked_section.`section_id`,
  ranked_section.`course_code`,
  ranked_section.`capacity`,
  CASE WHEN ranked_section.`display_order` = 2 THEN 1 ELSE 0 END AS `non_demo_waitlist_count`
FROM (
  SELECT
    ROW_NUMBER() OVER (ORDER BY professor_section.`course_code` ASC) + 1 AS `display_order`,
    professor_section.`section_id`,
    professor_section.`course_code`,
    professor_section.`capacity`
  FROM `seed_professor_current_sections` professor_section
  LEFT JOIN `seed_demo_waitlist_section_exclusion` waitlist_section_exclusion
    ON waitlist_section_exclusion.`section_id` = professor_section.`section_id`
  WHERE waitlist_section_exclusion.`section_id` IS NULL
  ORDER BY professor_section.`course_code` ASC
  LIMIT 3
) ranked_section;

DELETE enrollment_record
FROM `enrollments` enrollment_record
INNER JOIN `seed_demo_professor_targets` target_section
  ON target_section.`section_id` = enrollment_record.`section_id`;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
WITH
enrollment_ranges AS (
  SELECT
    target_section.`display_order`,
    target_section.`section_id`,
    target_section.`capacity` AS `target_count`,
    COALESCE(
      SUM(target_section.`capacity`) OVER (
        ORDER BY target_section.`display_order`
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ),
      0
    ) + 1 AS `start_rank`,
    SUM(target_section.`capacity`) OVER (
      ORDER BY target_section.`display_order`
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `end_rank`
  FROM `seed_demo_professor_targets` target_section
),
eligible_students AS (
  SELECT
    student_record.`student_id`,
    ROW_NUMBER() OVER (ORDER BY student_record.`student_id`) AS `student_rank`
  FROM `students` student_record
  INNER JOIN `users` user_record
    ON user_record.`user_id` = student_record.`user_id`
  LEFT JOIN `seed_demo_accounts` demo_account
    ON demo_account.`email` = user_record.`email`
  WHERE demo_account.`email` IS NULL
)
SELECT
  eligible_student.`student_id`,
  enrollment_range.`section_id`,
  'enrolled'
FROM `enrollment_ranges` enrollment_range
INNER JOIN `eligible_students` eligible_student
  ON eligible_student.`student_rank` BETWEEN enrollment_range.`start_rank` AND enrollment_range.`end_rank`;

CREATE TEMPORARY TABLE `seed_demo_professor_enrolled_total` AS
SELECT COALESCE(SUM(`capacity`), 0) AS `count_total`
FROM `seed_demo_professor_targets`;

CREATE TEMPORARY TABLE `seed_demo_professor_waitlist_ranges` AS
SELECT
  target_section.`display_order`,
  target_section.`section_id`,
  target_section.`non_demo_waitlist_count` AS `target_count`,
  COALESCE(
    SUM(target_section.`non_demo_waitlist_count`) OVER (
      ORDER BY target_section.`display_order`
      ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
    ),
    0
  ) + 1 AS `start_rank`,
  SUM(target_section.`non_demo_waitlist_count`) OVER (
    ORDER BY target_section.`display_order`
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS `end_rank`
FROM `seed_demo_professor_targets` target_section
WHERE target_section.`non_demo_waitlist_count` > 0;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
WITH
eligible_students AS (
  SELECT
    student_record.`student_id`,
    ROW_NUMBER() OVER (ORDER BY student_record.`student_id`) AS `student_rank`
  FROM `students` student_record
  INNER JOIN `users` user_record
    ON user_record.`user_id` = student_record.`user_id`
  LEFT JOIN `seed_demo_accounts` demo_account
    ON demo_account.`email` = user_record.`email`
  WHERE demo_account.`email` IS NULL
)
SELECT
  eligible_student.`student_id`,
  waitlist_range.`section_id`,
  'waitlisted'
FROM `seed_demo_professor_waitlist_ranges` waitlist_range
INNER JOIN `seed_demo_professor_enrolled_total` enrolled_total_record
INNER JOIN `eligible_students` eligible_student
  ON eligible_student.`student_rank`
     BETWEEN waitlist_range.`start_rank` + enrolled_total_record.`count_total`
         AND waitlist_range.`end_rank` + enrolled_total_record.`count_total`;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
SELECT
  demo_student.`student_id`,
  waitlist_section.`section_id`,
  'waitlisted'
FROM `students` demo_student
INNER JOIN `users` demo_user
  ON demo_user.`user_id` = demo_student.`user_id`
INNER JOIN `seed_demo_waitlist_section` waitlist_section
WHERE demo_user.`email` = 'walke_etha001@guru.edu';

DROP TEMPORARY TABLE IF EXISTS `seed_demo_professor_targets`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_professor_waitlist_ranges`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_professor_enrolled_total`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_waitlist_section_exclusion`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_waitlist_section`;
DROP TEMPORARY TABLE IF EXISTS `seed_professor_current_sections`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_completed_courses`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_accounts`;

COMMIT;
