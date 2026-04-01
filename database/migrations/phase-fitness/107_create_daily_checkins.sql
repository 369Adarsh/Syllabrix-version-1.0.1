-- ============================================================
-- FITNESS MODULE — Daily Check-ins
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_daily_checkins (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  checkin_date      DATE NOT NULL,
  water_ml          INT UNSIGNED DEFAULT 0,
  sleep_hours       DECIMAL(3,1),
  steps             INT UNSIGNED DEFAULT 0,
  mood              ENUM('great','good','okay','low','bad') DEFAULT 'okay',
  energy_level      TINYINT UNSIGNED DEFAULT 5,
  weight_kg         DECIMAL(5,1),
  notes             TEXT,
  calories_consumed INT UNSIGNED DEFAULT 0,
  calories_burned   INT UNSIGNED DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_date (user_id, checkin_date)
);
