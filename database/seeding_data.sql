-- Consolidated seed data for registrationdb
USE `registrationdb`;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `prerequisites`;
DELETE FROM `enrollments`;
DELETE FROM `sections`;
DELETE FROM `students`;
DELETE FROM `professors`;
DELETE FROM `admins`;
DELETE FROM `semesters`;
DELETE FROM `courses`;
DELETE FROM `users`;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `admins` AUTO_INCREMENT = 1000;
ALTER TABLE `courses` AUTO_INCREMENT = 1;
ALTER TABLE `professors` AUTO_INCREMENT = 1000;
ALTER TABLE `semesters` AUTO_INCREMENT = 1;
ALTER TABLE `sections` AUTO_INCREMENT = 5500;
ALTER TABLE `students` AUTO_INCREMENT = 10000000;
ALTER TABLE `enrollments` AUTO_INCREMENT = 1;

CREATE TEMPORARY TABLE `seed_admin_pool` (
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `access_level` INT NOT NULL
);

-- Primary demo admin account used in walkthroughs and validation.
INSERT INTO `seed_admin_pool` (`name`, `email`, `access_level`) VALUES
('Caroline Hughes', 'hughe_caro201@guru.edu', 10),
('Thomas Reed', 'reed_thom202@guru.edu', 10),
('Lauren Brooks', 'brook_laur203@guru.edu', 10),
('Kevin Foster', 'foste_kevi204@guru.edu', 10),
('Megan Price', 'price_mega205@guru.edu', 10);

CREATE TEMPORARY TABLE `seed_faculty_pool` (
  `department` VARCHAR(45) NOT NULL,
  `slot` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL
);

-- Primary demo professor account used in walkthroughs and validation.
INSERT INTO `seed_faculty_pool` (`department`, `slot`, `name`, `email`) VALUES
('Computer Science', 1, 'Daniel Harper', 'harpe_dani301@guru.edu'),
('Computer Science', 2, 'Rachel Morgan', 'morga_rach302@guru.edu'),
('Computer Science', 3, 'Tyler Bennett', 'benne_tyle303@guru.edu'),
('Computer Science', 4, 'Nicole Hayes', 'hayes_nico304@guru.edu'),
('Computer Science', 5, 'Brandon Cooper', 'coope_bran305@guru.edu'),
('Computer Science', 6, 'Samantha Reed', 'reed_sama306@guru.edu'),
('Mathematics', 1, 'Andrew Carter', 'carte_andr307@guru.edu'),
('Mathematics', 2, 'Melissa Turner', 'turne_meli308@guru.edu'),
('Mathematics', 3, 'Joshua Parker', 'parke_josh309@guru.edu'),
('Mathematics', 4, 'Hannah Brooks', 'brook_hann310@guru.edu'),
('Mathematics', 5, 'Ryan Mitchell', 'mitch_ryan311@guru.edu'),
('Mathematics', 6, 'Lauren Bailey', 'baila_laur312@guru.edu'),
('English', 1, 'Emily Ward', 'ward_emil313@guru.edu'),
('English', 2, 'Nathan Perry', 'perry_nath314@guru.edu'),
('English', 3, 'Grace Powell', 'powel_grac315@guru.edu'),
('English', 4, 'Adam Jenkins', 'jenki_adam316@guru.edu'),
('English', 5, 'Victoria Howard', 'howar_vict317@guru.edu'),
('English', 6, 'Jordan Gray', 'gray_jord318@guru.edu'),
('History', 1, 'Sarah Collins', 'colli_sara319@guru.edu'),
('History', 2, 'Brian Stewart', 'stewa_bria320@guru.edu'),
('History', 3, 'Erin Peterson', 'peter_erin321@guru.edu'),
('History', 4, 'Kyle Richardson', 'richa_kyle322@guru.edu'),
('History', 5, 'Amber Cox', 'cox_ambe323@guru.edu'),
('History', 6, 'Sean Hughes', 'hughe_sean324@guru.edu'),
('Physics', 1, 'Justin Sanders', 'sande_just325@guru.edu'),
('Physics', 2, 'Brittany Price', 'price_brit326@guru.edu'),
('Physics', 3, 'Connor Kelly', 'kelly_conn327@guru.edu'),
('Physics', 4, 'Vanessa Bryant', 'bryan_vane328@guru.edu'),
('Physics', 5, 'Derek Russell', 'russe_dere329@guru.edu'),
('Physics', 6, 'Paige Griffin', 'griff_paig330@guru.edu'),
('Chemistry', 1, 'Austin Hayes', 'hayes_aust331@guru.edu'),
('Chemistry', 2, 'Madison Bennett', 'benne_madi332@guru.edu'),
('Chemistry', 3, 'Evan Carter', 'carte_evan333@guru.edu'),
('Chemistry', 4, 'Natalie Brooks', 'brook_nata334@guru.edu'),
('Chemistry', 5, 'Cole Foster', 'foste_cole335@guru.edu'),
('Chemistry', 6, 'Morgan Reed', 'reed_morg336@guru.edu'),
('Nursing', 1, 'Kayla Turner', 'turne_kayl337@guru.edu'),
('Nursing', 2, 'Jason Parker', 'parke_jaso338@guru.edu'),
('Nursing', 3, 'Brooke Bailey', 'baila_broo339@guru.edu'),
('Nursing', 4, 'Zachary Cooper', 'coope_zach340@guru.edu'),
('Nursing', 5, 'Alyssa Ward', 'ward_alys341@guru.edu'),
('Nursing', 6, 'Travis Jenkins', 'jenki_trav342@guru.edu'),
('Information Systems Management', 1, 'Dylan Morgan', 'morga_dyla343@guru.edu'),
('Information Systems Management', 2, 'Claire Mitchell', 'mitch_clai344@guru.edu'),
('Information Systems Management', 3, 'Ethan Howard', 'howar_etha345@guru.edu'),
('Information Systems Management', 4, 'Molly Price', 'price_moll346@guru.edu'),
('Information Systems Management', 5, 'Austin Reed', 'reed_aust347@guru.edu'),
('Information Systems Management', 6, 'Sydney Harper', 'harpe_sydn348@guru.edu');

CREATE TEMPORARY TABLE `seed_student_name_pool` (
  `seed_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`seed_id`)
);

-- Primary demo student account used in walkthroughs and validation.
INSERT INTO `seed_student_name_pool` (`name`) VALUES
('Ethan Walker'), ('Olivia Walker'), ('Noah Walker'), ('Emma Walker'), ('Liam Walker'), ('Ava Walker'), ('Mason Walker'), ('Sophia Walker'), ('Logan Walker'), ('Isabella Walker'),
('Lucas Walker'), ('Mia Walker'), ('Jackson Walker'), ('Charlotte Walker'), ('Aiden Walker'), ('Amelia Walker'), ('James Walker'), ('Harper Walker'), ('Benjamin Walker'), ('Evelyn Walker'),
('Elijah Walker'), ('Abigail Walker'), ('Jacob Walker'), ('Emily Walker'), ('Michael Walker'), ('Ethan Bennett'), ('Olivia Bennett'), ('Noah Bennett'), ('Emma Bennett'), ('Liam Bennett'),
('Ava Bennett'), ('Mason Bennett'), ('Sophia Bennett'), ('Logan Bennett'), ('Isabella Bennett'), ('Lucas Bennett'), ('Mia Bennett'), ('Jackson Bennett'), ('Charlotte Bennett'), ('Aiden Bennett'),
('Amelia Bennett'), ('James Bennett'), ('Harper Bennett'), ('Benjamin Bennett'), ('Evelyn Bennett'), ('Elijah Bennett'), ('Abigail Bennett'), ('Jacob Bennett'), ('Emily Bennett'), ('Michael Bennett'),
('Ethan Carter'), ('Olivia Carter'), ('Noah Carter'), ('Emma Carter'), ('Liam Carter'), ('Ava Carter'), ('Mason Carter'), ('Sophia Carter'), ('Logan Carter'), ('Isabella Carter'),
('Lucas Carter'), ('Mia Carter'), ('Jackson Carter'), ('Charlotte Carter'), ('Aiden Carter'), ('Amelia Carter'), ('James Carter'), ('Harper Carter'), ('Benjamin Carter'), ('Evelyn Carter'),
('Elijah Carter'), ('Abigail Carter'), ('Jacob Carter'), ('Emily Carter'), ('Michael Carter'), ('Ethan Mitchell'), ('Olivia Mitchell'), ('Noah Mitchell'), ('Emma Mitchell'), ('Liam Mitchell'),
('Ava Mitchell'), ('Mason Mitchell'), ('Sophia Mitchell'), ('Logan Mitchell'), ('Isabella Mitchell'), ('Lucas Mitchell'), ('Mia Mitchell'), ('Jackson Mitchell'), ('Charlotte Mitchell'), ('Aiden Mitchell'),
('Amelia Mitchell'), ('James Mitchell'), ('Harper Mitchell'), ('Benjamin Mitchell'), ('Evelyn Mitchell'), ('Elijah Mitchell'), ('Abigail Mitchell'), ('Jacob Mitchell'), ('Emily Mitchell'), ('Michael Mitchell'),
('Ethan Turner'), ('Olivia Turner'), ('Noah Turner'), ('Emma Turner'), ('Liam Turner'), ('Ava Turner'), ('Mason Turner'), ('Sophia Turner'), ('Logan Turner'), ('Isabella Turner'),
('Lucas Turner'), ('Mia Turner'), ('Jackson Turner'), ('Charlotte Turner'), ('Aiden Turner'), ('Amelia Turner'), ('James Turner'), ('Harper Turner'), ('Benjamin Turner'), ('Evelyn Turner'),
('Elijah Turner'), ('Abigail Turner'), ('Jacob Turner'), ('Emily Turner'), ('Michael Turner'), ('Ethan Hayes'), ('Olivia Hayes'), ('Noah Hayes'), ('Emma Hayes'), ('Liam Hayes'),
('Ava Hayes'), ('Mason Hayes'), ('Sophia Hayes'), ('Logan Hayes'), ('Isabella Hayes'), ('Lucas Hayes'), ('Mia Hayes'), ('Jackson Hayes'), ('Charlotte Hayes'), ('Aiden Hayes'),
('Amelia Hayes'), ('James Hayes'), ('Harper Hayes'), ('Benjamin Hayes'), ('Evelyn Hayes'), ('Elijah Hayes'), ('Abigail Hayes'), ('Jacob Hayes'), ('Emily Hayes'), ('Michael Hayes'),
('Ethan Parker'), ('Olivia Parker'), ('Noah Parker'), ('Emma Parker'), ('Liam Parker'), ('Ava Parker'), ('Mason Parker'), ('Sophia Parker'), ('Logan Parker'), ('Isabella Parker'),
('Lucas Parker'), ('Mia Parker'), ('Jackson Parker'), ('Charlotte Parker'), ('Aiden Parker'), ('Amelia Parker'), ('James Parker'), ('Harper Parker'), ('Benjamin Parker'), ('Evelyn Parker'),
('Elijah Parker'), ('Abigail Parker'), ('Jacob Parker'), ('Emily Parker'), ('Michael Parker'), ('Ethan Brooks'), ('Olivia Brooks'), ('Noah Brooks'), ('Emma Brooks'), ('Liam Brooks'),
('Ava Brooks'), ('Mason Brooks'), ('Sophia Brooks'), ('Logan Brooks'), ('Isabella Brooks'), ('Lucas Brooks'), ('Mia Brooks'), ('Jackson Brooks'), ('Charlotte Brooks'), ('Aiden Brooks'),
('Amelia Brooks'), ('James Brooks'), ('Harper Brooks'), ('Benjamin Brooks'), ('Evelyn Brooks'), ('Elijah Brooks'), ('Abigail Brooks'), ('Jacob Brooks'), ('Emily Brooks'), ('Michael Brooks'),
('Ethan Cooper'), ('Olivia Cooper'), ('Noah Cooper'), ('Emma Cooper'), ('Liam Cooper'), ('Ava Cooper'), ('Mason Cooper'), ('Sophia Cooper'), ('Logan Cooper'), ('Isabella Cooper'),
('Lucas Cooper'), ('Mia Cooper'), ('Jackson Cooper'), ('Charlotte Cooper'), ('Aiden Cooper'), ('Amelia Cooper'), ('James Cooper'), ('Harper Cooper'), ('Benjamin Cooper'), ('Evelyn Cooper'),
('Elijah Cooper'), ('Abigail Cooper'), ('Jacob Cooper'), ('Emily Cooper'), ('Michael Cooper'), ('Ethan Reed'), ('Olivia Reed'), ('Noah Reed'), ('Emma Reed'), ('Liam Reed'),
('Ava Reed'), ('Mason Reed'), ('Sophia Reed'), ('Logan Reed'), ('Isabella Reed'), ('Lucas Reed'), ('Mia Reed'), ('Jackson Reed'), ('Charlotte Reed'), ('Aiden Reed'),
('Amelia Reed'), ('James Reed'), ('Harper Reed'), ('Benjamin Reed'), ('Evelyn Reed'), ('Elijah Reed'), ('Abigail Reed'), ('Jacob Reed'), ('Emily Reed'), ('Michael Reed'),
('Ethan Morgan'), ('Olivia Morgan'), ('Noah Morgan'), ('Emma Morgan'), ('Liam Morgan'), ('Ava Morgan'), ('Mason Morgan'), ('Sophia Morgan'), ('Logan Morgan'), ('Isabella Morgan'),
('Lucas Morgan'), ('Mia Morgan'), ('Jackson Morgan'), ('Charlotte Morgan'), ('Aiden Morgan'), ('Amelia Morgan'), ('James Morgan'), ('Harper Morgan'), ('Benjamin Morgan'), ('Evelyn Morgan'),
('Elijah Morgan'), ('Abigail Morgan'), ('Jacob Morgan'), ('Emily Morgan'), ('Michael Morgan'), ('Ethan Bailey'), ('Olivia Bailey'), ('Noah Bailey'), ('Emma Bailey'), ('Liam Bailey'),
('Ava Bailey'), ('Mason Bailey'), ('Sophia Bailey'), ('Logan Bailey'), ('Isabella Bailey'), ('Lucas Bailey'), ('Mia Bailey'), ('Jackson Bailey'), ('Charlotte Bailey'), ('Aiden Bailey'),
('Amelia Bailey'), ('James Bailey'), ('Harper Bailey'), ('Benjamin Bailey'), ('Evelyn Bailey'), ('Elijah Bailey'), ('Abigail Bailey'), ('Jacob Bailey'), ('Emily Bailey'), ('Michael Bailey'),
('Ethan Foster'), ('Olivia Foster'), ('Noah Foster'), ('Emma Foster'), ('Liam Foster'), ('Ava Foster'), ('Mason Foster'), ('Sophia Foster'), ('Logan Foster'), ('Isabella Foster'),
('Lucas Foster'), ('Mia Foster'), ('Jackson Foster'), ('Charlotte Foster'), ('Aiden Foster'), ('Amelia Foster'), ('James Foster'), ('Harper Foster'), ('Benjamin Foster'), ('Evelyn Foster'),
('Elijah Foster'), ('Abigail Foster'), ('Jacob Foster'), ('Emily Foster'), ('Michael Foster'), ('Ethan Gray'), ('Olivia Gray'), ('Noah Gray'), ('Emma Gray'), ('Liam Gray'),
('Ava Gray'), ('Mason Gray'), ('Sophia Gray'), ('Logan Gray'), ('Isabella Gray'), ('Lucas Gray'), ('Mia Gray'), ('Jackson Gray'), ('Charlotte Gray'), ('Aiden Gray'),
('Amelia Gray'), ('James Gray'), ('Harper Gray'), ('Benjamin Gray'), ('Evelyn Gray'), ('Elijah Gray'), ('Abigail Gray'), ('Jacob Gray'), ('Emily Gray'), ('Michael Gray'),
('Ethan Price'), ('Olivia Price'), ('Noah Price'), ('Emma Price'), ('Liam Price'), ('Ava Price'), ('Mason Price'), ('Sophia Price'), ('Logan Price'), ('Isabella Price'),
('Lucas Price'), ('Mia Price'), ('Jackson Price'), ('Charlotte Price'), ('Aiden Price'), ('Amelia Price'), ('James Price'), ('Harper Price'), ('Benjamin Price'), ('Evelyn Price'),
('Elijah Price'), ('Abigail Price'), ('Jacob Price'), ('Emily Price'), ('Michael Price'), ('Ethan Ward'), ('Olivia Ward'), ('Noah Ward'), ('Emma Ward'), ('Liam Ward'),
('Ava Ward'), ('Mason Ward'), ('Sophia Ward'), ('Logan Ward'), ('Isabella Ward'), ('Lucas Ward'), ('Mia Ward'), ('Jackson Ward'), ('Charlotte Ward'), ('Aiden Ward'),
('Amelia Ward'), ('James Ward'), ('Harper Ward'), ('Benjamin Ward'), ('Evelyn Ward'), ('Elijah Ward'), ('Abigail Ward'), ('Jacob Ward'), ('Emily Ward'), ('Michael Ward'),
('Ethan Perry'), ('Olivia Perry'), ('Noah Perry'), ('Emma Perry'), ('Liam Perry'), ('Ava Perry'), ('Mason Perry'), ('Sophia Perry'), ('Logan Perry'), ('Isabella Perry'),
('Lucas Perry'), ('Mia Perry'), ('Jackson Perry'), ('Charlotte Perry'), ('Aiden Perry'), ('Amelia Perry'), ('James Perry'), ('Harper Perry'), ('Benjamin Perry'), ('Evelyn Perry'),
('Elijah Perry'), ('Abigail Perry'), ('Jacob Perry'), ('Emily Perry'), ('Michael Perry'), ('Ethan Powell'), ('Olivia Powell'), ('Noah Powell'), ('Emma Powell'), ('Liam Powell'),
('Ava Powell'), ('Mason Powell'), ('Sophia Powell'), ('Logan Powell'), ('Isabella Powell'), ('Lucas Powell'), ('Mia Powell'), ('Jackson Powell'), ('Charlotte Powell'), ('Aiden Powell'),
('Amelia Powell'), ('James Powell'), ('Harper Powell'), ('Benjamin Powell'), ('Evelyn Powell'), ('Elijah Powell'), ('Abigail Powell'), ('Jacob Powell'), ('Emily Powell'), ('Michael Powell'),
('Ethan Howard'), ('Olivia Howard'), ('Noah Howard'), ('Emma Howard'), ('Liam Howard'), ('Ava Howard'), ('Mason Howard'), ('Sophia Howard'), ('Logan Howard'), ('Isabella Howard'),
('Lucas Howard'), ('Mia Howard'), ('Jackson Howard'), ('Charlotte Howard'), ('Aiden Howard'), ('Amelia Howard'), ('James Howard'), ('Harper Howard'), ('Benjamin Howard'), ('Evelyn Howard'),
('Elijah Howard'), ('Abigail Howard'), ('Jacob Howard'), ('Emily Howard'), ('Michael Howard'), ('Ethan Jenkins'), ('Olivia Jenkins'), ('Noah Jenkins'), ('Emma Jenkins'), ('Liam Jenkins'),
('Ava Jenkins'), ('Mason Jenkins'), ('Sophia Jenkins'), ('Logan Jenkins'), ('Isabella Jenkins'), ('Lucas Jenkins'), ('Mia Jenkins'), ('Jackson Jenkins'), ('Charlotte Jenkins'), ('Aiden Jenkins'),
('Amelia Jenkins'), ('James Jenkins'), ('Harper Jenkins'), ('Benjamin Jenkins'), ('Evelyn Jenkins'), ('Elijah Jenkins'), ('Abigail Jenkins'), ('Jacob Jenkins'), ('Emily Jenkins'), ('Michael Jenkins');

CREATE TEMPORARY TABLE `seed_student_pool` (
  `seed_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `major` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`seed_id`)
);

INSERT INTO `seed_student_pool` (`name`, `email`, `major`)
SELECT
  snp.`name`,
  CONCAT(
    LOWER(
      LEFT(
        REPLACE(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(TRIM(snp.`name`), ' ', -1), '''', ''), '-', ''), '.', ''), '`', ''),
        5
      )
    ),
    '_',
    LOWER(
      LEFT(
        REPLACE(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(TRIM(snp.`name`), ' ', 1), '''', ''), '-', ''), '.', ''), '`', ''),
        4
      )
    ),
    LPAD(snp.`seed_id`, 3, '0'),
    '@guru.edu'
  ) AS `email`,
  CASE MOD(snp.`seed_id` - 1, 8)
    WHEN 0 THEN 'Computer Science'
    WHEN 1 THEN 'Mathematics'
    WHEN 2 THEN 'English'
    WHEN 3 THEN 'History'
    WHEN 4 THEN 'Physics'
    WHEN 5 THEN 'Chemistry'
    WHEN 6 THEN 'Nursing'
    ELSE 'Information Systems Management'
  END AS `major`
FROM `seed_student_name_pool` snp
ORDER BY snp.`seed_id`
LIMIT 500;

-- CODEX_SEED_USER_INSERTION_POINT

INSERT INTO `admins` (`user_id`, `access_level`)
SELECT u.`user_id`, sap.`access_level`
FROM `seed_admin_pool` sap
JOIN `users` u ON u.`email` = sap.`email`;

INSERT INTO `professors` (`user_id`, `department`)
SELECT u.`user_id`, fp.`department`
FROM `seed_faculty_pool` fp
JOIN `users` u ON u.`email` = fp.`email`;

INSERT INTO `students` (`user_id`, `major`)
SELECT u.`user_id`, sp.`major`
FROM `seed_student_pool` sp
JOIN `users` u ON u.`email` = sp.`email`;

INSERT INTO `courses` (`course_code`, `title`, `description`, `credits`) VALUES
('CHEM103', 'General Chemistry I', 'Introductory general chemistry course focused on matter, chemical calculations, and foundational laboratory science concepts.', 4),
('CHEM113', 'General Chemistry II', 'Continuation of general chemistry covering kinetics, equilibria, electrochemistry, and chemistry of the elements.', 4),
('CHEM121', 'Chemistry in the Modern World', 'Survey of chemistry for non-science majors with emphasis on health, safety, the environment, and everyday decision-making.', 3),
('CHEM297', 'Environmental Chemistry', 'Applied chemistry course focused on chemical processes in natural systems and environmental impacts on air, water, and soil.', 3),
('CMSC100', 'Social Networking and Cybersecurity Best Practices', 'Hands-on introduction to social networking tools and personal cybersecurity practices for safe online collaboration.', 3),
('CMSC105', 'Introduction to Problem-Solving and Algorithm Design', 'Applied introduction to algorithmic thinking and programming problem solving using core programming constructs.', 3),
('CMSC115', 'Fundamentals of Programming and Software Development', 'Foundation course in programming and software development with emphasis on coding, debugging, and documentation.', 3),
('CMSC150', 'Introduction to Discrete Structures', 'Introduction to logic, sets, functions, relations, graphs, trees, and proof techniques used in computer science.', 3),
('CMSC215', 'Object Oriented Programming', 'Study of object-oriented software development using classes, inheritance, interfaces, and exception handling.', 3),
('CMSC220', 'Intermediate Programming', 'Intermediate programming course that strengthens software construction, testing, and object-oriented design skills.', 3),
('CMSC310', 'Computer Systems and Architecture', 'Study of computer architecture, data representation, assembly language, memory, and processor organization.', 3),
('CMSC315', 'Data Structures and Analysis', 'Project-driven study of lists, stacks, queues, trees, graphs, recursion, sorting, and algorithm analysis.', 3),
('CMSC320', 'Relational Database Concepts and Applications', 'Study of relational database design, normalization, SQL, and database implementation concepts.', 3),
('CMSC325', 'Game Design and Development', 'Project-based introduction to modern game design and development concepts, tools, and production workflows.', 3),
('CMSC330', 'Advanced Programming Languages', 'Comparative study of programming language design, syntax, semantics, and runtime behavior.', 3),
('CMSC335', 'Object-Oriented and Concurrent Programming', 'Applied study of modern Java programming with emphasis on concurrency, streams, and scalable software construction.', 3),
('CMSC340', 'Web Programming', 'Course on modern web application development covering HTTP, HTML, CSS, JavaScript, server-side design, and security.', 3),
('CMSC345', 'Software Engineering Principles and Techniques', 'Introduction to software engineering processes, planning, teamwork, quality, and development lifecycle practices.', 3),
('CMSC405', 'Computer Graphics', 'Hands-on introduction to computer graphics with 2D and 3D rendering, animation, and OpenGL-based programming.', 3),
('CMSC412', 'Operating Systems', 'Study of operating system fundamentals including processes, resources, memory management, and system design.', 3),
('CMSC415', 'Distributed Database Systems', 'Examination of distributed database architecture, distributed design, and related big data and NoSQL concepts.', 3),
('CMSC420', 'Advanced Relational Database Concepts and Applications', 'Advanced database course covering enterprise SQL, procedures, triggers, warehousing, and administration concepts.', 3),
('CMSC425', 'Mobile App Development', 'Study of Android mobile application design and development with emphasis on architecture, interfaces, and privacy.', 3),
('CMSC427', 'Artificial Intelligence Foundations', 'Introduction to artificial intelligence theory and practice, including search, knowledge representation, logic, and learning.', 3),
('CMSC430', 'Compiler Theory and Design', 'Study of language translation, parsing, grammars, and code generation in compiler construction.', 3),
('CMSC440', 'Advanced Programming in Java', 'Advanced full-stack and enterprise-style Java programming with emphasis on maintainable, secure web applications.', 3),
('CMSC451', 'Design and Analysis of Computer Algorithms', 'Study of algorithm design strategies, correctness, and asymptotic analysis for complex computational problems.', 3),
('CMSC465', 'Image and Signal Processing', 'Project-driven study of signal analysis, filtering, Fourier methods, image transformation, and classification.', 3),
('CMSC486A', 'Workplace Learning in Computer Science', 'Supervised workplace learning course integrating computer science study with guided professional experience.', 3),
('CMSC486B', 'Workplace Learning in Computer Science', 'Extended supervised workplace learning course integrating computer science study with guided professional experience.', 6),
('CMSC495', 'Computer Science Capstone', 'Capstone course focused on planning, building, testing, and documenting collaborative computer science projects.', 3),
('CMSC498', 'Special Topics in Computer Science', 'Seminar course covering selected advanced or emerging topics in computer science.', 3),
('ENGL102', 'Composition and Literature', 'Writing-intensive literature course focused on analysis, academic writing, and interpretation of literary texts.', 3),
('ENGL103', 'Introduction to Mythology', 'Survey of classical mythology and its continuing influence on literature, culture, and modern society.', 3),
('ENGL240', 'Introduction to Fiction, Poetry, and Drama', 'Introduction to literary genres with emphasis on close reading, interpretation, and analytical writing.', 3),
('ENGL250', 'Introduction to Women''s Literature', 'Survey of literature by and about women across cultures and historical periods.', 3),
('ENGL281', 'Standard English Grammar', 'Advanced study of standard edited English focused on grammar, clarity, and effective prose.', 3),
('ENGL294', 'Introduction to Creative Writing', 'Introductory creative writing course focused on drafting, revision, critique, and literary craft.', 3),
('ENGL303', 'Critical Approaches to Literature', 'Foundation course in literary criticism, close reading, and analytical writing.', 3),
('ENGL310', 'Renaissance Literature', 'Study of major British authors and texts from the English Renaissance.', 3),
('ENGL311', 'The Long 18th-Century British Literature', 'Study of major British authors and literary works from the Restoration through the Age of Sensibility.', 3),
('ENGL312', '19th-Century British Literature', 'Study of major British authors and works from the Romantic and Victorian periods.', 3),
('ENGL363', 'African American Authors from the Colonial Era to 1900', 'Study of African American authors before 1900 in literary and historical context.', 3),
('ENGL364', 'African American Authors from 1900 to Present', 'Study of modern and contemporary African American authors in historical and literary context.', 3),
('ENGL381', 'Special Topics in Creative Writing', 'Creative writing workshop course exploring selected genres, forms, and special writing topics.', 3),
('ENGL384', 'Advanced Grammar and Style', 'Advanced writing course focused on grammar, style, editing, rhetorical control, and polished prose.', 3),
('ENGL386', 'History of the English Language', 'Study of the development, structure, and continuing evolution of the English language.', 3),
('ENGL389', 'Writing Workshop', 'Workshop-based writing course centered on drafting, peer review, revision, and portfolio development.', 3),
('ENGL406', 'Shakespeare Studies', 'Intensive study of Shakespeare''s works in literary, historical, and cultural context.', 3),
('ENGL418', 'Major British Writers Before 1800', 'Focused study of major British writers before 1800 using historical and critical perspectives.', 3),
('ENGL430', 'Early American Literature', 'Survey of early American literature across key periods, movements, and historical developments.', 3),
('ENGL433', 'Modern American Literature', 'Study of modern American literature with emphasis on modernism, context, and critical interpretation.', 3),
('ENGL439', 'Major American Writers', 'Focused study of selected American writers and the historical and cultural influences on their work.', 3),
('ENGL441', 'Postmodern American Literature: 1945 to 1999', 'Study of post-1945 American literature through major themes, movements, and cultural change.', 3),
('ENGL459', 'Contemporary Global Literatures', 'Advanced study of contemporary global literature with attention to region, history, and social justice.', 3),
('ENGL495', 'English Literature Capstone', 'Capstone course integrating literary study, portfolio development, research, and advanced writing.', 3),
('HIST115', 'World History I', 'Survey of world history from prehistory to around 1500 with emphasis on civilizations and global development.', 3),
('HIST116', 'World History II', 'Survey of world history from around 1500 to the present with emphasis on global systems and transformations.', 3),
('HIST125', 'Technological Transformations', 'History course examining the reciprocal relationship between technology, society, and historical change.', 3),
('HIST141', 'Western Civilization I', 'Survey of Western civilization from antiquity through the Reformation.', 3),
('HIST142', 'Western Civilization II', 'Survey of Western civilization from the Reformation to the modern period.', 3),
('HIST156', 'History of the United States to 1865', 'Survey of United States history from colonization through the Civil War era.', 3),
('HIST157', 'History of the United States from 1865', 'Survey of United States history from Reconstruction to the present.', 3),
('HIST202', 'Principles of War', 'Study of classic principles of war and their influence on military and national security practice.', 3),
('HIST289', 'Historical Methods', 'Introduction to historical methods, approaches, ethics, and professional practice in the discipline.', 3),
('HIST309', 'Historical Writing', 'Advanced history course focused on research design, source evaluation, and historical writing.', 3),
('HIST316L', 'The American West', 'Study of the exploration, settlement, development, and mythology of the American West.', 3),
('HIST326', 'Ancient Rome', 'Study of ancient Rome and the development of Roman institutions, politics, and society.', 3),
('HIST337', 'Europe and the World', 'Analysis of Europe''s interaction with the wider world through empire, culture, and global change.', 3),
('HIST365', 'Modern America', 'Survey of modern United States history from the New Deal through the turn of the 21st century.', 3),
('HIST377', 'U.S. Women''s History: 1870 to 2000', 'Examination of the experiences of women in the United States from 1870 to 2000.', 3),
('HIST381', 'America in Vietnam', 'Historical examination of U.S. involvement in Vietnam and its political, military, and cultural legacy.', 3),
('HIST392', 'History of the Contemporary Middle East', 'Survey of the modern Middle East with emphasis on politics, nationalism, conflict, and global relations.', 3),
('HIST461', 'African American History: 1865 to the Present', 'Study of African American history from emancipation through the modern era.', 3),
('HIST462', 'The U.S. Civil War', 'In-depth examination of the origins, conduct, and consequences of the American Civil War.', 3),
('HIST464', 'World War I', 'Intensive study of the origins, conduct, and impact of the First World War.', 3),
('HIST465', 'World War II', 'Study of the causes, global conflict, and consequences of the Second World War.', 3),
('HIST480', 'History of China to 1912', 'Survey of Chinese history from early civilization through the end of the Qing dynasty.', 3),
('HIST482', 'History of Japan to 1800', 'Survey of Japanese history from its origins through the late Edo period.', 3),
('HIST483', 'History of Japan Since 1800', 'Survey of Japanese history from the modern era to the present.', 3),
('HIST486A', 'Workplace Learning in History', 'Supervised workplace learning course integrating history study with guided professional experience.', 3),
('HIST486B', 'Workplace Learning in History', 'Extended supervised workplace learning course integrating history study with guided professional experience.', 6),
('HIST495', 'History Capstone', 'Capstone research course focused on producing a substantial original historical project.', 3),
('IFSM201', 'Concepts and Applications of Information Technology', 'Introduction to information technology, data, software, hardware, networks, and responsible technology use.', 3),
('IFSM300', 'Information Systems in Organizations', 'Overview of how information systems support organizational goals, processes, and strategy.', 3),
('IFSM301', 'Foundations of Management Information Systems', 'Introduction to IT management, governance, strategic alignment, and decision-making in organizations.', 3),
('IFSM304', 'Ethics in Information Technology', 'Study of ethical decision-making and responsible practice in the use of information technology.', 3),
('IFSM305', 'Information Systems in Healthcare Organizations', 'Examination of how information systems support healthcare strategy, safety, quality, and operations.', 3),
('IFSM310', 'Software and Hardware Infrastructure Concepts', 'Study of computing infrastructure components and integrated systems that support business requirements.', 3),
('IFSM311', 'Enterprise Architecture', 'Study of enterprise architecture frameworks and the alignment of systems with organizational change.', 3),
('IFSM370', 'Telecommunications in Information Systems', 'Introduction to telecommunications, networking, and secure infrastructure planning for business systems.', 3),
('IFSM380', 'Managing and Leading in Information Technology', 'Leadership and management course for information technology professionals in fast-paced workplaces.', 3),
('IFSM432', 'Business Continuity Planning', 'Study of business continuity and disaster recovery planning for mission-critical information systems.', 3),
('IFSM438', 'Information Systems Project Management', 'Applied project management course focused on planning, control, and delivery of IT projects.', 3),
('IFSM441', 'Agile Project Management', 'Advanced study of agile project management methods for software and technology initiatives.', 3),
('IFSM461', 'Systems Analysis and Design', 'Project-driven course on translating business requirements into effective operational systems.', 3),
('IFSM486A', 'Workplace Learning in Management Information Systems', 'Supervised workplace learning course integrating management information systems study with professional experience.', 3),
('IFSM486B', 'Workplace Learning in Management Information Systems', 'Extended supervised workplace learning course integrating management information systems study with professional experience.', 6),
('IFSM495', 'Management Information Systems Capstone', 'Capstone course integrating analysis, planning, design, and problem solving in management information systems.', 3),
('MATH105', 'Topics for Mathematical Literacy', 'Mathematics course covering quantitative reasoning, modeling, finance, probability, and statistical thinking.', 3),
('MATH107', 'College Algebra', 'Study of equations, inequalities, functions, graphing, and mathematical modeling in algebra.', 3),
('MATH108', 'Trigonometry and Analytical Geometry', 'Continuation course in trigonometry, analytic geometry, vectors, sequences, and conic sections.', 3),
('MATH115', 'Pre-Calculus', 'Pre-calculus course emphasizing equations, functions, graphs, and mathematical modeling.', 3),
('MATH140', 'Calculus I', 'Introduction to differential and integral calculus with applications.', 4),
('MATH141', 'Calculus II', 'Continuation of calculus covering advanced integration techniques, sequences, and series.', 4),
('MATH241', 'Calculus III', 'Multivariable calculus course covering vectors, partial derivatives, and multiple integration.', 4),
('MATH246', 'Differential Equations', 'Introduction to ordinary differential equations and mathematical models for physical systems.', 3),
('MATH301', 'Concepts of Real Analysis I', 'Upper-level mathematics course focused on formal proof and real analysis concepts.', 3),
('MATH340', 'Linear Algebra', 'Study of vector spaces, matrices, linear transformations, eigenvalues, and applications.', 4),
('MATH402', 'Algebraic Structures', 'Upper-level abstract algebra course covering groups, rings, fields, and proof techniques.', 3),
('MATH463', 'Complex Analysis', 'Study of complex variables, mappings, integrals, series, and applications.', 3),
('NURS302', 'Transition to Professional Nursing Practice', 'Transition course for registered nurses focused on professional identity, inquiry, communication, and patient safety.', 3),
('NURS322', 'Health Assessment and Wellness Promotion', 'Nursing health assessment course focused on holistic assessment, wellness promotion, and chronic disease management.', 4),
('NURS352', 'Introduction to Nursing Scholarship', 'Study of research methods and scholarly inquiry to support evidence-based nursing practice.', 3),
('NURS372', 'Introduction to Healthcare Informatics Technology in Nursing', 'Nursing informatics course focused on communication technologies, documentation, and ethical use of health information systems.', 3),
('NURS392', 'Policy, Politics, and Economics in Healthcare', 'Study of healthcare policy, politics, economics, advocacy, and equity in nursing practice.', 3),
('NURS412', 'Population, Global, and Community Health Issues', 'Study of community, public, and global health nursing with emphasis on population-focused care.', 3),
('NURS432', 'Leadership in Personal and Professional Nursing Practice', 'Leadership course focused on communication, collaboration, management, and evidence-based nursing leadership.', 3),
('NURS452', 'Complex Healthcare Systems: Quality Improvement and Patient Safety', 'Study of quality improvement, patient safety, systems thinking, and evidence-based solutions in complex healthcare settings.', 3),
('NURS462', 'Nursing Care of the Family and Community', 'Community and family nursing course focused on population health, prevention, and care coordination across settings.', 4),
('NURS472', 'Nursing Practice Experience', 'Practice experience course synthesizing nursing theory, scholarship, leadership, and applied nursing skills.', 2),
('NURS496', 'Nursing Capstone', 'Writing-intensive capstone course focused on evidence-based nursing practice and quality improvement project design.', 3),
('PHYS121', 'Fundamentals of Physics I', 'Introductory physics course covering mechanics, motion, force, and energy.', 4),
('PHYS122', 'Fundamentals of Physics II', 'Continuation of introductory physics covering electricity, magnetism, waves, and related concepts.', 4);

INSERT INTO `semesters` (`term`, `year`) VALUES
('Spring', 2024),
('Summer', 2024),
('Fall', 2024),
('Spring', 2025),
('Summer', 2025),
('Fall', 2025),
('Spring', 2026),
('Fall', 2026);

INSERT INTO `prerequisites`
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CHEM103' AND c.course_code = 'CHEM113'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CHEM113' AND c.course_code = 'CHEM297'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC105' AND c.course_code = 'CMSC115'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC215'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC220'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC310'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC315'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC320'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC325'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC330'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC335'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC340'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC345'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC405'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC310' AND c.course_code = 'CMSC412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC320' AND c.course_code = 'CMSC415'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC320' AND c.course_code = 'CMSC420'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC425'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC427'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC330' AND c.course_code = 'CMSC430'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC220' AND c.course_code = 'CMSC440'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC340' AND c.course_code = 'CMSC440'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC150' AND c.course_code = 'CMSC451'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC451'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'CMSC465'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC465'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC330' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC335' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC345' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL240'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL250'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL281'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL303'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL363'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL364'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL381'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL384'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL386'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL389'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL406'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL418'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL430'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL433'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL439'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL441'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL102' AND c.course_code = 'ENGL459'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL250' AND c.course_code = 'ENGL495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'ENGL303' AND c.course_code = 'ENGL495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST115' AND c.course_code = 'HIST289'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST289' AND c.course_code = 'HIST309'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'HIST289' AND c.course_code = 'HIST495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM301'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM370'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM201' AND c.course_code = 'IFSM380'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM311' AND c.course_code = 'IFSM432'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM300' AND c.course_code = 'IFSM438'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM438' AND c.course_code = 'IFSM441'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM311' AND c.course_code = 'IFSM461'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM438' AND c.course_code = 'IFSM495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'IFSM461' AND c.course_code = 'IFSM495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH107' AND c.course_code = 'MATH108'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH115' AND c.course_code = 'MATH140'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH140' AND c.course_code = 'MATH141'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH140' AND c.course_code = 'MATH340'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH241'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH246'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH301'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH402'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'MATH141' AND c.course_code = 'MATH463'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS352'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS372'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS392'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS412'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS432'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS452'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS302' AND c.course_code = 'NURS462'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'NURS352' AND c.course_code = 'NURS496';

CREATE TEMPORARY TABLE `seed_sections` (
  `seed_id` INT NOT NULL AUTO_INCREMENT,
  `course_code` VARCHAR(10) NOT NULL,
  `term` VARCHAR(8) NOT NULL,
  `year` INT NOT NULL,
  `professor_email` VARCHAR(100) NOT NULL,
  `capacity` INT NOT NULL,
  `days` VARCHAR(10) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  PRIMARY KEY (`seed_id`)
);

INSERT INTO `seed_sections` (`course_code`, `term`, `year`, `professor_email`, `capacity`, `days`, `start_time`, `end_time`)
SELECT
  c.`course_code`,
  sem.`term`,
  sem.`year`,
  fp.`email` AS `professor_email`,
  tmpl.`capacity`,
  tmpl.`days`,
  tmpl.`start_time`,
  tmpl.`end_time`
FROM `courses` c
CROSS JOIN `semesters` sem
JOIN (
  SELECT 1 AS `section_number`, 32 AS `capacity`, 'MW' AS `days`, '08:00:00' AS `start_time`, '10:45:00' AS `end_time`
  UNION ALL
  SELECT 2, 30, 'TR', '08:00:00', '10:45:00'
  UNION ALL
  SELECT 3, 28, 'MW', '11:00:00', '13:45:00'
  UNION ALL
  SELECT 4, 26, 'TR', '11:00:00', '13:45:00'
  UNION ALL
  SELECT 5, 26, 'MW', '14:00:00', '16:45:00'
  UNION ALL
  SELECT 6, 24, 'TR', '14:00:00', '16:45:00'
  UNION ALL
  SELECT 7, 24, 'MTWR', '17:00:00', '18:15:00'
  UNION ALL
  SELECT 8, 22, 'TWRF', '17:00:00', '18:15:00'
) tmpl
JOIN `seed_faculty_pool` fp
  ON fp.`department` = CASE LEFT(c.`course_code`, 4)
    WHEN 'CMSC' THEN 'Computer Science'
    WHEN 'MATH' THEN 'Mathematics'
    WHEN 'ENGL' THEN 'English'
    WHEN 'HIST' THEN 'History'
    WHEN 'PHYS' THEN 'Physics'
    WHEN 'CHEM' THEN 'Chemistry'
    WHEN 'NURS' THEN 'Nursing'
    WHEN 'IFSM' THEN 'Information Systems Management'
  END
 AND fp.`slot` = MOD(tmpl.`section_number` - 1, 6) + 1;

INSERT INTO `sections` (`course_id`, `semester_id`, `professor_id`, `capacity`, `days`, `start_time`, `end_time`, `access_codes`)
SELECT
  c.`course_id`,
  sem.`semester_id`,
  prof.`professor_id`,
  ss.`capacity`,
  ss.`days`,
  ss.`start_time`,
  ss.`end_time`,
  JSON_OBJECT('code1', 'A3F1-9C4B', 'code1_used', FALSE, 'code2', '7D2E-1A8F', 'code2_used', FALSE, 'code3', 'C0B7-5E92', 'code3_used', FALSE)
FROM `seed_sections` ss
JOIN `courses` c ON c.`course_code` = ss.`course_code`
JOIN `semesters` sem ON sem.`term` = ss.`term` AND sem.`year` = ss.`year`
JOIN `users` u ON u.`email` = ss.`professor_email`
JOIN `professors` prof ON prof.`user_id` = u.`user_id`;

CREATE TEMPORARY TABLE `seed_major_plan` (
  `major` VARCHAR(45) NOT NULL,
  `term` VARCHAR(8) NOT NULL,
  `year` INT NOT NULL,
  `course_code` VARCHAR(10) NOT NULL,
  `status` ENUM('enrolled', 'completed') NOT NULL
);

INSERT INTO `seed_major_plan` (`major`, `term`, `year`, `course_code`, `status`) VALUES
('Computer Science', 'Spring', 2024, 'CMSC105', 'completed'),
('Computer Science', 'Summer', 2024, 'CMSC115', 'completed'),
('Computer Science', 'Fall', 2024, 'CMSC150', 'completed'),
('Computer Science', 'Spring', 2025, 'CMSC215', 'completed'),
('Computer Science', 'Summer', 2025, 'CMSC220', 'completed'),
('Computer Science', 'Fall', 2025, 'CMSC310', 'completed'),
('Computer Science', 'Spring', 2026, 'CMSC315', 'completed'),
('Computer Science', 'Fall', 2026, 'CMSC320', 'enrolled'),
('Mathematics', 'Spring', 2024, 'MATH105', 'completed'),
('Mathematics', 'Summer', 2024, 'MATH107', 'completed'),
('Mathematics', 'Fall', 2024, 'MATH108', 'completed'),
('Mathematics', 'Spring', 2025, 'MATH115', 'completed'),
('Mathematics', 'Summer', 2025, 'MATH140', 'completed'),
('Mathematics', 'Fall', 2025, 'MATH141', 'completed'),
('Mathematics', 'Spring', 2026, 'MATH241', 'completed'),
('Mathematics', 'Fall', 2026, 'MATH340', 'enrolled'),
('English', 'Spring', 2024, 'ENGL102', 'completed'),
('English', 'Summer', 2024, 'ENGL103', 'completed'),
('English', 'Fall', 2024, 'ENGL240', 'completed'),
('English', 'Spring', 2025, 'ENGL281', 'completed'),
('English', 'Summer', 2025, 'ENGL303', 'completed'),
('English', 'Fall', 2025, 'ENGL384', 'completed'),
('English', 'Spring', 2026, 'ENGL406', 'completed'),
('English', 'Fall', 2026, 'ENGL495', 'enrolled'),
('History', 'Spring', 2024, 'HIST115', 'completed'),
('History', 'Summer', 2024, 'HIST116', 'completed'),
('History', 'Fall', 2024, 'HIST125', 'completed'),
('History', 'Spring', 2025, 'HIST141', 'completed'),
('History', 'Summer', 2025, 'HIST142', 'completed'),
('History', 'Fall', 2025, 'HIST289', 'completed'),
('History', 'Spring', 2026, 'HIST309', 'completed'),
('History', 'Fall', 2026, 'HIST495', 'enrolled'),
('Physics', 'Spring', 2024, 'PHYS121', 'completed'),
('Physics', 'Summer', 2024, 'PHYS122', 'completed'),
('Physics', 'Fall', 2024, 'MATH140', 'completed'),
('Physics', 'Spring', 2025, 'MATH141', 'completed'),
('Physics', 'Summer', 2025, 'MATH241', 'completed'),
('Physics', 'Fall', 2025, 'CMSC100', 'completed'),
('Physics', 'Spring', 2026, 'CMSC105', 'completed'),
('Physics', 'Fall', 2026, 'CMSC427', 'enrolled'),
('Chemistry', 'Spring', 2024, 'CHEM103', 'completed'),
('Chemistry', 'Summer', 2024, 'CHEM113', 'completed'),
('Chemistry', 'Fall', 2024, 'CHEM121', 'completed'),
('Chemistry', 'Spring', 2025, 'CHEM297', 'completed'),
('Chemistry', 'Summer', 2025, 'MATH107', 'completed'),
('Chemistry', 'Fall', 2025, 'MATH140', 'completed'),
('Chemistry', 'Spring', 2026, 'PHYS121', 'completed'),
('Chemistry', 'Fall', 2026, 'PHYS122', 'enrolled'),
('Nursing', 'Spring', 2024, 'NURS302', 'completed'),
('Nursing', 'Summer', 2024, 'NURS322', 'completed'),
('Nursing', 'Fall', 2024, 'NURS352', 'completed'),
('Nursing', 'Spring', 2025, 'NURS372', 'completed'),
('Nursing', 'Summer', 2025, 'NURS392', 'completed'),
('Nursing', 'Fall', 2025, 'NURS412', 'completed'),
('Nursing', 'Spring', 2026, 'NURS432', 'completed'),
('Nursing', 'Fall', 2026, 'NURS496', 'enrolled'),
('Information Systems Management', 'Spring', 2024, 'IFSM201', 'completed'),
('Information Systems Management', 'Summer', 2024, 'IFSM300', 'completed'),
('Information Systems Management', 'Fall', 2024, 'IFSM301', 'completed'),
('Information Systems Management', 'Spring', 2025, 'IFSM304', 'completed'),
('Information Systems Management', 'Summer', 2025, 'IFSM310', 'completed'),
('Information Systems Management', 'Fall', 2025, 'IFSM370', 'completed'),
('Information Systems Management', 'Spring', 2026, 'IFSM438', 'completed'),
('Information Systems Management', 'Fall', 2026, 'IFSM495', 'enrolled');

INSERT INTO `enrollments` (`student_id`, `section_id`, `status`)
SELECT
  s.`student_id`,
  sec.`section_id`,
  smp.`status`
FROM `students` s
JOIN `seed_major_plan` smp ON smp.`major` = s.`major`
JOIN `semesters` sem ON sem.`term` = smp.`term` AND sem.`year` = smp.`year`
JOIN `courses` c ON c.`course_code` = smp.`course_code`
JOIN (
  SELECT MIN(`section_id`) AS `section_id`, `course_id`, `semester_id`
  FROM `sections`
  GROUP BY `course_id`, `semester_id`
) sec ON sec.`course_id` = c.`course_id` AND sec.`semester_id` = sem.`semester_id`;

DROP TEMPORARY TABLE IF EXISTS `seed_major_plan`;
DROP TEMPORARY TABLE IF EXISTS `seed_sections`;
DROP TEMPORARY TABLE IF EXISTS `seed_admin_pool`;
DROP TEMPORARY TABLE IF EXISTS `seed_student_pool`;
DROP TEMPORARY TABLE IF EXISTS `seed_student_name_pool`;
DROP TEMPORARY TABLE IF EXISTS `seed_faculty_pool`;
