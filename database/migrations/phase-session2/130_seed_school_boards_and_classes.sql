-- Migration 130: Seed major Indian school boards and add classes 1–10 for each board
-- Idempotent: uses INSERT IGNORE on boards (unique code) and NOT EXISTS guards on classes

-- ── STEP 1: Insert major Indian school boards ─────────────────────────────────

INSERT IGNORE INTO boards (code, name, type, state, country, is_active) VALUES
-- National boards
('CBSE',   'Central Board of Secondary Education',                  'national', NULL,             'India', 1),
('ICSE',   'Indian Certificate of Secondary Education (CISCE)',     'national', NULL,             'India', 1),
('NIOS',   'National Institute of Open Schooling',                  'national', NULL,             'India', 1),
('IB',     'International Baccalaureate',                           'international', NULL,        'India', 1),
('IGCSE',  'Cambridge IGCSE (International General Certificate)',   'international', NULL,        'India', 1),
-- State boards
('MH-SSC', 'Maharashtra State Board (SSC/HSC)',                     'state', 'Maharashtra',      'India', 1),
('KA-KSEEB','Karnataka Secondary Education Examination Board',      'state', 'Karnataka',        'India', 1),
('TN-DGE', 'Tamil Nadu Board of Secondary Education',               'state', 'Tamil Nadu',       'India', 1),
('AP-BSEAP','Board of Secondary Education Andhra Pradesh',          'state', 'Andhra Pradesh',   'India', 1),
('TS-BSETS','Telangana State Board of Secondary Education',         'state', 'Telangana',        'India', 1),
('UP-UPMSP','Uttar Pradesh Madhyamik Shiksha Parishad',             'state', 'Uttar Pradesh',    'India', 1),
('BR-BSEB','Bihar School Examination Board',                        'state', 'Bihar',            'India', 1),
('WB-WBBSE','West Bengal Board of Secondary Education',             'state', 'West Bengal',      'India', 1),
('GJ-GSEB','Gujarat Secondary and Higher Secondary Education Board','state', 'Gujarat',          'India', 1),
('RJ-RBSE','Board of Secondary Education Rajasthan',                'state', 'Rajasthan',        'India', 1),
('MP-MPBSE','Madhya Pradesh Board of Secondary Education',          'state', 'Madhya Pradesh',   'India', 1),
('PB-PSEB','Punjab School Education Board',                         'state', 'Punjab',           'India', 1),
('HR-BSEH','Board of School Education Haryana',                     'state', 'Haryana',          'India', 1),
('OD-BSE', 'Board of Secondary Education Odisha',                   'state', 'Odisha',           'India', 1),
('KL-DHSE','Directorate of Higher Secondary Education Kerala',      'state', 'Kerala',           'India', 1),
('AS-SEBA','Board of Secondary Education Assam',                    'state', 'Assam',            'India', 1),
('HP-HPBOSE','Himachal Pradesh Board of School Education',          'state', 'Himachal Pradesh', 'India', 1),
('JH-JAC', 'Jharkhand Academic Council',                            'state', 'Jharkhand',        'India', 1),
('CG-CGBSE','Chhattisgarh Board of Secondary Education',            'state', 'Chhattisgarh',     'India', 1),
('UK-UBSE','Uttarakhand Board of School Education',                 'state', 'Uttarakhand',      'India', 1),
('GA-GBSHE','Goa Board of Secondary and Higher Secondary Education','state', 'Goa',              'India', 1),
('JK-JKBOSE','Jammu and Kashmir Board of School Education',         'state', 'Jammu & Kashmir',  'India', 1),
('MN-BSEM','Board of Secondary Education Manipur',                  'state', 'Manipur',          'India', 1),
('ML-MBOSE','Meghalaya Board of School Education',                  'state', 'Meghalaya',        'India', 1),
('NL-NBSE','Nagaland Board of School Education',                    'state', 'Nagaland',         'India', 1),
('TR-TBSE','Tripura Board of Secondary Education',                  'state', 'Tripura',          'India', 1),
('AR-GBSHSE','Government of Arunachal Pradesh Board',               'state', 'Arunachal Pradesh','India', 1),
('MZ-MBSE','Mizoram Board of School Education',                     'state', 'Mizoram',          'India', 1),
('SK-BSSE','Board of Secondary Education Sikkim',                   'state', 'Sikkim',           'India', 1),
('PY-DHETN','Directorate of Higher Education Puducherry',           'state', 'Puducherry',       'India', 1),
('DL-BOSE','Board of Open Schooling and Cognitive Education Delhi', 'state', 'Delhi',            'India', 1),
('AN-ABSEHS','Andaman & Nicobar Board of School Education',         'state', 'Andaman & Nicobar','India', 1);

-- ── STEP 2: Create one current syllabus version per board (if not exists) ─────

INSERT INTO syllabus_versions (board_id, version_name, academic_year_start, is_current)
SELECT b.id, CONCAT(b.name, ' — 2024-25'), 2024, 1
FROM boards b
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM syllabus_versions sv WHERE sv.board_id = b.id
  );

-- ── STEP 3: Insert classes 1–10 (general stream) for all active boards ────────

INSERT INTO classes (board_id, syllabus_version_id, grade, grade_label, stream)
SELECT b.id, sv.id, g.n, CONCAT('Class ', g.n), 'general'
FROM boards b
JOIN syllabus_versions sv ON sv.board_id = b.id AND sv.is_current = 1
CROSS JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
  SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
  SELECT 9 UNION ALL SELECT 10
) g
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM classes c
    WHERE c.board_id = b.id AND c.grade = g.n AND c.stream = 'general'
  );

-- ── STEP 4: Insert classes 11 & 12 with Science / Commerce / Arts streams ─────
-- Senior secondary (11-12) is stream-split in all Indian boards

INSERT INTO classes (board_id, syllabus_version_id, grade, grade_label, stream)
SELECT b.id, sv.id, g.grade, g.label, g.stream
FROM boards b
JOIN syllabus_versions sv ON sv.board_id = b.id AND sv.is_current = 1
CROSS JOIN (
  SELECT 11 AS grade, 'Class 11 — Science'   AS label, 'science'  AS stream UNION ALL
  SELECT 11,          'Class 11 — Commerce',            'commerce'            UNION ALL
  SELECT 11,          'Class 11 — Arts',                'arts'                UNION ALL
  SELECT 12,          'Class 12 — Science',             'science'             UNION ALL
  SELECT 12,          'Class 12 — Commerce',            'commerce'            UNION ALL
  SELECT 12,          'Class 12 — Arts',                'arts'
) g
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM classes c
    WHERE c.board_id = b.id AND c.grade = g.grade AND c.stream = g.stream
  );
