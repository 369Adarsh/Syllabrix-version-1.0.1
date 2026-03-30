const { pool } = require('../../database/connection');

// ─── SCHOOL LIBRARY ───────────────────────────────────────────────────────────

async function getBoards() {
  const [rows] = await pool.execute(
    `SELECT id, code, name, type, state, country, official_website
     FROM boards WHERE is_active = 1
     ORDER BY type ASC, state ASC, name ASC`
  );
  const grouped = { national: [], state: [], international: [] };
  for (const row of rows) {
    grouped[row.type] = grouped[row.type] || [];
    grouped[row.type].push(row);
  }
  return grouped;
}

async function getBoardByCode(code) {
  const [rows] = await pool.execute(
    `SELECT id, code, name, type, state, country, official_website, is_active, created_at
     FROM boards WHERE code = ? LIMIT 1`,
    [code.toUpperCase()]
  );
  return rows[0] || null;
}

async function getSyllabusVersions(boardCode) {
  const [rows] = await pool.execute(
    `SELECT sv.id, sv.version_name, sv.academic_year_start, sv.academic_year_end,
            sv.is_current, sv.changes_summary
     FROM syllabus_versions sv
     JOIN boards b ON b.id = sv.board_id
     WHERE b.code = ?
     ORDER BY sv.is_current DESC, sv.academic_year_start DESC`,
    [boardCode.toUpperCase()]
  );
  return rows;
}

async function getClasses(boardCode, syllabusVersionId = null) {
  let svId = syllabusVersionId;
  if (!svId) {
    const [svRows] = await pool.execute(
      `SELECT sv.id FROM syllabus_versions sv
       JOIN boards b ON b.id = sv.board_id
       WHERE b.code = ? AND sv.is_current = 1 LIMIT 1`,
      [boardCode.toUpperCase()]
    );
    if (!svRows.length) return [];
    svId = svRows[0].id;
  }
  const [rows] = await pool.execute(
    `SELECT id, grade, grade_label, stream
     FROM classes
     WHERE board_id = (SELECT id FROM boards WHERE code = ? LIMIT 1)
       AND syllabus_version_id = ?
     ORDER BY grade ASC, stream ASC`,
    [boardCode.toUpperCase(), svId]
  );
  return rows;
}

async function getSubjects(classId) {
  const [rows] = await pool.execute(
    `SELECT id, name, code, subject_type, language_medium
     FROM subjects WHERE class_id = ? AND is_active = 1
     ORDER BY subject_type ASC, name ASC`,
    [classId]
  );
  return rows;
}

async function getBooks(subjectId) {
  const [rows] = await pool.execute(
    `SELECT b.id, b.title, b.publisher, b.edition, b.publication_year,
            b.is_official, b.ncert_url, b.cover_image_url, b.is_available_free,
            b.priority_rank, b.affiliate_link, b.google_books_preview_url,
            p.name AS publisher_name, p.short_name AS publisher_short
     FROM books b
     LEFT JOIN publishers p ON p.id = b.publisher_id
     WHERE b.subject_id = ?
     ORDER BY b.is_official DESC, b.priority_rank ASC, b.publication_year DESC`,
    [subjectId]
  );
  return rows;
}

async function getChapters(bookId) {
  const [rows] = await pool.execute(
    `SELECT id, chapter_number, title, description,
            key_concepts, learning_outcomes, estimated_study_time_mins
     FROM chapters WHERE book_id = ?
     ORDER BY chapter_number ASC`,
    [bookId]
  );
  return rows.map(r => ({
    ...r,
    key_concepts:      safeParseJSON(r.key_concepts, []),
    learning_outcomes: safeParseJSON(r.learning_outcomes, []),
  }));
}

async function getTopics(chapterId) {
  const [rows] = await pool.execute(
    `SELECT id, title, topic_order, bloom_levels, weightage_percent,
            is_deleted_in_new_syllabus, is_new_in_current_syllabus
     FROM topics WHERE chapter_id = ?
     ORDER BY topic_order ASC`,
    [chapterId]
  );
  return rows.map(r => ({
    ...r,
    bloom_levels: safeParseJSON(r.bloom_levels, []),
  }));
}

// ─── COMPETITIVE EXAMS ────────────────────────────────────────────────────────

async function getExams() {
  const [rows] = await pool.execute(
    `SELECT id, code, name, exam_type AS type, exam_level AS level, state, conducting_body, official_website
     FROM exam_categories WHERE is_active = 1 AND code IS NOT NULL
     ORDER BY exam_type ASC, exam_level ASC, name ASC`
  );
  // Group by type
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.type]) grouped[row.type] = [];
    grouped[row.type].push(row);
  }
  return grouped;
}

async function getExamByCode(code) {
  const [rows] = await pool.execute(
    `SELECT id, code, name, exam_type AS type, exam_level AS level, state, conducting_body, official_website, is_active, created_at
     FROM exam_categories WHERE code = ? LIMIT 1`,
    [code.toUpperCase()]
  );
  return rows[0] || null;
}

async function getExamSubjects(examCode) {
  const [rows] = await pool.execute(
    `SELECT cs.id, cs.name, cs.parent_subject, cs.sub_category,
            cs.description, cs.weightage_percent
     FROM competitive_subjects cs
     JOIN exam_categories ec ON ec.id = cs.exam_category_id
     WHERE ec.code = ? AND cs.is_active = 1
     ORDER BY cs.parent_subject ASC, cs.weightage_percent DESC`,
    [examCode.toUpperCase()]
  );
  return rows;
}

async function getExamBooks(examCode, maxPriority = null) {
  let sql = `
    SELECT cb.id, cb.title, cb.author, cb.edition, cb.publication_year,
           cb.priority_rank, cb.usage_tip, cb.is_available_free,
           cb.amazon_affiliate_url, cb.flipkart_affiliate_url,
           cb.google_books_preview_url, cb.cover_image_url,
           p.name AS publisher_name, p.short_name AS publisher_short,
           p.website AS publisher_website,
           cs.name AS subject_name, cs.parent_subject,
           bel.relevance
    FROM competitive_books cb
    JOIN book_exam_links bel ON bel.competitive_book_id = cb.id
    JOIN exam_categories ec  ON ec.id = bel.exam_category_id
    JOIN publishers p        ON p.id = cb.publisher_id
    LEFT JOIN competitive_subjects cs ON cs.id = cb.competitive_subject_id
    WHERE ec.code = ? AND cb.is_active = 1
  `;
  const params = [examCode.toUpperCase()];

  if (maxPriority) {
    sql += ' AND cb.priority_rank <= ?';
    params.push(maxPriority);
  }
  sql += ' ORDER BY cb.priority_rank ASC, bel.relevance ASC, cb.title ASC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ─── PUBLISHERS ───────────────────────────────────────────────────────────────

async function getPublishers() {
  const [rows] = await pool.execute(
    `SELECT id, name, short_name, focus_area, website, partnership_status
     FROM publishers WHERE is_active = 1
     ORDER BY name ASC`
  );
  return rows;
}

async function getPublisherBooks(publisherId) {
  const [rows] = await pool.execute(
    `SELECT cb.id, cb.title, cb.author, cb.edition, cb.publication_year,
            cb.priority_rank, cb.usage_tip, cb.is_available_free,
            cb.amazon_affiliate_url, cb.flipkart_affiliate_url,
            cb.google_books_preview_url,
            cs.name AS subject_name, cs.parent_subject
     FROM competitive_books cb
     LEFT JOIN competitive_subjects cs ON cs.id = cb.competitive_subject_id
     WHERE cb.publisher_id = ? AND cb.is_active = 1
     ORDER BY cb.priority_rank ASC, cb.title ASC`,
    [publisherId]
  );
  return rows;
}

// ─── BOOK RECOMMENDATION ──────────────────────────────────────────────────────

/**
 * Smart book recommendation.
 * @param {object} opts
 * @param {string} opts.examCode        — required
 * @param {string} [opts.subject]       — filter by parent_subject or subject name
 * @param {string} [opts.subCategory]   — filter by sub_category
 * @param {string} [opts.classLevel]    — 'beginner'|'intermediate'|'advanced'
 */
async function getRecommendedBooks({ examCode, subject, subCategory, classLevel }) {
  // Determine max priority_rank based on classLevel
  let maxPriority = null;
  if (classLevel === 'beginner')     maxPriority = 1;
  if (classLevel === 'intermediate') maxPriority = 2;
  // advanced → no filter (all ranks)

  let sql = `
    SELECT cb.id, cb.title, cb.author, cb.edition, cb.publication_year,
           cb.priority_rank, cb.usage_tip, cb.is_available_free,
           cb.amazon_affiliate_url, cb.flipkart_affiliate_url,
           cb.google_books_preview_url, cb.cover_image_url,
           p.name AS publisher_name, p.short_name AS publisher_short,
           p.website AS publisher_website,
           cs.name AS subject_name, cs.parent_subject, cs.sub_category,
           bel.relevance
    FROM competitive_books cb
    JOIN book_exam_links bel ON bel.competitive_book_id = cb.id
    JOIN exam_categories ec  ON ec.id = bel.exam_category_id
    JOIN publishers p        ON p.id = cb.publisher_id
    LEFT JOIN competitive_subjects cs ON cs.id = cb.competitive_subject_id
    WHERE ec.code = ? AND cb.is_active = 1
  `;
  const params = [examCode.toUpperCase()];

  if (subject) {
    sql += ' AND (cs.parent_subject LIKE ? OR cs.name LIKE ?)';
    params.push(`%${subject}%`, `%${subject}%`);
  }
  if (subCategory) {
    sql += ' AND cs.sub_category LIKE ?';
    params.push(`%${subCategory}%`);
  }
  if (maxPriority) {
    sql += ' AND cb.priority_rank <= ?';
    params.push(maxPriority);
  }

  sql += ' ORDER BY cb.priority_rank ASC, bel.relevance ASC, cb.title ASC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ─── UNIVERSITY LAYER ─────────────────────────────────────────────────────────

async function getUniversities() {
  const [rows] = await pool.execute(
    `SELECT id, name, short_name, type, established_year,
            location_city, location_state, country, official_website,
            naac_grade, nirf_rank
     FROM universities WHERE is_active = 1
     ORDER BY type ASC, nirf_rank ASC, name ASC`
  );
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.type]) grouped[row.type] = [];
    grouped[row.type].push(row);
  }
  return grouped;
}

async function getUniversity(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, short_name, type, established_year,
            location_city, location_state, country, official_website,
            naac_grade, nirf_rank, is_active, created_at
     FROM universities WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function getUniversityCourses(universityId) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.name, c.short_name, c.level, c.duration_years,
            c.specialization, cc.name AS category, uc.intake
     FROM university_courses uc
     JOIN courses c ON c.id = uc.course_id
     JOIN course_categories cc ON cc.id = c.course_category_id
     WHERE uc.university_id = ? AND uc.is_active = 1 AND c.is_active = 1
     ORDER BY c.level ASC, c.short_name ASC`,
    [universityId]
  );
  return rows;
}

async function getCourseCategories() {
  const [rows] = await pool.execute(
    `SELECT id, name, type FROM course_categories WHERE is_active = 1
     ORDER BY type ASC, name ASC`
  );
  return rows;
}

async function getCourses(level = null) {
  let sql = `
    SELECT c.id, c.name, c.short_name, c.level, c.duration_years,
           c.specialization, cc.name AS category, cc.type AS category_type
    FROM courses c
    JOIN course_categories cc ON cc.id = c.course_category_id
    WHERE c.is_active = 1
  `;
  const params = [];
  if (level) { sql += ' AND c.level = ?'; params.push(level); }
  sql += ' ORDER BY c.level ASC, cc.name ASC, c.short_name ASC';
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getCourseSubjects(courseId, semester = null) {
  let sql = `
    SELECT id, name, subject_code, semester, year, subject_type,
           credits, is_common_across_uni, syllabus_body
    FROM university_subjects
    WHERE course_id = ? AND is_active = 1
  `;
  const params = [courseId];
  if (semester) { sql += ' AND semester = ?'; params.push(semester); }
  sql += ' ORDER BY semester ASC, year ASC, name ASC';
  const [rows] = await pool.execute(sql, params);

  if (semester) return rows;

  // Group by semester
  const grouped = {};
  for (const row of rows) {
    const key = row.semester || 'common';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }
  return grouped;
}

async function getUniversitySubjectBooks(subjectId) {
  const [rows] = await pool.execute(
    `SELECT ub.id, ub.title, ub.author, ub.edition, ub.publication_year,
            ub.book_type, ub.is_prescribed, ub.is_available_free,
            ub.priority_rank, ub.usage_tip,
            ub.amazon_affiliate_url, ub.flipkart_affiliate_url,
            ub.google_books_preview_url, ub.cover_image_url,
            p.name AS publisher_name, p.short_name AS publisher_short,
            ubsl.relevance
     FROM university_book_subject_links ubsl
     JOIN university_books ub ON ub.id = ubsl.university_book_id
     LEFT JOIN publishers p ON p.id = ub.publisher_id
     WHERE ubsl.university_subject_id = ? AND ub.is_active = 1
     ORDER BY ub.is_prescribed DESC, ub.priority_rank ASC, ub.title ASC`,
    [subjectId]
  );
  return rows;
}

async function getUniversityBooksRecommend({ courseId, subjectName, university, semester }) {
  let sql = `
    SELECT ub.id, ub.title, ub.author, ub.edition, ub.publication_year,
           ub.book_type, ub.is_prescribed, ub.is_available_free,
           ub.priority_rank, ub.usage_tip,
           ub.amazon_affiliate_url, ub.flipkart_affiliate_url,
           ub.google_books_preview_url, ub.cover_image_url,
           p.name AS publisher_name, p.short_name AS publisher_short,
           us.name AS subject_name, us.semester, us.subject_code
    FROM university_books ub
    JOIN university_book_subject_links ubsl ON ubsl.university_book_id = ub.id
    JOIN university_subjects us ON us.id = ubsl.university_subject_id
    LEFT JOIN publishers p ON p.id = ub.publisher_id
    WHERE ub.is_active = 1
  `;
  const params = [];

  if (courseId) {
    sql += ' AND us.course_id = ?';
    params.push(courseId);
  }
  if (subjectName) {
    sql += ' AND us.name LIKE ?';
    params.push(`%${subjectName}%`);
  }
  if (semester) {
    sql += ' AND us.semester = ?';
    params.push(semester);
  }

  sql += ' ORDER BY ub.is_prescribed DESC, ub.priority_rank ASC, ub.title ASC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getAIUniversityContext(universitySubjectId) {
  if (!universitySubjectId) return null;
  const [rows] = await pool.execute(
    `SELECT us.id AS subject_id, us.name AS subject_name, us.subject_code,
            us.semester, us.year, us.subject_type, us.credits,
            us.is_common_across_uni, us.syllabus_body,
            c.id AS course_id, c.name AS course_name, c.short_name AS course_short,
            c.level AS course_level, c.specialization,
            u.id AS university_id, u.name AS university_name,
            u.short_name AS university_short, u.type AS university_type
     FROM university_subjects us
     JOIN courses c ON c.id = us.course_id
     LEFT JOIN universities u ON u.id = us.university_id
     WHERE us.id = ? LIMIT 1`,
    [universitySubjectId]
  );
  return rows[0] || null;
}

// ─── AI CONTEXT (used by ai-library.service.js) ───────────────────────────────

async function getAIContext({ subjectId, chapterId, topicId }) {
  let ctx = null;
  if (subjectId) {
    const [rows] = await pool.execute(
      `SELECT
         s.id AS subject_id, s.name AS subject_name, s.code AS subject_code,
         s.subject_type, s.language_medium,
         c.id AS class_id, c.grade, c.grade_label, c.stream,
         b.id AS board_id, b.code AS board_code, b.name AS board_name, b.type AS board_type,
         sv.id AS sv_id, sv.version_name, sv.is_current, sv.academic_year_start, sv.changes_summary
       FROM subjects s
       JOIN classes c  ON c.id = s.class_id
       JOIN boards b   ON b.id = c.board_id
       JOIN syllabus_versions sv ON sv.id = c.syllabus_version_id
       WHERE s.id = ? LIMIT 1`,
      [subjectId]
    );
    ctx = rows[0] || null;
  }

  let chapter = null;
  if (chapterId) {
    const [rows] = await pool.execute(
      `SELECT id, chapter_number, title, description, key_concepts, learning_outcomes, estimated_study_time_mins
       FROM chapters WHERE id = ? LIMIT 1`,
      [chapterId]
    );
    if (rows.length) {
      chapter = {
        ...rows[0],
        key_concepts:      safeParseJSON(rows[0].key_concepts, []),
        learning_outcomes: safeParseJSON(rows[0].learning_outcomes, []),
      };
    }
  }

  let topic = null;
  if (topicId) {
    const [rows] = await pool.execute(
      `SELECT id, title, bloom_levels, weightage_percent,
              is_deleted_in_new_syllabus, is_new_in_current_syllabus
       FROM topics WHERE id = ? LIMIT 1`,
      [topicId]
    );
    if (rows.length) {
      topic = { ...rows[0], bloom_levels: safeParseJSON(rows[0].bloom_levels, []) };
    }
  }

  return { ctx, chapter, topic };
}

/**
 * Fetch exam + subject context for AI prompt (competitive mode).
 */
async function getAIExamContext(examCode) {
  if (!examCode) return null;
  const [rows] = await pool.execute(
    `SELECT id, code, name, exam_type AS type, exam_level AS level, state, conducting_body
     FROM exam_categories WHERE code = ? LIMIT 1`,
    [examCode.toUpperCase()]
  );
  return rows[0] || null;
}

function safeParseJSON(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

module.exports = {
  // school
  getBoards, getBoardByCode, getSyllabusVersions, getClasses, getSubjects,
  getBooks, getChapters, getTopics,
  // competitive
  getExams, getExamByCode, getExamSubjects, getExamBooks,
  // publishers
  getPublishers, getPublisherBooks,
  // recommendation
  getRecommendedBooks,
  // university layer
  getUniversities, getUniversity, getUniversityCourses,
  getCourseCategories, getCourses, getCourseSubjects,
  getUniversitySubjectBooks, getUniversityBooksRecommend,
  // AI context
  getAIContext, getAIExamContext, getAIUniversityContext,
};
