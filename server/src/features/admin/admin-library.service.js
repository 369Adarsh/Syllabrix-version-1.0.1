const { pool } = require('../../database/connection');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary-upload');

class AdminLibraryService {
  async ensureUploadsTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lib_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_public_id VARCHAR(300),
        file_name VARCHAR(300),
        file_size_bytes BIGINT,
        file_type ENUM('textbook','reference','notes','pyq','solutions','supplement') DEFAULT 'textbook',
        description TEXT,
        ai_indexed TINYINT(1) DEFAULT 0,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  // ── STATS ──────────────────────────────────────────────────────────────────

  async getStats() {
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM boards WHERE is_active = 1) as boards,
        (SELECT COUNT(*) FROM classes) as classes,
        (SELECT COUNT(*) FROM subjects WHERE is_active = 1) as subjects,
        (SELECT COUNT(*) FROM books) as books,
        (SELECT COUNT(*) FROM chapters) as chapters,
        (SELECT COUNT(*) FROM topics) as topics
    `);
    let upStats = { uploads: 0, ai_indexed: 0 };
    try {
      const [[u]] = await pool.query(
        'SELECT COUNT(*) as uploads, COALESCE(SUM(ai_indexed),0) as ai_indexed FROM lib_uploads'
      );
      upStats = u;
    } catch (_) {}
    return { ...stats, ...upStats };
  }

  // ── TREE (for sidebar navigation) ─────────────────────────────────────────

  async getTree() {
    const [boards] = await pool.query(`
      SELECT b.id, b.code, b.name, b.type, b.state, b.is_active,
        COUNT(DISTINCT cl.id) as class_count,
        COUNT(DISTINCT bk.id) as book_count
      FROM boards b
      LEFT JOIN classes cl ON cl.board_id = b.id
      LEFT JOIN subjects s ON s.class_id = cl.id AND s.is_active = 1
      LEFT JOIN books bk ON bk.subject_id = s.id
      WHERE b.is_active = 1
      GROUP BY b.id
      ORDER BY b.type, b.name
    `);

    const [classes] = await pool.query(`
      SELECT cl.id, cl.board_id, cl.grade, cl.grade_label, cl.stream,
        COUNT(DISTINCT s.id) as subject_count
      FROM classes cl
      LEFT JOIN subjects s ON s.class_id = cl.id AND s.is_active = 1
      GROUP BY cl.id
      ORDER BY cl.board_id, (cl.grade + 0), cl.grade, cl.stream
    `);

    const [subjects] = await pool.query(`
      SELECT s.id, s.class_id, s.name, s.code, s.subject_type,
        COUNT(bk.id) as book_count
      FROM subjects s
      LEFT JOIN books bk ON bk.subject_id = s.id
      WHERE s.is_active = 1
      GROUP BY s.id
      ORDER BY s.class_id, s.subject_type, s.name
    `);

    return boards.map(b => ({
      ...b,
      classes: classes
        .filter(c => c.board_id === b.id)
        .map(cls => ({
          ...cls,
          subjects: subjects.filter(s => s.class_id === cls.id),
        })),
    }));
  }

  // ── BOARDS ─────────────────────────────────────────────────────────────────

  async getBoards() {
    const [rows] = await pool.query(`
      SELECT b.id, b.code, b.name, b.type, b.state, b.country, b.is_active,
        COUNT(DISTINCT cl.id) as class_count,
        COUNT(DISTINCT s.id) as subject_count,
        COUNT(DISTINCT bk.id) as book_count
      FROM boards b
      LEFT JOIN classes cl ON cl.board_id = b.id
      LEFT JOIN subjects s ON s.class_id = cl.id AND s.is_active = 1
      LEFT JOIN books bk ON bk.subject_id = s.id
      GROUP BY b.id
      ORDER BY b.type, b.name
    `);
    return rows;
  }

  async createBoard({ name, code, type, state, country }) {
    const [r] = await pool.query(
      'INSERT INTO boards (name, code, type, state, country, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, code.toUpperCase(), type || 'national', state || null, country || 'India']
    );
    return { id: r.insertId, name, code: code.toUpperCase() };
  }

  // ── CLASSES ────────────────────────────────────────────────────────────────

  async getClasses(board_id) {
    const [rows] = await pool.query(`
      SELECT cl.id, cl.board_id, cl.grade, cl.grade_label, cl.stream,
        COUNT(DISTINCT s.id) as subject_count,
        COUNT(DISTINCT bk.id) as book_count
      FROM classes cl
      LEFT JOIN subjects s ON s.class_id = cl.id AND s.is_active = 1
      LEFT JOIN books bk ON bk.subject_id = s.id
      WHERE cl.board_id = ?
      GROUP BY cl.id
      ORDER BY (cl.grade + 0), cl.grade, cl.stream
    `, [board_id]);
    return rows;
  }

  async createClass({ board_id, grade, grade_label, stream }) {
    const [sv] = await pool.query(
      'SELECT id FROM syllabus_versions WHERE board_id = ? AND is_current = 1 LIMIT 1',
      [board_id]
    );
    const svId = sv[0]?.id || null;
    const [r] = await pool.query(
      'INSERT INTO classes (board_id, grade, grade_label, stream, syllabus_version_id) VALUES (?, ?, ?, ?, ?)',
      [board_id, grade, grade_label || `Class ${grade}`, stream || null, svId]
    );
    return { id: r.insertId, grade };
  }

  // ── SUBJECTS ───────────────────────────────────────────────────────────────

  async getSubjects(class_id) {
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.code, s.subject_type, s.language_medium, s.is_active,
        COUNT(bk.id) as book_count
      FROM subjects s
      LEFT JOIN books bk ON bk.subject_id = s.id
      WHERE s.class_id = ?
      GROUP BY s.id
      ORDER BY s.subject_type, s.name
    `, [class_id]);
    return rows;
  }

  async createSubject({ class_id, name, code, subject_type, language_medium }) {
    const [r] = await pool.query(
      'INSERT INTO subjects (class_id, name, code, subject_type, language_medium, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [class_id, name, code || null, subject_type || 'core', language_medium || 'English']
    );
    return { id: r.insertId, name };
  }

  async deleteSubject(id) {
    await pool.query('UPDATE subjects SET is_active = 0 WHERE id = ?', [id]);
  }

  // ── BOOKS ──────────────────────────────────────────────────────────────────

  async getBooks(subject_id) {
    const [rows] = await pool.query(`
      SELECT b.id, b.title, b.publisher, b.edition, b.publication_year,
        b.is_official, b.ncert_url, b.cover_image_url, b.is_available_free,
        b.priority_rank, b.google_books_preview_url,
        p.name as publisher_name,
        COUNT(DISTINCT ch.id) as chapter_count
      FROM books b
      LEFT JOIN publishers p ON p.id = b.publisher_id
      LEFT JOIN chapters ch ON ch.book_id = b.id
      WHERE b.subject_id = ?
      GROUP BY b.id
      ORDER BY b.is_official DESC, b.priority_rank ASC, b.title ASC
    `, [subject_id]);

    if (rows.length > 0) {
      try {
        await this.ensureUploadsTable();
        const ids = rows.map(r => r.id);
        const [uploads] = await pool.query(
          `SELECT * FROM lib_uploads WHERE entity_type = 'book' AND entity_id IN (?)`,
          [ids]
        );
        rows.forEach(row => { row.uploads = uploads.filter(u => u.entity_id === row.id); });
      } catch (_) {
        rows.forEach(row => { row.uploads = []; });
      }
    }
    return rows;
  }

  async createBook(data, file, adminId) {
    const { subject_id, title, publisher, edition, publication_year,
            is_official, ncert_url, cover_image_url, priority_rank, is_available_free } = data;

    let publisherId = null;
    if (publisher) {
      const [p] = await pool.query('SELECT id FROM publishers WHERE name = ? LIMIT 1', [publisher]);
      if (p[0]) {
        publisherId = p[0].id;
      } else {
        const initials = publisher.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 6);
        const [pr] = await pool.query(
          'INSERT INTO publishers (name, short_name) VALUES (?, ?)',
          [publisher, initials]
        );
        publisherId = pr.insertId;
      }
    }

    const [r] = await pool.query(
      `INSERT INTO books (subject_id, title, publisher_id, publisher, edition, publication_year,
        is_official, ncert_url, cover_image_url, priority_rank, is_available_free)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, title, publisherId, publisher || null, edition || null,
       publication_year || null, is_official ? 1 : 0, ncert_url || null,
       cover_image_url || null, priority_rank || 99, is_available_free ? 1 : 0]
    );
    const bookId = r.insertId;

    if (file) {
      await this.uploadFileForEntity('book', bookId, file, { description: title, file_type: 'textbook' }, adminId);
    }

    return { id: bookId, title };
  }

  async deleteBook(id) {
    await pool.query('DELETE FROM books WHERE id = ?', [id]);
  }

  // ── CHAPTERS ───────────────────────────────────────────────────────────────

  async getChapters(book_id) {
    const [rows] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description,
        ch.key_concepts, ch.learning_outcomes, ch.estimated_study_time_mins,
        COUNT(t.id) as topic_count
      FROM chapters ch
      LEFT JOIN topics t ON t.chapter_id = ch.id
      WHERE ch.book_id = ?
      GROUP BY ch.id
      ORDER BY ch.chapter_number ASC
    `, [book_id]);
    return rows;
  }

  async createChapter({ book_id, chapter_number, title, description, key_concepts, learning_outcomes, estimated_study_time_mins }) {
    const [r] = await pool.query(
      `INSERT INTO chapters (book_id, chapter_number, title, description, key_concepts, learning_outcomes, estimated_study_time_mins)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [book_id, chapter_number || null, title, description || null,
       key_concepts ? JSON.stringify(Array.isArray(key_concepts) ? key_concepts : [key_concepts]) : null,
       learning_outcomes ? JSON.stringify(Array.isArray(learning_outcomes) ? learning_outcomes : [learning_outcomes]) : null,
       estimated_study_time_mins || null]
    );
    return { id: r.insertId, title };
  }

  async deleteChapter(id) {
    await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
  }

  // ── TOPICS ─────────────────────────────────────────────────────────────────

  async getTopics(chapter_id) {
    const [rows] = await pool.query(
      'SELECT * FROM topics WHERE chapter_id = ? ORDER BY topic_order ASC',
      [chapter_id]
    );
    return rows;
  }

  async createTopic({ chapter_id, title, topic_order, bloom_levels, weightage_percent }) {
    const [r] = await pool.query(
      'INSERT INTO topics (chapter_id, title, topic_order, bloom_levels, weightage_percent) VALUES (?, ?, ?, ?, ?)',
      [chapter_id, title, topic_order || 1,
       bloom_levels ? JSON.stringify(bloom_levels) : null,
       weightage_percent || null]
    );
    return { id: r.insertId, title };
  }

  async deleteTopic(id) {
    await pool.query('DELETE FROM topics WHERE id = ?', [id]);
  }

  // ── FILE UPLOADS ───────────────────────────────────────────────────────────

  async uploadFileForEntity(entity_type, entity_id, file, meta = {}, adminId) {
    await this.ensureUploadsTable();
    const result = await uploadToCloudinary(file.buffer, {
      folder: `syllabrix-library/${entity_type}s/${entity_id}`,
      resourceType: 'raw',
      public_id: `${entity_type}_${entity_id}_${Date.now()}`,
    });
    const [r] = await pool.query(
      `INSERT INTO lib_uploads (entity_type, entity_id, file_url, file_public_id, file_name, file_size_bytes, file_type, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [entity_type, entity_id, result.url, result.publicId, file.originalname,
       file.size, meta.file_type || 'textbook', meta.description || null, adminId || null]
    );
    return { id: r.insertId, url: result.url };
  }

  async getUploads(entity_type, entity_id) {
    await this.ensureUploadsTable();
    const [rows] = await pool.query(
      `SELECT u.*, a.full_name as uploader_name
       FROM lib_uploads u
       LEFT JOIN users a ON a.id = u.uploaded_by
       WHERE u.entity_type = ? AND u.entity_id = ?
       ORDER BY u.created_at DESC`,
      [entity_type, entity_id]
    );
    return rows;
  }

  async toggleAiIndex(upload_id) {
    await pool.query('UPDATE lib_uploads SET ai_indexed = NOT ai_indexed WHERE id = ?', [upload_id]);
    const [[u]] = await pool.query('SELECT ai_indexed FROM lib_uploads WHERE id = ?', [upload_id]);
    return { ai_indexed: u.ai_indexed };
  }

  async deleteUpload(id) {
    const [[u]] = await pool.query('SELECT file_public_id FROM lib_uploads WHERE id = ?', [id]).catch(() => [[null]]);
    await pool.query('DELETE FROM lib_uploads WHERE id = ?', [id]);
    if (u?.file_public_id) {
      try { await deleteFromCloudinary(u.file_public_id); } catch (_) {}
    }
  }

  // ── COMPETITIVE EXAMS ──────────────────────────────────────────────────────

  async getExamTree() {
    const [exams] = await pool.query(`
      SELECT ec.id, ec.code, ec.name, ec.exam_type, ec.exam_level, ec.conducting_body,
        COUNT(DISTINCT cs.id) as subject_count,
        COUNT(DISTINCT cb.id) as book_count
      FROM exam_categories ec
      LEFT JOIN competitive_subjects cs ON cs.exam_category_id = ec.id AND cs.is_active = 1
      LEFT JOIN competitive_books cb ON cb.competitive_subject_id = cs.id AND cb.is_active = 1
      WHERE ec.is_active = 1 AND ec.code IS NOT NULL
      GROUP BY ec.id
      ORDER BY ec.exam_type, ec.exam_level, ec.name
    `);
    const grouped = {};
    for (const exam of exams) {
      const type = exam.exam_type || 'other';
      if (!grouped[type]) grouped[type] = { type, exams: [] };
      grouped[type].exams.push(exam);
    }
    return grouped;
  }

  async getExamSubjects(exam_id) {
    const [rows] = await pool.query(`
      SELECT cs.id, cs.name, cs.parent_subject, cs.sub_category, cs.description,
        cs.weightage_percent, cs.is_active,
        COUNT(cb.id) as book_count
      FROM competitive_subjects cs
      LEFT JOIN competitive_books cb ON cb.competitive_subject_id = cs.id AND cb.is_active = 1
      WHERE cs.exam_category_id = ? AND cs.is_active = 1
      GROUP BY cs.id
      ORDER BY cs.parent_subject, cs.weightage_percent DESC, cs.name
    `, [exam_id]);
    return rows;
  }

  async getCompetitiveBooks(subject_id) {
    const [rows] = await pool.query(`
      SELECT cb.id, cb.title, cb.author, cb.edition, cb.publication_year,
        cb.priority_rank, cb.usage_tip, cb.is_available_free,
        cb.google_books_preview_url, cb.cover_image_url,
        p.name as publisher_name
      FROM competitive_books cb
      LEFT JOIN publishers p ON p.id = cb.publisher_id
      WHERE cb.competitive_subject_id = ? AND cb.is_active = 1
      ORDER BY cb.priority_rank ASC, cb.title ASC
    `, [subject_id]);
    if (rows.length > 0) {
      try {
        await this.ensureUploadsTable();
        const ids = rows.map(r => r.id);
        const [uploads] = await pool.query(
          `SELECT * FROM lib_uploads WHERE entity_type = 'competitive_book' AND entity_id IN (?)`, [ids]
        );
        rows.forEach(r => { r.uploads = uploads.filter(u => u.entity_id === r.id); });
      } catch (_) { rows.forEach(r => { r.uploads = []; }); }
    }
    return rows;
  }

  // ── UNIVERSITY ──────────────────────────────────────────────────────────────

  async getUniversityTree() {
    const [categories] = await pool.query(`
      SELECT cc.id, cc.name, cc.type,
        COUNT(DISTINCT c.id) as course_count
      FROM course_categories cc
      LEFT JOIN courses c ON c.course_category_id = cc.id AND c.is_active = 1
      WHERE cc.is_active = 1
      GROUP BY cc.id
      ORDER BY cc.type, cc.name
    `);
    const [courses] = await pool.query(`
      SELECT c.id, c.name, c.short_name, c.level, c.duration_years,
        c.specialization, c.course_category_id,
        COUNT(DISTINCT us.id) as subject_count
      FROM courses c
      LEFT JOIN university_subjects us ON us.course_id = c.id AND us.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.level, c.short_name
    `);
    return categories.map(cat => ({
      ...cat,
      courses: courses.filter(c => c.course_category_id === cat.id),
    }));
  }

  async getUniversitySubjects(course_id) {
    const [rows] = await pool.query(`
      SELECT id, name, subject_code, semester, year, subject_type, credits
      FROM university_subjects
      WHERE course_id = ? AND is_active = 1
      ORDER BY semester, year, name
    `, [course_id]);
    const grouped = {};
    for (const row of rows) {
      const key = row.semester ? `Semester ${row.semester}` : (row.year ? `Year ${row.year}` : 'Common');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    return grouped;
  }

  async getUniversitySubjectBooks(subject_id) {
    const [rows] = await pool.query(`
      SELECT ub.id, ub.title, ub.author, ub.edition, ub.publication_year,
        ub.book_type, ub.is_prescribed, ub.is_available_free, ub.priority_rank,
        ub.google_books_preview_url, ub.cover_image_url,
        p.name as publisher_name
      FROM university_book_subject_links ubsl
      JOIN university_books ub ON ub.id = ubsl.university_book_id
      LEFT JOIN publishers p ON p.id = ub.publisher_id
      WHERE ubsl.university_subject_id = ? AND ub.is_active = 1
      ORDER BY ub.is_prescribed DESC, ub.priority_rank ASC, ub.title ASC
    `, [subject_id]);
    if (rows.length > 0) {
      try {
        await this.ensureUploadsTable();
        const ids = rows.map(r => r.id);
        const [uploads] = await pool.query(
          `SELECT * FROM lib_uploads WHERE entity_type = 'university_book' AND entity_id IN (?)`, [ids]
        );
        rows.forEach(r => { r.uploads = uploads.filter(u => u.entity_id === r.id); });
      } catch (_) { rows.forEach(r => { r.uploads = []; }); }
    }
    return rows;
  }

  // ── SEARCH ─────────────────────────────────────────────────────────────────

  async search(q) {
    const like = `%${q}%`;
    const [books] = await pool.query(`
      SELECT b.id, b.title, b.is_official, b.publisher,
        s.name as subject_name, cl.grade, bd.name as board_name, bd.code as board_code
      FROM books b
      JOIN subjects s ON s.id = b.subject_id
      JOIN classes cl ON cl.id = s.class_id
      JOIN boards bd ON bd.id = cl.board_id
      WHERE b.title LIKE ? OR b.publisher LIKE ?
      LIMIT 15
    `, [like, like]);

    const [subjects] = await pool.query(`
      SELECT s.id, s.name, cl.grade, bd.name as board_name, bd.code as board_code
      FROM subjects s
      JOIN classes cl ON cl.id = s.class_id
      JOIN boards bd ON bd.id = cl.board_id
      WHERE s.name LIKE ? AND s.is_active = 1
      LIMIT 10
    `, [like]);

    const [chapters] = await pool.query(`
      SELECT ch.id, ch.title, ch.chapter_number,
        b.id as book_id, b.title as book_title,
        s.name as subject_name, cl.grade, bd.code as board_code
      FROM chapters ch
      JOIN books b ON b.id = ch.book_id
      JOIN subjects s ON s.id = b.subject_id
      JOIN classes cl ON cl.id = s.class_id
      JOIN boards bd ON bd.id = cl.board_id
      WHERE ch.title LIKE ?
      LIMIT 15
    `, [like]);

    return { books, subjects, chapters };
  }
}

module.exports = new AdminLibraryService();
