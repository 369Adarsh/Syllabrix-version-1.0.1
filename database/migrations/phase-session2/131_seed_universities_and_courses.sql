-- Migration 131: Seed course categories, courses, and all major Indian universities
-- All INSERTs are idempotent via NOT EXISTS / INSERT IGNORE guards

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART A — COURSE CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO course_categories (name, type, is_active) VALUES
('Engineering & Technology',    'technical',    1),
('Medical & Health Sciences',   'medical',      1),
('Management & Business',       'management',   1),
('Science',                     'science',      1),
('Commerce & Finance',          'commerce',     1),
('Arts & Humanities',           'arts',         1),
('Law',                         'law',          1),
('Architecture & Design',       'design',       1),
('Agriculture & Veterinary',    'agriculture',  1),
('Education & Teaching',        'education',    1),
('Computer & IT',               'technical',    1),
('Pharmacy',                    'medical',      1);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART B — COURSES (linked to categories by sub-select on name)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Engineering & Technology
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Technology', 'B.Tech', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Engineering & Technology' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Tech');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Technology', 'M.Tech', 'master', 2, 1 FROM course_categories WHERE name = 'Engineering & Technology' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.Tech');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Engineering', 'B.E.', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Engineering & Technology' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.E.');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Integrated M.Tech (Dual Degree)', 'Dual Degree M.Tech', 'integrated', 5, 1 FROM course_categories WHERE name = 'Engineering & Technology' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'Dual Degree M.Tech');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Doctor of Philosophy (Engineering)', 'Ph.D. Engg', 'doctorate', 5, 1 FROM course_categories WHERE name = 'Engineering & Technology' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'Ph.D. Engg');

-- Computer & IT
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Computer Applications', 'BCA', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Computer & IT' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BCA');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Computer Applications', 'MCA', 'master', 2, 1 FROM course_categories WHERE name = 'Computer & IT' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'MCA');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'B.Tech Computer Science & Engineering', 'B.Tech CSE', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Computer & IT' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Tech CSE');

-- Medical & Health Sciences
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Medicine and Bachelor of Surgery', 'MBBS', 'bachelor', 5, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'MBBS');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Dental Surgery', 'BDS', 'bachelor', 5, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BDS');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Nursing', 'B.Sc Nursing', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Sc Nursing');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Physiotherapy', 'BPT', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BPT');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Ayurvedic Medicine and Surgery', 'BAMS', 'bachelor', 5, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BAMS');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Surgery / Doctor of Medicine', 'MD/MS', 'master', 3, 1 FROM course_categories WHERE name = 'Medical & Health Sciences' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'MD/MS');

-- Management & Business
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Business Administration', 'MBA', 'master', 2, 1 FROM course_categories WHERE name = 'Management & Business' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'MBA');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Business Administration', 'BBA', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Management & Business' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BBA');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Post Graduate Diploma in Management', 'PGDM', 'diploma', 2, 1 FROM course_categories WHERE name = 'Management & Business' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'PGDM');

-- Science
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Science', 'B.Sc', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Science' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Sc');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Science', 'M.Sc', 'master', 2, 1 FROM course_categories WHERE name = 'Science' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.Sc');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Integrated M.Sc (5-Year)', 'Int. M.Sc', 'integrated', 5, 1 FROM course_categories WHERE name = 'Science' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'Int. M.Sc');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Doctor of Philosophy (Science)', 'Ph.D. Sci', 'doctorate', 5, 1 FROM course_categories WHERE name = 'Science' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'Ph.D. Sci');

-- Commerce & Finance
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Commerce', 'B.Com', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Commerce & Finance' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Com');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Commerce', 'M.Com', 'master', 2, 1 FROM course_categories WHERE name = 'Commerce & Finance' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.Com');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Chartered Accountancy', 'CA', 'diploma', 3, 1 FROM course_categories WHERE name = 'Commerce & Finance' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'CA');

-- Arts & Humanities
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Arts', 'B.A.', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Arts & Humanities' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.A.');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Arts', 'M.A.', 'master', 2, 1 FROM course_categories WHERE name = 'Arts & Humanities' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.A.');

-- Law
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Laws', 'LL.B', 'bachelor', 3, 1 FROM course_categories WHERE name = 'Law' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'LL.B');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Integrated BA LLB (5-Year)', 'BA LLB', 'integrated', 5, 1 FROM course_categories WHERE name = 'Law' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'BA LLB');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Laws', 'LL.M', 'master', 1, 1 FROM course_categories WHERE name = 'Law' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'LL.M');

-- Architecture & Design
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Architecture', 'B.Arch', 'bachelor', 5, 1 FROM course_categories WHERE name = 'Architecture & Design' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Arch');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Design', 'B.Des', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Architecture & Design' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Des');

-- Pharmacy
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Pharmacy', 'B.Pharm', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Pharmacy' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Pharm');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Pharmacy', 'M.Pharm', 'master', 2, 1 FROM course_categories WHERE name = 'Pharmacy' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.Pharm');

-- Agriculture
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Science in Agriculture', 'B.Sc Agri', 'bachelor', 4, 1 FROM course_categories WHERE name = 'Agriculture & Veterinary' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Sc Agri');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Veterinary Science', 'B.V.Sc', 'bachelor', 5, 1 FROM course_categories WHERE name = 'Agriculture & Veterinary' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.V.Sc');

-- Education
INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Bachelor of Education', 'B.Ed', 'bachelor', 2, 1 FROM course_categories WHERE name = 'Education & Teaching' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'B.Ed');

INSERT INTO courses (course_category_id, name, short_name, level, duration_years, is_active)
SELECT id, 'Master of Education', 'M.Ed', 'master', 2, 1 FROM course_categories WHERE name = 'Education & Teaching' AND NOT EXISTS (SELECT 1 FROM courses WHERE short_name = 'M.Ed');


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART C — UNIVERSITIES (all major Indian universities)
-- Uses NOT EXISTS on short_name to avoid duplicates
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── IITs (23) ────────────────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Bombay', 'IIT Bombay', 'iit', 1958, 'Mumbai', 'Maharashtra', 'NA', 3) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Bombay');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Delhi', 'IIT Delhi', 'iit', 1961, 'New Delhi', 'Delhi', 'NA', 2) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Delhi');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Madras', 'IIT Madras', 'iit', 1959, 'Chennai', 'Tamil Nadu', 'NA', 1) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Madras');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Kanpur', 'IIT Kanpur', 'iit', 1959, 'Kanpur', 'Uttar Pradesh', 'NA', 4) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Kanpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Kharagpur', 'IIT Kharagpur', 'iit', 1951, 'Kharagpur', 'West Bengal', 'NA', 5) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Kharagpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Roorkee', 'IIT Roorkee', 'iit', 1847, 'Roorkee', 'Uttarakhand', 'NA', 6) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Roorkee');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Guwahati', 'IIT Guwahati', 'iit', 1994, 'Guwahati', 'Assam', 'NA', 7) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Guwahati');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Hyderabad', 'IIT Hyderabad', 'iit', 2008, 'Hyderabad', 'Telangana', 'NA', 8) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Hyderabad');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Bhubaneswar', 'IIT Bhubaneswar', 'iit', 2008, 'Bhubaneswar', 'Odisha', 'NA', 21) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Bhubaneswar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Gandhinagar', 'IIT Gandhinagar', 'iit', 2008, 'Gandhinagar', 'Gujarat', 'NA', 15) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Gandhinagar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Jodhpur', 'IIT Jodhpur', 'iit', 2008, 'Jodhpur', 'Rajasthan', 'NA', 25) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Jodhpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Patna', 'IIT Patna', 'iit', 2008, 'Patna', 'Bihar', 'NA', 28) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Patna');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Ropar', 'IIT Ropar', 'iit', 2008, 'Rupnagar', 'Punjab', 'NA', 22) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Ropar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Indore', 'IIT Indore', 'iit', 2009, 'Indore', 'Madhya Pradesh', 'NA', 14) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Indore');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Mandi', 'IIT Mandi', 'iit', 2009, 'Mandi', 'Himachal Pradesh', 'NA', 40) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Mandi');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Tirupati', 'IIT Tirupati', 'iit', 2015, 'Tirupati', 'Andhra Pradesh', 'NA', 50) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Tirupati');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Palakkad', 'IIT Palakkad', 'iit', 2015, 'Palakkad', 'Kerala', 'NA', 52) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Palakkad');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Bhilai', 'IIT Bhilai', 'iit', 2016, 'Bhilai', 'Chhattisgarh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Bhilai');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Goa', 'IIT Goa', 'iit', 2016, 'Farmagudi', 'Goa', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Goa');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Jammu', 'IIT Jammu', 'iit', 2016, 'Jammu', 'Jammu & Kashmir', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Jammu');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology Dharwad', 'IIT Dharwad', 'iit', 2016, 'Dharwad', 'Karnataka', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT Dharwad');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology (BHU) Varanasi', 'IIT BHU', 'iit', 1919, 'Varanasi', 'Uttar Pradesh', 'NA', 9) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT BHU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Technology (ISM) Dhanbad', 'IIT ISM Dhanbad', 'iit', 1926, 'Dhanbad', 'Jharkhand', 'NA', 13) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIT ISM Dhanbad');

-- ── NITs (31) ────────────────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'nit', 1964, 'Tiruchirappalli', 'Tamil Nadu', 'NA', 10) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Trichy');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Warangal', 'NIT Warangal', 'nit', 1959, 'Warangal', 'Telangana', 'NA', 23) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Warangal');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Karnataka Surathkal', 'NIT Surathkal', 'nit', 1960, 'Surathkal', 'Karnataka', 'NA', 16) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Surathkal');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Rourkela', 'NIT Rourkela', 'nit', 1961, 'Rourkela', 'Odisha', 'NA', 19) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Rourkela');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Calicut', 'NIT Calicut', 'nit', 1961, 'Kozhikode', 'Kerala', 'NA', 27) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Calicut');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Motilal Nehru National Institute of Technology Allahabad', 'MNNIT Allahabad', 'nit', 1961, 'Allahabad', 'Uttar Pradesh', 'NA', 31) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'MNNIT Allahabad');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Visvesvaraya National Institute of Technology Nagpur', 'VNIT Nagpur', 'nit', 1960, 'Nagpur', 'Maharashtra', 'NA', 30) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'VNIT Nagpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Sardar Vallabhbhai National Institute of Technology Surat', 'SVNIT Surat', 'nit', 1961, 'Surat', 'Gujarat', 'NA', 39) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'SVNIT Surat');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Maulana Azad National Institute of Technology Bhopal', 'MANIT Bhopal', 'nit', 1960, 'Bhopal', 'Madhya Pradesh', 'NA', 43) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'MANIT Bhopal');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Malaviya National Institute of Technology Jaipur', 'MNIT Jaipur', 'nit', 1963, 'Jaipur', 'Rajasthan', 'NA', 48) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'MNIT Jaipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Kurukshetra', 'NIT Kurukshetra', 'nit', 1963, 'Kurukshetra', 'Haryana', 'NA', 35) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Kurukshetra');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Durgapur', 'NIT Durgapur', 'nit', 1960, 'Durgapur', 'West Bengal', 'NA', 42) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Durgapur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Silchar', 'NIT Silchar', 'nit', 1967, 'Silchar', 'Assam', 'NA', 59) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Silchar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Hamirpur', 'NIT Hamirpur', 'nit', 1986, 'Hamirpur', 'Himachal Pradesh', 'NA', 45) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Hamirpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Dr. B.R. Ambedkar National Institute of Technology Jalandhar', 'NIT Jalandhar', 'nit', 1987, 'Jalandhar', 'Punjab', 'NA', 44) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Jalandhar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Patna', 'NIT Patna', 'nit', 1886, 'Patna', 'Bihar', 'NA', 66) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Patna');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Raipur', 'NIT Raipur', 'nit', 1956, 'Raipur', 'Chhattisgarh', 'NA', 60) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Raipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Jamshedpur', 'NIT Jamshedpur', 'nit', 1960, 'Jamshedpur', 'Jharkhand', 'NA', 55) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Jamshedpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Delhi', 'NIT Delhi', 'nit', 2010, 'New Delhi', 'Delhi', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Delhi');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Uttarakhand', 'NIT Uttarakhand', 'nit', 2009, 'Srinagar', 'Uttarakhand', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Uttarakhand');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Andhra Pradesh', 'NIT Andhra Pradesh', 'nit', 2015, 'Tadepalligudem', 'Andhra Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Andhra Pradesh');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Srinagar', 'NIT Srinagar', 'nit', 1960, 'Srinagar', 'Jammu & Kashmir', 'NA', 61) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Srinagar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Goa', 'NIT Goa', 'nit', 2010, 'Farmagudi', 'Goa', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Goa');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Puducherry', 'NIT Puducherry', 'nit', 2010, 'Karaikal', 'Puducherry', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Puducherry');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Manipur', 'NIT Manipur', 'nit', 2010, 'Imphal', 'Manipur', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Manipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Mizoram', 'NIT Mizoram', 'nit', 2010, 'Aizawl', 'Mizoram', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Mizoram');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Meghalaya', 'NIT Meghalaya', 'nit', 2010, 'Shillong', 'Meghalaya', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Meghalaya');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Nagaland', 'NIT Nagaland', 'nit', 2010, 'Dimapur', 'Nagaland', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Nagaland');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Agartala', 'NIT Agartala', 'nit', 1965, 'Agartala', 'Tripura', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Agartala');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Arunachal Pradesh', 'NIT Arunachal Pradesh', 'nit', 2010, 'Yupia', 'Arunachal Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Arunachal Pradesh');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'National Institute of Technology Sikkim', 'NIT Sikkim', 'nit', 2010, 'Ravangla', 'Sikkim', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NIT Sikkim');

-- ── IIMs (21) ────────────────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Ahmedabad', 'IIM Ahmedabad', 'iim', 1961, 'Ahmedabad', 'Gujarat', 'NA', 1) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Ahmedabad');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Bangalore', 'IIM Bangalore', 'iim', 1973, 'Bengaluru', 'Karnataka', 'NA', 2) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Bangalore');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Calcutta', 'IIM Calcutta', 'iim', 1961, 'Kolkata', 'West Bengal', 'NA', 3) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Calcutta');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Lucknow', 'IIM Lucknow', 'iim', 1984, 'Lucknow', 'Uttar Pradesh', 'NA', 4) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Lucknow');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Kozhikode', 'IIM Kozhikode', 'iim', 1996, 'Kozhikode', 'Kerala', 'NA', 5) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Kozhikode');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Indore', 'IIM Indore', 'iim', 1996, 'Indore', 'Madhya Pradesh', 'NA', 6) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Indore');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Shillong', 'IIM Shillong', 'iim', 2007, 'Shillong', 'Meghalaya', 'NA', 7) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Shillong');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Rohtak', 'IIM Rohtak', 'iim', 2009, 'Rohtak', 'Haryana', 'NA', 8) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Rohtak');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Ranchi', 'IIM Ranchi', 'iim', 2010, 'Ranchi', 'Jharkhand', 'NA', 9) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Ranchi');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Raipur', 'IIM Raipur', 'iim', 2010, 'Raipur', 'Chhattisgarh', 'NA', 10) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Raipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Kashipur', 'IIM Kashipur', 'iim', 2011, 'Kashipur', 'Uttarakhand', 'NA', 11) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Kashipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Tiruchirappalli', 'IIM Trichy', 'iim', 2011, 'Tiruchirappalli', 'Tamil Nadu', 'NA', 12) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Trichy');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Udaipur', 'IIM Udaipur', 'iim', 2011, 'Udaipur', 'Rajasthan', 'NA', 13) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Udaipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Amritsar', 'IIM Amritsar', 'iim', 2015, 'Amritsar', 'Punjab', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Amritsar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Bodhgaya', 'IIM Bodhgaya', 'iim', 2015, 'Bodh Gaya', 'Bihar', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Bodhgaya');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Jammu', 'IIM Jammu', 'iim', 2016, 'Jammu', 'Jammu & Kashmir', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Jammu');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Nagpur', 'IIM Nagpur', 'iim', 2015, 'Nagpur', 'Maharashtra', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Nagpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Sambalpur', 'IIM Sambalpur', 'iim', 2015, 'Sambalpur', 'Odisha', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Sambalpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Sirmaur', 'IIM Sirmaur', 'iim', 2015, 'Paonta Sahib', 'Himachal Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Sirmaur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Visakhapatnam', 'IIM Visakhapatnam', 'iim', 2015, 'Visakhapatnam', 'Andhra Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Visakhapatnam');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Management Mumbai', 'IIM Mumbai', 'iim', 2022, 'Mumbai', 'Maharashtra', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IIM Mumbai');

-- ── AIIMS (Multiple) ─────────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences New Delhi', 'AIIMS Delhi', 'aiims', 1956, 'New Delhi', 'Delhi', 'NA', 1) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Delhi');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Bhopal', 'AIIMS Bhopal', 'aiims', 2012, 'Bhopal', 'Madhya Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Bhopal');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Bhubaneswar', 'AIIMS Bhubaneswar', 'aiims', 2012, 'Bhubaneswar', 'Odisha', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Bhubaneswar');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Jodhpur', 'AIIMS Jodhpur', 'aiims', 2012, 'Jodhpur', 'Rajasthan', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Jodhpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Patna', 'AIIMS Patna', 'aiims', 2012, 'Patna', 'Bihar', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Patna');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Raipur', 'AIIMS Raipur', 'aiims', 2012, 'Raipur', 'Chhattisgarh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Raipur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Rishikesh', 'AIIMS Rishikesh', 'aiims', 2012, 'Rishikesh', 'Uttarakhand', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Rishikesh');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Nagpur', 'AIIMS Nagpur', 'aiims', 2018, 'Nagpur', 'Maharashtra', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Nagpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Kalyani', 'AIIMS Kalyani', 'aiims', 2019, 'Kalyani', 'West Bengal', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Kalyani');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Mangalagiri', 'AIIMS Mangalagiri', 'aiims', 2020, 'Mangalagiri', 'Andhra Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Mangalagiri');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Bathinda', 'AIIMS Bathinda', 'aiims', 2021, 'Bathinda', 'Punjab', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Bathinda');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Gorakhpur', 'AIIMS Gorakhpur', 'aiims', 2020, 'Gorakhpur', 'Uttar Pradesh', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Gorakhpur');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'All India Institute of Medical Sciences Rajkot', 'AIIMS Rajkot', 'aiims', 2023, 'Rajkot', 'Gujarat', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AIIMS Rajkot');

-- ── Central Universities ──────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indian Institute of Science Bangalore', 'IISc Bangalore', 'central', 1909, 'Bengaluru', 'Karnataka', 'A++', 2) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IISc Bangalore');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Delhi', 'Delhi University', 'central', 1922, 'New Delhi', 'Delhi', 'A++', 11) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Delhi University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Jawaharlal Nehru University', 'JNU', 'central', 1969, 'New Delhi', 'Delhi', 'A++', 2) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'JNU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Banaras Hindu University', 'BHU', 'central', 1916, 'Varanasi', 'Uttar Pradesh', 'A++', 12) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'BHU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Hyderabad', 'HCU', 'central', 1974, 'Hyderabad', 'Telangana', 'A', 14) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'HCU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Aligarh Muslim University', 'AMU', 'central', 1875, 'Aligarh', 'Uttar Pradesh', 'A+', 17) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'AMU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Jamia Millia Islamia', 'JMI', 'central', 1920, 'New Delhi', 'Delhi', 'A+', 16) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'JMI');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Tezpur University', 'Tezpur University', 'central', 1994, 'Tezpur', 'Assam', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Tezpur University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Pondicherry University', 'Pondicherry University', 'central', 1985, 'Puducherry', 'Puducherry', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Pondicherry University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'North-Eastern Hill University', 'NEHU', 'central', 1973, 'Shillong', 'Meghalaya', 'B+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'NEHU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Indira Gandhi National Open University', 'IGNOU', 'central', 1985, 'New Delhi', 'Delhi', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'IGNOU');

-- ── Top State Universities ────────────────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Mumbai', 'Mumbai University', 'state', 1857, 'Mumbai', 'Maharashtra', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Mumbai University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Calcutta', 'Calcutta University', 'state', 1857, 'Kolkata', 'West Bengal', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Calcutta University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Madras', 'Madras University', 'state', 1857, 'Chennai', 'Tamil Nadu', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Madras University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Anna University', 'Anna University', 'state', 1978, 'Chennai', 'Tamil Nadu', 'A++', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Anna University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Savitribai Phule Pune University', 'Pune University', 'state', 1948, 'Pune', 'Maharashtra', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Pune University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Bangalore University', 'Bangalore University', 'state', 1964, 'Bengaluru', 'Karnataka', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Bangalore University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'University of Mysore', 'Mysore University', 'state', 1916, 'Mysore', 'Karnataka', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Mysore University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Osmania University', 'Osmania University', 'state', 1918, 'Hyderabad', 'Telangana', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Osmania University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Jadavpur University', 'Jadavpur University', 'state', 1955, 'Kolkata', 'West Bengal', 'A++', 20) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Jadavpur University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Gujarat University', 'Gujarat University', 'state', 1949, 'Ahmedabad', 'Gujarat', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Gujarat University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Kerala University', 'Kerala University', 'state', 1937, 'Thiruvananthapuram', 'Kerala', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Kerala University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Panjab University Chandigarh', 'Panjab University', 'state', 1882, 'Chandigarh', 'Punjab', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Panjab University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Rajasthan University', 'Rajasthan University', 'state', 1947, 'Jaipur', 'Rajasthan', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Rajasthan University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Utkal University', 'Utkal University', 'state', 1943, 'Bhubaneswar', 'Odisha', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Utkal University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Dibrugarh University', 'Dibrugarh University', 'state', 1965, 'Dibrugarh', 'Assam', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Dibrugarh University');

-- ── Top Deemed / Private Universities ────────────────────────────────────────
INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Birla Institute of Technology and Science Pilani', 'BITS Pilani', 'deemed', 1964, 'Pilani', 'Rajasthan', 'A', 26) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'BITS Pilani');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Vellore Institute of Technology', 'VIT', 'deemed', 1984, 'Vellore', 'Tamil Nadu', 'A++', 11) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'VIT');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Manipal Academy of Higher Education', 'Manipal University', 'deemed', 1993, 'Manipal', 'Karnataka', 'A+', 50) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Manipal University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'SRM Institute of Science and Technology', 'SRM University', 'deemed', 1985, 'Kattankulathur', 'Tamil Nadu', 'A++', 36) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'SRM University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Amity University Noida', 'Amity University', 'private', 2005, 'Noida', 'Uttar Pradesh', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Amity University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Symbiosis International University', 'Symbiosis University', 'deemed', 2002, 'Pune', 'Maharashtra', 'A', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Symbiosis University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Tata Institute of Fundamental Research', 'TIFR', 'deemed', 1945, 'Mumbai', 'Maharashtra', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'TIFR');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Tata Institute of Social Sciences', 'TISS', 'deemed', 1936, 'Mumbai', 'Maharashtra', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'TISS');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Institute of Chemical Technology Mumbai', 'ICT Mumbai', 'autonomous', 1933, 'Mumbai', 'Maharashtra', 'A++', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'ICT Mumbai');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Lovely Professional University', 'LPU', 'deemed', 2005, 'Phagwara', 'Punjab', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'LPU');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Chandigarh University', 'Chandigarh University', 'private', 2012, 'Mohali', 'Punjab', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Chandigarh University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Christ University Bangalore', 'Christ University', 'deemed', 1969, 'Bengaluru', 'Karnataka', 'A+', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Christ University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Kalinga Institute of Industrial Technology', 'KIIT', 'deemed', 1992, 'Bhubaneswar', 'Odisha', 'A+', 51) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'KIIT');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'O.P. Jindal Global University', 'Jindal University', 'deemed', 2009, 'Sonipat', 'Haryana', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Jindal University');

INSERT INTO universities (name, short_name, type, established_year, location_city, location_state, naac_grade, nirf_rank, is_active)
SELECT * FROM (SELECT 'Ashoka University', 'Ashoka University', 'private', 2014, 'Sonipat', 'Haryana', 'NA', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE short_name = 'Ashoka University');
