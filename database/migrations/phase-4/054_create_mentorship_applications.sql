CREATE TABLE mentorship_applications (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id INT UNSIGNED NOT NULL,
    mentor_id INT UNSIGNED NOT NULL,
    profession_id INT UNSIGNED NULL,
    message TEXT NOT NULL,
    goals TEXT NULL,
    status ENUM('pending','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
    mentor_note TEXT NULL,
    status_updated_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ma (student_id, mentor_id),
    INDEX idx_ma_mentor (mentor_id),
    INDEX idx_ma_status (status),
    CONSTRAINT fk_ma_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ma_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ma_profession FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
