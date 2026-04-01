-- ============================================================
-- FITNESS MODULE — User Activity Logs & Dashboard Metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_activity_logs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  action_type     VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(100),
  entity_id       INT UNSIGNED,
  metadata        JSON,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fal_user (user_id),
  INDEX idx_fal_action (action_type),
  INDEX idx_fal_created (created_at)
);

CREATE TABLE IF NOT EXISTS fitness_dashboard_metrics (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  metric_date     DATE NOT NULL,
  total_users     INT UNSIGNED DEFAULT 0,
  active_users    INT UNSIGNED DEFAULT 0,
  workouts_done   INT UNSIGNED DEFAULT 0,
  diets_followed  INT UNSIGNED DEFAULT 0,
  habits_logged   INT UNSIGNED DEFAULT 0,
  new_coaches     INT UNSIGNED DEFAULT 0,
  articles_viewed INT UNSIGNED DEFAULT 0,
  popular_goal    VARCHAR(100),
  metadata        JSON,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_metric_date (metric_date)
);
