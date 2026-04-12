USE `registrationdb`;

START TRANSACTION;

CREATE TEMPORARY TABLE `seed_demo_accounts` (
  `email` VARCHAR(100) NOT NULL PRIMARY KEY
);

INSERT INTO `seed_demo_accounts` (`email`) VALUES
('kuros_ichi001@guru.edu'),
('butch_bill301@guru.edu'),
('horne_chri201@guru.edu');

CREATE TEMPORARY TABLE `seed_first_step_targets` (
  `display_order` TINYINT NOT NULL,
  `course_code` VARCHAR(10) NOT NULL,
  `target_mode` ENUM('FULL_WAITLIST', 'HALF_FULL') NOT NULL,
  PRIMARY KEY (`display_order`),
  UNIQUE KEY `uq_seed_first_step_targets_course` (`course_code`)
);

INSERT INTO `seed_first_step_targets` (`display_order`, `course_code`, `target_mode`) VALUES
(1, 'CMSC425', 'FULL_WAITLIST'),
(2, 'ENGL311', 'FULL_WAITLIST'),
(3, 'ENGL389', 'FULL_WAITLIST'),
(4, 'HIST461', 'FULL_WAITLIST'),
(5, 'CMSC405', 'HALF_FULL'),
(6, 'CMSC345', 'HALF_FULL'),
(7, 'IFSM380', 'HALF_FULL'),
(8, 'IFSM486B', 'HALF_FULL');

CREATE TEMPORARY TABLE `seed_first_step_sections` AS
SELECT
  target.`display_order`,
  target.`course_code`,
  target.`target_mode`,
  section_pick.`section_id`,
  section_pick.`capacity`
FROM `seed_first_step_targets` target
INNER JOIN `courses` course_record
  ON course_record.`course_code` = target.`course_code`
INNER JOIN (
  SELECT
    MIN(section_record.`section_id`) AS `section_id`,
    section_record.`course_id`,
    section_record.`semester_id`
  FROM `sections` section_record
  GROUP BY section_record.`course_id`, section_record.`semester_id`
) section_choice
  ON section_choice.`course_id` = course_record.`course_id`
INNER JOIN `sections` section_pick
  ON section_pick.`section_id` = section_choice.`section_id`
INNER JOIN (
  SELECT `semester_id`
  FROM `semesters`
  ORDER BY `year` DESC, `semester_id` DESC
  LIMIT 1
) current_semester
  ON current_semester.`semester_id` = section_choice.`semester_id`;

DELETE enrollment_record
FROM `enrollments` enrollment_record
INNER JOIN `seed_first_step_sections` first_step_section
  ON first_step_section.`section_id` = enrollment_record.`section_id`;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
SELECT
  student_record.`student_id`,
  first_step_section.`section_id`,
  'enrolled'
FROM `students` student_record
INNER JOIN `users` user_record
  ON user_record.`user_id` = student_record.`user_id`
INNER JOIN `seed_first_step_sections` first_step_section
  ON first_step_section.`course_code` = 'CMSC425'
WHERE user_record.`email` = 'kuros_ichi001@guru.edu';

CREATE TEMPORARY TABLE `seed_first_step_enrollment_targets` AS
WITH seeded_counts AS (
  SELECT
    first_step_section.`display_order`,
    first_step_section.`section_id`,
    first_step_section.`target_mode`,
    first_step_section.`capacity`,
    COALESCE(COUNT(CASE WHEN enrollment_record.`status` = 'enrolled' THEN 1 END), 0) AS `existing_enrolled`
  FROM `seed_first_step_sections` first_step_section
  LEFT JOIN `enrollments` enrollment_record
    ON enrollment_record.`section_id` = first_step_section.`section_id`
  GROUP BY
    first_step_section.`display_order`,
    first_step_section.`section_id`,
    first_step_section.`target_mode`,
    first_step_section.`capacity`
),
enrollment_targets AS (
  SELECT
    seeded_count.`display_order`,
    seeded_count.`section_id`,
    GREATEST(
      CASE
        WHEN seeded_count.`target_mode` = 'FULL_WAITLIST' THEN seeded_count.`capacity`
        ELSE FLOOR(seeded_count.`capacity` / 2)
      END - seeded_count.`existing_enrolled`,
      0
    ) AS `target_count`
  FROM `seeded_counts` seeded_count
)
SELECT
  enrollment_target.`display_order`,
  enrollment_target.`section_id`,
  enrollment_target.`target_count`
FROM `enrollment_targets` enrollment_target;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
WITH
target_ranges AS (
  SELECT
    enrollment_target.`display_order`,
    enrollment_target.`section_id`,
    enrollment_target.`target_count`,
    COALESCE(
      SUM(enrollment_target.`target_count`) OVER (
        ORDER BY enrollment_target.`display_order`
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ),
      0
    ) + 1 AS `start_rank`,
    SUM(enrollment_target.`target_count`) OVER (
      ORDER BY enrollment_target.`display_order`
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `end_rank`
  FROM `seed_first_step_enrollment_targets` enrollment_target
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
  target_range.`section_id`,
  'enrolled'
FROM `target_ranges` target_range
INNER JOIN `eligible_students` eligible_student
  ON eligible_student.`student_rank` BETWEEN target_range.`start_rank` AND target_range.`end_rank`
WHERE target_range.`target_count` > 0;

CREATE TEMPORARY TABLE `seed_first_step_waitlist_targets` AS
SELECT
  first_step_section.`display_order`,
  first_step_section.`section_id`,
  CASE
    WHEN first_step_section.`target_mode` = 'FULL_WAITLIST' THEN 2
    ELSE 0
  END AS `target_count`
FROM `seed_first_step_sections` first_step_section;

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
WITH
enrolled_total AS (
  SELECT COALESCE(SUM(`target_count`), 0) AS `count_total`
  FROM `seed_first_step_enrollment_targets`
),
waitlist_targets AS (
  SELECT
    waitlist_target.`display_order`,
    waitlist_target.`section_id`,
    waitlist_target.`target_count`
  FROM `seed_first_step_waitlist_targets` waitlist_target
),
waitlist_ranges AS (
  SELECT
    waitlist_target.`display_order`,
    waitlist_target.`section_id`,
    waitlist_target.`target_count`,
    COALESCE(
      SUM(waitlist_target.`target_count`) OVER (
        ORDER BY waitlist_target.`display_order`
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ),
      0
    ) + 1 AS `start_rank`,
    SUM(waitlist_target.`target_count`) OVER (
      ORDER BY waitlist_target.`display_order`
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `end_rank`
  FROM `waitlist_targets` waitlist_target
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
  waitlist_range.`section_id`,
  'waitlisted'
FROM `waitlist_ranges` waitlist_range
INNER JOIN `enrolled_total` enrolled_total_record
INNER JOIN `eligible_students` eligible_student
  ON eligible_student.`student_rank`
     BETWEEN waitlist_range.`start_rank` + enrolled_total_record.`count_total`
         AND waitlist_range.`end_rank` + enrolled_total_record.`count_total`
WHERE waitlist_range.`target_count` > 0;

DROP TEMPORARY TABLE IF EXISTS `seed_first_step_waitlist_targets`;
DROP TEMPORARY TABLE IF EXISTS `seed_first_step_enrollment_targets`;
DROP TEMPORARY TABLE IF EXISTS `seed_first_step_sections`;
DROP TEMPORARY TABLE IF EXISTS `seed_first_step_targets`;
DROP TEMPORARY TABLE IF EXISTS `seed_demo_accounts`;

COMMIT;
