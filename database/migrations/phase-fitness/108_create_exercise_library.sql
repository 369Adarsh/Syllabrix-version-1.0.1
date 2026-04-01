-- ============================================================
-- FITNESS MODULE — Exercise Library
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_exercise_library (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  slug              VARCHAR(200) NOT NULL,
  category          ENUM('strength','cardio','yoga','mobility','stretching','hiit','pilates','calisthenics') NOT NULL,
  difficulty        ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  equipment         VARCHAR(200) DEFAULT 'bodyweight',
  primary_muscles   JSON,
  secondary_muscles JSON,
  body_part         ENUM('chest','back','shoulders','arms','core','legs','full_body','glutes','calves') NOT NULL,
  benefits          TEXT,
  instructions      TEXT,
  mistakes_to_avoid TEXT,
  precautions       TEXT,
  duration_seconds  INT UNSIGNED,
  calories_per_min  DECIMAL(4,1),
  video_url         VARCHAR(500),
  image_url         VARCHAR(500),
  model_3d_url      VARCHAR(500),
  tags              JSON,
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_exercise_slug (slug)
);
