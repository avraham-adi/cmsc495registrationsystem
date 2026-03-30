INSERT INTO `prerequisites`
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
WHERE p.course_code = 'CMSC115' AND c.course_code = 'CMSC340'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC345'
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
WHERE p.course_code = 'CMSC215' AND c.course_code = 'CMSC440'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC320' AND c.course_code = 'CMSC440'
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
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC465'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC315' AND c.course_code = 'CMSC495'
UNION ALL
SELECT p.course_id, c.course_id
FROM `courses` p
JOIN `courses` c
WHERE p.course_code = 'CMSC345' AND c.course_code = 'CMSC495';