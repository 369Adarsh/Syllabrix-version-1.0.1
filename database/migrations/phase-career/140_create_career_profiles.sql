CREATE TABLE IF NOT EXISTS career_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  -- Professional identity
  current_role VARCHAR(200),
  current_company VARCHAR(200),
  experience_years TINYINT UNSIGNED DEFAULT 0,
  industry VARCHAR(100),
  primary_domain VARCHAR(100),

  -- Career goal
  career_goal ENUM('find_job','upskill','switch_career','freelance','promotion') DEFAULT 'upskill',
  target_role VARCHAR(200),
  preferred_location VARCHAR(200),
  salary_expectation VARCHAR(100),

  -- Onboarding state
  onboarding_completed TINYINT(1) DEFAULT 0,
  onboarding_step TINYINT UNSIGNED DEFAULT 1,

  -- Computed scores (refreshed by AI analysis)
  profile_strength TINYINT UNSIGNED DEFAULT 0,  -- 0-100

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_career (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
