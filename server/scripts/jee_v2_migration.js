const mysql = require('mysql2/promise');
const config = require('../src/config/env');

const columnExists = async (conn, table, column) => {
    const [rows] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
    return rows.length > 0;
};

const migrate = async () => {
    console.log('--- STARTING JEE V2 MIGRATION (ROBUST) ---');
    const conn = await mysql.createConnection({
        host: config.DB_SOCIAL.HOST,
        port: config.DB_SOCIAL.PORT,
        user: config.DB_SOCIAL.USER,
        password: config.DB_SOCIAL.PASSWORD,
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('1. Altering jee_topics...');
        if (!(await columnExists(conn, 'jee_topics', 'video_lectures'))) {
            await conn.query('ALTER TABLE jee_topics ADD COLUMN video_lectures JSON DEFAULT NULL');
            console.log('   ✓ Added video_lectures');
        } else {
            console.log('   - video_lectures already exists');
        }

        console.log('2. Altering jee_questions...');
        const qCols = ['is_verified', 'verified_by', 'report_count', 'content_source'];
        for (const col of qCols) {
            if (!(await columnExists(conn, 'jee_questions', col))) {
                let sql = `ALTER TABLE jee_questions ADD COLUMN ${col} `;
                if (col === 'is_verified') sql += 'TINYINT(1) DEFAULT 0';
                else if (col === 'verified_by') sql += 'VARCHAR(100) DEFAULT NULL';
                else if (col === 'report_count') sql += 'INT DEFAULT 0';
                else if (col === 'content_source') sql += `ENUM('real_pyq','ai_generated','expert_curated','community') DEFAULT 'ai_generated'`;
                
                await conn.query(sql);
                console.log(`   ✓ Added ${col}`);
            } else {
                console.log(`   - ${col} already exists`);
            }
        }

        console.log('3. Creating jee_ncert_solutions...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS jee_ncert_solutions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                subject_id INT UNSIGNED NOT NULL,
                class_level TINYINT NOT NULL,
                book_type ENUM('textbook','exemplar') NOT NULL,
                chapter_number TINYINT NOT NULL,
                chapter_name VARCHAR(300) NOT NULL,
                exercise_name VARCHAR(200) NOT NULL,
                question_number VARCHAR(20) NOT NULL,
                question_text TEXT NOT NULL,
                question_image_url VARCHAR(500),
                solution_text TEXT NOT NULL,
                solution_image_url VARCHAR(500),
                key_concept VARCHAR(300),
                difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
                is_verified TINYINT(1) DEFAULT 0,
                verified_by VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES jee_subjects(id),
                INDEX idx_ncert_chapter (subject_id, class_level, book_type, chapter_number),
                UNIQUE KEY uk_ncert_q (subject_id, class_level, book_type, chapter_number, exercise_name, question_number)
            )
        `);

        console.log('4. Creating jee_book_solutions...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS jee_book_solutions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                book_slug VARCHAR(100) NOT NULL,
                book_name VARCHAR(300) NOT NULL,
                subject_id INT UNSIGNED NOT NULL,
                chapter_number TINYINT NOT NULL,
                chapter_name VARCHAR(300) NOT NULL,
                exercise_type VARCHAR(100) NOT NULL,
                question_number VARCHAR(20) NOT NULL,
                question_text TEXT NOT NULL,
                question_image_url VARCHAR(500),
                solution_text TEXT NOT NULL,
                solution_image_url VARCHAR(500),
                difficulty ENUM('easy','medium','hard','advanced') DEFAULT 'medium',
                is_verified TINYINT(1) DEFAULT 0,
                is_premium TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES jee_subjects(id),
                INDEX idx_book_chapter (book_slug, chapter_number)
            )
        `);

        console.log('5. Creating jee_content_reports...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS jee_content_reports (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNSIGNED NOT NULL,
                content_type ENUM('question','ncert_solution','book_solution','topic_notes') NOT NULL,
                content_id INT UNSIGNED NOT NULL,
                report_reason ENUM('wrong_answer','wrong_solution','typo','unclear','missing_step','other') NOT NULL,
                description TEXT,
                status ENUM('pending','reviewed','fixed','rejected') DEFAULT 'pending',
                reviewed_by VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        console.log('6. Creating jee_teacher_doubts...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS jee_teacher_doubts (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                student_id INT UNSIGNED NOT NULL,
                teacher_id INT UNSIGNED,
                subject VARCHAR(50) NOT NULL,
                chapter VARCHAR(200),
                question_text TEXT NOT NULL,
                question_image_url VARCHAR(500),
                ai_answer TEXT,
                teacher_answer TEXT,
                teacher_answer_image_url VARCHAR(500),
                status ENUM('open','claimed','answered','rated') DEFAULT 'open',
                amount DECIMAL(10,2) DEFAULT 20.00,
                payment_status ENUM('pending','paid','refunded') DEFAULT 'pending',
                student_rating TINYINT,
                student_feedback TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                answered_at DATETIME,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            )
        `);

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
    } catch (e) {
        console.error('--- MIGRATION FAILED ---');
        console.error(e);
    } finally {
        await conn.end();
    }
};

migrate();
