-- ============================================================
-- FITNESS MODULE — Progress Tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_progress_logs (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  log_date          DATE NOT NULL,
  weight_kg         DECIMAL(5,1),
  body_fat_pct      DECIMAL(4,1),
  chest_cm          DECIMAL(5,1),
  waist_cm          DECIMAL(5,1),
  hips_cm           DECIMAL(5,1),
  biceps_cm         DECIMAL(5,1),
  thighs_cm         DECIMAL(5,1),
  workouts_completed TINYINT UNSIGNED DEFAULT 0,
  meals_followed     TINYINT UNSIGNED DEFAULT 0,
  habits_completed   TINYINT UNSIGNED DEFAULT 0,
  notes             TEXT,
  photo_url         VARCHAR(500),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress_user_date (user_id, log_date),
  INDEX idx_pl_user (user_id)
);
