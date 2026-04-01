-- ============================================================
-- FITNESS MODULE — Coach Profiles, Availability, Enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_coach_profiles (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  full_name         VARCHAR(200) NOT NULL,
  bio               TEXT,
  specialization    JSON,
  certifications    JSON,
  years_experience  TINYINT UNSIGNED DEFAULT 0,
  pricing_monthly   DECIMAL(10,2),
  pricing_session   DECIMAL(10,2),
  languages         JSON,
  mode              ENUM('online','offline','both') DEFAULT 'online',
  profile_image_url VARCHAR(500),
  location          VARCHAR(200),
  rating            DECIMAL(2,1) DEFAULT 0.0,
  total_clients     INT UNSIGNED DEFAULT 0,
  total_plans       INT UNSIGNED DEFAULT 0,
  status            ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  is_featured       TINYINT(1) DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_coach_user (user_id),
  INDEX idx_cp_status (status)
);

CREATE TABLE IF NOT EXISTS fitness_coach_availability (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coach_id        INT UNSIGNED NOT NULL,
  day_of_week     TINYINT UNSIGNED NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    TINYINT(1) DEFAULT 1,
  FOREIGN KEY (coach_id) REFERENCES fitness_coach_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fitness_coach_enrollments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coach_id        INT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  status          ENUM('pending','active','paused','completed','cancelled') DEFAULT 'pending',
  plan_type       VARCHAR(100),
  start_date      DATE,
  end_date        DATE,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES fitness_coach_profiles(id),
  INDEX idx_ce_coach (coach_id),
  INDEX idx_ce_user (user_id)
);
