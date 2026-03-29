-- Migration 080: Stories (24-hour ephemeral media)
-- UP

CREATE TABLE stories (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  media_url    VARCHAR(500) NOT NULL,
  media_type   ENUM('image','video') DEFAULT 'image',
  caption      VARCHAR(300) NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME GENERATED ALWAYS AS (created_at + INTERVAL 24 HOUR) STORED,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE story_views (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  story_id   INT UNSIGNED NOT NULL,
  viewer_id  INT UNSIGNED NOT NULL,
  viewed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_view (story_id, viewer_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DOWN
-- DROP TABLE IF EXISTS story_views;
-- DROP TABLE IF EXISTS stories;
