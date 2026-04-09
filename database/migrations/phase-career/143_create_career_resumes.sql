CREATE TABLE IF NOT EXISTS career_resumes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  version_name VARCHAR(200) NOT NULL DEFAULT 'General',
  resume_url VARCHAR(500),
  resume_text LONGTEXT,

  ats_score TINYINT UNSIGNED DEFAULT 0,
  missing_keywords JSON,
  keyword_suggestions JSON,

  ai_summary TEXT,
  ai_bullet_points JSON,
  ai_cover_letter TEXT,
  target_job_id INT UNSIGNED DEFAULT NULL,

  is_primary TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_resume (user_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
