ALTER TABLE current_affairs
  ADD COLUMN source_hint VARCHAR(200) NULL AFTER content_points,
  ADD COLUMN exam_relevance VARCHAR(300) NULL AFTER source_hint,
  ADD COLUMN is_ai_generated TINYINT(1) NOT NULL DEFAULT 0 AFTER exam_relevance;
