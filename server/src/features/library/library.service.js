const { pool } = require('../../database/connection');

// ── Boards ─────────────────────────────────────────────────────────────────────

/**
 * Returns all active boards grouped by type: national, state, international.
 */
async function getBoards() {
  const [rows] = await pool.execute(
    `SELECT id, code, name, type, state, country, official_website
     FROM boards WHERE is_active = 1
     ORDER BY type ASC, state ASC, name ASC`
  );
  // Group by type
  const grouped = { national: [], state: [], international: [] };
  for (const row of rows) {
    grouped[row.type] = grouped[row.type] || [];
    grouped[row.type].push(row);
  }
  return grouped;
}

/**
 * Returns a single board by code.
 */
async function getBoardByCode(code) {
  const [rows] = await pool.execute(
    `SELECT id, code, name, type, state, country, official_website, is_active, created_at
     FROM boards WHERE code = ? LIMIT 1`,
    [code.toUpperCase()]
  );
  return rows[0] || null;
}

// ── Syllabus versions ──────────────────────────────────────────────────────────

/**
 * Returns all syllabus versions for a board (identified by code).
 */
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

// ── Classes ────────────────────────────────────────────────────────────────────

/**
 * Returns classes for a board.
 * If syllabusVersionId is provided, filters by it; otherwise uses the current version.
 */
async function getClasses(boardCode, syllabusVersionId = null) {
  let svId = syllabusVersionId;

  if (!svId) {
    const [svRows] = await pool.execute(
      `SELECT sv.id FROM syllabus_versions sv
       JOIN boards b ON b.id = sv.board_id
       WHERE b.code = ? AND sv.is_current = 1
       LIMIT 1`,
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

// ── Subjects ───────────────────────────────────────────────────────────────────

/**
 * Returns all active subjects for a given class id.
 */
async function getSubjects(classId) {
  const [rows] = await pool.execute(
    `SELECT id, name, code, subject_type, language_medium
     FROM subjects
     WHERE class_id = ? AND is_active = 1
     ORDER BY subject_type ASC, name ASC`,
    [classId]
  );
  return rows;
}

// ── Books ──────────────────────────────────────────────────────────────────────

/**
 * Returns all books for a given subject id.
 */
async function getBooks(subjectId) {
  const [rows] = await pool.execute(
    `SELECT id, title, publisher, edition, publication_year,
            is_official, ncert_url, cover_image_url, is_available_free
     FROM books
     WHERE subject_id = ?
     ORDER BY is_official DESC, publication_year DESC`,
    [subjectId]
  );
  return rows;
}

// ── Chapters ───────────────────────────────────────────────────────────────────

/**
 * Returns all chapters for a given book id.
 */
async function getChapters(bookId) {
  const [rows] = await pool.execute(
    `SELECT id, chapter_number, title, description,
            key_concepts, learning_outcomes, estimated_study_time_mins
     FROM chapters
     WHERE book_id = ?
     ORDER BY chapter_number ASC`,
    [bookId]
  );
  // Parse JSON fields
  return rows.map(r => ({
    ...r,
    key_concepts:      safeParseJSON(r.key_concepts, []),
    learning_outcomes: safeParseJSON(r.learning_outcomes, []),
  }));
}

// ── Topics ─────────────────────────────────────────────────────────────────────

/**
 * Returns all topics for a given chapter id.
 */
async function getTopics(chapterId) {
  const [rows] = await pool.execute(
    `SELECT id, title, topic_order, bloom_levels, weightage_percent,
            is_deleted_in_new_syllabus, is_new_in_current_syllabus
     FROM topics
     WHERE chapter_id = ?
     ORDER BY topic_order ASC`,
    [chapterId]
  );
  return rows.map(r => ({
    ...r,
    bloom_levels: safeParseJSON(r.bloom_levels, []),
  }));
}

// ── Context fetch for AI service ───────────────────────────────────────────────

/**
 * Fetches full context for the AI prompt:
 * board → syllabus_version → subject (with class) → book → chapter → topic
 */
async function getAIContext({ subjectId, chapterId, topicId, syllabusVersionId }) {
  // Subject + class + board + syllabus_version
  const [subjectRows] = await pool.execute(
    `SELECT
       s.id AS subject_id, s.name AS subject_name, s.code AS subject_code,
       s.subject_type, s.language_medium,
       c.id AS class_id, c.grade, c.grade_label, c.stream,
       b.id AS board_id, b.code AS board_code, b.name AS board_name, b.type AS board_type,
       sv.id AS sv_id, sv.version_name, sv.is_current, sv.academic_year_start, sv.changes_summary
     FROM subjects s
     JOIN classes c ON c.id = s.class_id
     JOIN boards b ON b.id = c.board_id
     JOIN syllabus_versions sv ON sv.id = c.syllabus_version_id
     WHERE s.id = ?
     LIMIT 1`,
    [subjectId]
  );
  const ctx = subjectRows[0] || null;

  let chapter = null;
  let topic = null;

  if (chapterId) {
    const [chRows] = await pool.execute(
      `SELECT id, chapter_number, title, description, key_concepts, learning_outcomes, estimated_study_time_mins
       FROM chapters WHERE id = ? LIMIT 1`,
      [chapterId]
    );
    if (chRows.length) {
      chapter = {
        ...chRows[0],
        key_concepts:      safeParseJSON(chRows[0].key_concepts, []),
        learning_outcomes: safeParseJSON(chRows[0].learning_outcomes, []),
      };
    }
  }

  if (topicId) {
    const [tRows] = await pool.execute(
      `SELECT id, title, bloom_levels, weightage_percent,
              is_deleted_in_new_syllabus, is_new_in_current_syllabus
       FROM topics WHERE id = ? LIMIT 1`,
      [topicId]
    );
    if (tRows.length) {
      topic = {
        ...tRows[0],
        bloom_levels: safeParseJSON(tRows[0].bloom_levels, []),
      };
    }
  }

  return { ctx, chapter, topic };
}

function safeParseJSON(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

module.exports = {
  getBoards,
  getBoardByCode,
  getSyllabusVersions,
  getClasses,
  getSubjects,
  getBooks,
  getChapters,
  getTopics,
  getAIContext,
};
