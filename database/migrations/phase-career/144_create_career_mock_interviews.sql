CREATE TABLE IF NOT EXISTS career_mock_interviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  target_company VARCHAR(200),
  target_role VARCHAR(300),
  interview_type ENUM('hr','technical','behavioral','case_study','system_design') NOT NULL DEFAULT 'technical',

  questions JSON NOT NULL DEFAULT ('[]'),
  answers JSON DEFAULT NULL,

  overall_score TINYINT UNSIGNED DEFAULT NULL,
  question_scores JSON DEFAULT NULL,
  strengths JSON DEFAULT NULL,
  improvements JSON DEFAULT NULL,

  status ENUM('in_progress','completed') DEFAULT 'in_progress',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_interviews (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
