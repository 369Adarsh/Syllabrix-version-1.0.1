-- ============================================================
-- FITNESS MODULE — Articles, Categories, and News
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_article_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  icon        VARCHAR(50),
  color       VARCHAR(20) DEFAULT '#3B82F6',
  sort_order  TINYINT UNSIGNED DEFAULT 0,
  is_active   TINYINT(1) DEFAULT 1,
  UNIQUE KEY uq_fac_slug (slug)
);

CREATE TABLE IF NOT EXISTS fitness_articles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED,
  title           VARCHAR(500) NOT NULL,
  slug            VARCHAR(500) NOT NULL,
  excerpt         TEXT,
  content         LONGTEXT,
  cover_image_url VARCHAR(500),
  author_name     VARCHAR(200) DEFAULT 'Syllabrix Fitness',
  read_time_min   TINYINT UNSIGNED DEFAULT 5,
  tags            JSON,
  views           INT UNSIGNED DEFAULT 0,
  is_featured     TINYINT(1) DEFAULT 0,
  is_published    TINYINT(1) DEFAULT 1,
  published_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES fitness_article_categories(id),
  UNIQUE KEY uq_fa_slug (slug),
  INDEX idx_fa_category (category_id)
);

CREATE TABLE IF NOT EXISTS fitness_news (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(500) NOT NULL,
  source          VARCHAR(200),
  source_url      VARCHAR(500),
  excerpt         TEXT,
  image_url       VARCHAR(500),
  category        VARCHAR(100),
  provider        VARCHAR(100) DEFAULT 'internal',
  published_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fn_published (published_at)
);
