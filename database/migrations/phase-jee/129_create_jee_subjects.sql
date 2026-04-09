CREATE TABLE IF NOT EXISTS jee_subjects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_color VARCHAR(20) DEFAULT '#378ADD',
  display_order TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO jee_subjects (name, slug, icon_color, display_order) VALUES
('Physics',     'physics',     '#378ADD', 1),
('Chemistry',   'chemistry',   '#0F6E56', 2),
('Mathematics', 'mathematics', '#534AB7', 3);
