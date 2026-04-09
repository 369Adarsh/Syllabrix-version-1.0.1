CREATE TABLE IF NOT EXISTS career_learning_paths (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  skill_name VARCHAR(200) NOT NULL,
  total_days TINYINT UNSIGNED NOT NULL DEFAULT 10,
  difficulty ENUM('beginner','intermediate','advanced') DEFAULT 'intermediate',

  daily_plan JSON NOT NULL DEFAULT ('[]'),

  current_day TINYINT UNSIGNED DEFAULT 0,
  completed_days JSON DEFAULT ('[]'),
  started_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  status ENUM('not_started','in_progress','completed','paused') DEFAULT 'not_started',

  generated_from ENUM('skill_gap','job_bridge','manual','certification_prep') DEFAULT 'skill_gap',
  source_job_id INT UNSIGNED DEFAULT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
