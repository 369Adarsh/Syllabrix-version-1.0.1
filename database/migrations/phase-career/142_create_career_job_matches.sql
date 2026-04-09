CREATE TABLE IF NOT EXISTS career_job_matches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  company_name VARCHAR(200) NOT NULL,
  role_title VARCHAR(300) NOT NULL,
  location VARCHAR(200),
  salary_range VARCHAR(100),
  job_type ENUM('full_time','part_time','contract','freelance','internship') DEFAULT 'full_time',
  experience_required VARCHAR(100),

  fit_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  fit_category ENUM('high','medium','stretch') NOT NULL DEFAULT 'medium',
  match_reasons JSON,
  missing_skills JSON,

  apply_url VARCHAR(500),
  source VARCHAR(100) DEFAULT 'ai_generated',

  user_action ENUM('saved','applied','dismissed','interviewing') DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_fit (user_id, fit_score DESC),
  INDEX idx_user_active (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
