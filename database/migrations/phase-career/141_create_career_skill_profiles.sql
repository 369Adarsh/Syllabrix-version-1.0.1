CREATE TABLE IF NOT EXISTS career_skill_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  skills_detected JSON,
  skills_in_demand JSON,
  skill_gaps JSON,

  market_fit_score TINYINT UNSIGNED DEFAULT 0,
  market_percentile TINYINT UNSIGNED DEFAULT 50,
  total_skills_matched SMALLINT UNSIGNED DEFAULT 0,
  total_skills_demanded SMALLINT UNSIGNED DEFAULT 0,

  industry VARCHAR(100),
  primary_domain VARCHAR(100),
  last_analyzed_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_skills (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
