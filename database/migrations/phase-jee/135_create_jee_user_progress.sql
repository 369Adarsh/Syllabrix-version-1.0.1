CREATE TABLE IF NOT EXISTS jee_user_progress (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  chapter_id INT UNSIGNED NOT NULL,
  theory_completed TINYINT(1) DEFAULT 0,
  formulas_reviewed TINYINT(1) DEFAULT 0,
  examples_completed INT DEFAULT 0,
  total_examples INT DEFAULT 0,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  mastery_level ENUM('not_started','beginner','intermediate','advanced','mastered') DEFAULT 'not_started',
  last_studied_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES jee_chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_chapter (user_id, chapter_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jee_error_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  selected_answer VARCHAR(500),
  correct_answer VARCHAR(500),
  error_type ENUM('conceptual','calculation','silly','misread','time_pressure','guessed') DEFAULT 'conceptual',
  source_type ENUM('mock_test','pyq_practice','topic_test','daily_challenge') NOT NULL,
  source_id INT UNSIGNED,
  reviewed TINYINT(1) DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES jee_questions(id),
  INDEX idx_user_errors (user_id, error_type),
  INDEX idx_user_reviewed (user_id, reviewed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jee_bookmarks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  bookmark_type ENUM('question','topic','formula','chapter') NOT NULL,
  reference_id INT UNSIGNED NOT NULL,
  folder VARCHAR(100) DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_bookmark (user_id, bookmark_type, reference_id),
  INDEX idx_user_type (user_id, bookmark_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jee_study_plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  plan_date DATE NOT NULL,
  tasks JSON NOT NULL,
  total_planned_minutes INT DEFAULT 0,
  total_completed_minutes INT DEFAULT 0,
  generated_by ENUM('ai','manual') DEFAULT 'ai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jee_subscriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  plan ENUM('free','pro','elite') NOT NULL DEFAULT 'free',
  amount_paid DECIMAL(10,2) DEFAULT 0,
  razorpay_order_id VARCHAR(200),
  razorpay_payment_id VARCHAR(200),
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  is_trial TINYINT(1) DEFAULT 0,
  status ENUM('active','expired','cancelled') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sub (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
